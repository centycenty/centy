const express = require('express');
const { body, query, validationResult } = require('express-validator');
const admin = require('firebase-admin');

const router = express.Router();

// Get all workers with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('location').optional().isString().withMessage('Location must be a string'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      category,
      location,
      search,
      minRating,
      maxRate,
      availability = 'available'
    } = req.query;

    const db = admin.firestore();
    let query = db.collection('users').where('type', '==', 'worker');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }

    if (availability) {
      query = query.where('availability', '==', availability);
    }

    if (minRating) {
      query = query.where('rating', '>=', parseFloat(minRating));
    }

    // Execute query
    const snapshot = await query.get();
    let workers = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      workers.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        skills: data.skills || [],
        experience: data.experience || 0,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        hourlyRate: data.hourlyRate,
        location: data.location,
        availability: data.availability,
        isVerified: data.isVerified || false,
        profileImage: data.profileImage,
        portfolio: data.portfolio || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    // Apply additional filters (for fields that can't be filtered in Firestore)
    if (search) {
      const searchTerm = search.toLowerCase();
      workers = workers.filter(worker => 
        worker.name?.toLowerCase().includes(searchTerm) ||
        worker.skills?.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        worker.category?.toLowerCase().includes(searchTerm)
      );
    }

    if (location) {
      workers = workers.filter(worker => 
        worker.location?.city?.toLowerCase().includes(location.toLowerCase()) ||
        worker.location?.state?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (maxRate) {
      workers = workers.filter(worker => 
        worker.hourlyRate <= parseFloat(maxRate)
      );
    }

    // Sort by rating and review count
    workers.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkers = workers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        workers: paginatedWorkers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: workers.length,
          totalPages: Math.ceil(workers.length / limit),
          hasMore: endIndex < workers.length
        }
      }
    });

  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get worker by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = admin.firestore();
    const workerDoc = await db.collection('users').doc(id).get();

    if (!workerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    const data = workerDoc.data();

    if (data.type !== 'worker') {
      return res.status(404).json({
        success: false,
        message: 'User is not a worker'
      });
    }

    // Get recent reviews
    const reviewsSnapshot = await db.collection('reviews')
      .where('workerId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const reviews = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    const worker = {
      id: workerDoc.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      skills: data.skills || [],
      experience: data.experience || 0,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      hourlyRate: data.hourlyRate,
      location: data.location,
      availability: data.availability,
      isVerified: data.isVerified || false,
      profileImage: data.profileImage,
      portfolio: data.portfolio || [],
      certifications: data.certifications || [],
      guarantor: data.guarantor,
      idVerification: data.idVerification,
      reviews,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

    res.json({
      success: true,
      data: { worker }
    });

  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get featured workers
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const db = admin.firestore();
    const snapshot = await db.collection('users')
      .where('type', '==', 'worker')
      .where('availability', '==', 'available')
      .where('isVerified', '==', true)
      .orderBy('rating', 'desc')
      .orderBy('reviewCount', 'desc')
      .limit(parseInt(limit))
      .get();

    const workers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      workers.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        hourlyRate: data.hourlyRate,
        location: data.location,
        isVerified: data.isVerified || false,
        profileImage: data.profileImage
      });
    });

    res.json({
      success: true,
      data: { workers }
    });

  } catch (error) {
    console.error('Get featured workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get worker categories with counts
router.get('/categories/stats', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users')
      .where('type', '==', 'worker')
      .where('availability', '==', 'available')
      .get();

    const categoryCounts = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    const categories = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      available: count
    }));

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;