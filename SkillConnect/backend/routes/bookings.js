const express = require('express');
const { body, query, validationResult } = require('express-validator');
const admin = require('firebase-admin');

const router = express.Router();

// Create a new booking
router.post('/', [
  body('workerId').notEmpty().withMessage('Worker ID is required'),
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('scheduledDate').isISO8601().withMessage('Invalid date format'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('location').isObject().withMessage('Location must be an object'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.latitude').isFloat().withMessage('Latitude must be a number'),
  body('location.longitude').isFloat().withMessage('Longitude must be a number')
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
      customerId,
      workerId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      location,
      images = []
    } = req.body;

    const db = admin.firestore();

    // Verify worker exists and is available
    const workerDoc = await db.collection('users').doc(workerId).get();
    if (!workerDoc.exists || workerDoc.data().type !== 'worker') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    const workerData = workerDoc.data();
    if (workerData.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Worker is not available for bookings'
      });
    }

    // Create booking
    const bookingData = {
      customerId,
      workerId,
      category: workerData.category,
      title,
      description,
      scheduledDate: admin.firestore.Timestamp.fromDate(new Date(scheduledDate)),
      scheduledTime,
      location,
      status: 'pending',
      images,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const bookingRef = await db.collection('bookings').add(bookingData);

    // Send notification to worker (implement push notification here)
    console.log(`📱 Notification to worker ${workerId}: New booking request`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: bookingRef.id,
        ...bookingData,
        scheduledDate: scheduledDate // Return original date format
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bookings for a user
router.get('/user/:userId', [
  query('status').optional().isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const db = admin.firestore();

    // Get user to determine if they're a customer or worker
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userType = userDoc.data().type;
    const field = userType === 'worker' ? 'workerId' : 'customerId';

    let query = db.collection('bookings').where(field, '==', userId);

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const bookings = [];

    // Get additional user data for each booking
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Get the other user's data (customer or worker)
      const otherUserId = userType === 'worker' ? data.customerId : data.workerId;
      const otherUserDoc = await db.collection('users').doc(otherUserId).get();
      const otherUserData = otherUserDoc.exists ? otherUserDoc.data() : null;

      bookings.push({
        id: doc.id,
        ...data,
        scheduledDate: data.scheduledDate?.toDate?.() || data.scheduledDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        completedAt: data.completedAt?.toDate?.() || data.completedAt,
        [userType === 'worker' ? 'customer' : 'worker']: otherUserData ? {
          id: otherUserId,
          name: otherUserData.name,
          phone: otherUserData.phone,
          profileImage: otherUserData.profileImage
        } : null
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: bookings.length,
          totalPages: Math.ceil(bookings.length / limit),
          hasMore: endIndex < bookings.length
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = admin.firestore();
    const bookingDoc = await db.collection('bookings').doc(id).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const data = bookingDoc.data();

    // Get customer and worker data
    const [customerDoc, workerDoc] = await Promise.all([
      db.collection('users').doc(data.customerId).get(),
      db.collection('users').doc(data.workerId).get()
    ]);

    const booking = {
      id: bookingDoc.id,
      ...data,
      scheduledDate: data.scheduledDate?.toDate?.() || data.scheduledDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      completedAt: data.completedAt?.toDate?.() || data.completedAt,
      customer: customerDoc.exists ? {
        id: data.customerId,
        name: customerDoc.data().name,
        phone: customerDoc.data().phone,
        profileImage: customerDoc.data().profileImage
      } : null,
      worker: workerDoc.exists ? {
        id: data.workerId,
        name: workerDoc.data().name,
        phone: workerDoc.data().phone,
        category: workerDoc.data().category,
        rating: workerDoc.data().rating,
        profileImage: workerDoc.data().profileImage
      } : null
    };

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update booking status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string')
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

    const { id } = req.params;
    const { status, reason, price } = req.body;

    const db = admin.firestore();
    const bookingDoc = await db.collection('bookings').doc(id).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (reason) {
      updateData.reason = reason;
    }

    if (price && status === 'accepted') {
      updateData.price = price;
    }

    if (status === 'completed') {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await bookingDoc.ref.update(updateData);

    // Send notification to the other user
    const bookingData = bookingDoc.data();
    const notificationUserId = status === 'accepted' || status === 'rejected' ? 
      bookingData.customerId : bookingData.workerId;
    
    console.log(`📱 Notification to user ${notificationUserId}: Booking ${status}`);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: {
        bookingId: id,
        status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel booking
router.delete('/:id', [
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const db = admin.firestore();
    const bookingDoc = await db.collection('bookings').doc(id).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const bookingData = bookingDoc.data();

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(bookingData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or already cancelled booking'
      });
    }

    await bookingDoc.ref.update({
      status: 'cancelled',
      reason: reason || 'Cancelled by user',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send notification to the other user
    const notificationUserId = bookingData.workerId;
    console.log(`📱 Notification to user ${notificationUserId}: Booking cancelled`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: id,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;