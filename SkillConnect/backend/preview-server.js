const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SkillConnect API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'User Authentication',
      'Worker Profiles',
      'Booking System',
      'Real-time Chat',
      'Rating System',
      'Geolocation',
      'Payment Integration'
    ]
  });
});

// Mock data for preview
const mockWorkers = [
  {
    id: '1',
    name: 'John Electrician',
    category: 'electrician',
    skills: ['Wiring', 'Installation', 'Repair'],
    experience: 5,
    rating: 4.8,
    reviewCount: 124,
    hourlyRate: 5000,
    location: 'Victoria Island, Lagos',
    isVerified: true,
    availability: 'available'
  },
  {
    id: '2',
    name: 'Mary Plumber',
    category: 'plumber',
    skills: ['Pipe Fixing', 'Water Systems', 'Drainage'],
    experience: 3,
    rating: 4.6,
    reviewCount: 89,
    hourlyRate: 4500,
    location: 'Ikeja, Lagos',
    isVerified: true,
    availability: 'available'
  },
  {
    id: '3',
    name: 'Ahmed Carpenter',
    category: 'carpenter',
    skills: ['Furniture Making', 'Door Installation', 'Repairs'],
    experience: 7,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 6000,
    location: 'Surulere, Lagos',
    isVerified: true,
    availability: 'available'
  }
];

const mockCategories = [
  { id: 'electrician', name: 'Electrician', icon: '⚡', count: 45 },
  { id: 'plumber', name: 'Plumber', icon: '🔧', count: 32 },
  { id: 'carpenter', name: 'Carpenter', icon: '🔨', count: 28 },
  { id: 'ac_technician', name: 'AC Technician', icon: '❄️', count: 19 },
  { id: 'tailor', name: 'Tailor', icon: '✂️', count: 41 },
  { id: 'mechanic', name: 'Mechanic', icon: '🔩', count: 23 }
];

// API Routes
app.get('/api/workers', (req, res) => {
  const { category, search, limit = 10 } = req.query;
  
  let filteredWorkers = [...mockWorkers];
  
  if (category) {
    filteredWorkers = filteredWorkers.filter(w => w.category === category);
  }
  
  if (search) {
    filteredWorkers = filteredWorkers.filter(w => 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  res.json({
    success: true,
    data: {
      workers: filteredWorkers.slice(0, parseInt(limit)),
      total: filteredWorkers.length
    }
  });
});

app.get('/api/workers/categories', (req, res) => {
  res.json({
    success: true,
    data: { categories: mockCategories }
  });
});

app.get('/api/workers/featured', (req, res) => {
  const featured = mockWorkers.sort((a, b) => b.rating - a.rating).slice(0, 3);
  res.json({
    success: true,
    data: { workers: featured }
  });
});

app.get('/api/workers/:id', (req, res) => {
  const worker = mockWorkers.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({
      success: false,
      message: 'Worker not found'
    });
  }
  
  res.json({
    success: true,
    data: { worker }
  });
});

// Auth routes (mock)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log(`📱 Mock OTP sent to ${phone}: 123456`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully (Mock: Use 123456)',
    expiresIn: 300
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (otp === '123456') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'Demo User',
          phone,
          type: 'customer',
          isVerified: true
        },
        token: 'mock-jwt-token-' + Date.now()
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP (Use 123456 for demo)'
    });
  }
});

// Booking routes (mock)
app.post('/api/bookings', (req, res) => {
  const booking = {
    id: 'booking-' + Date.now(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/workers',
      'GET /api/workers/categories',
      'GET /api/workers/featured',
      'GET /api/workers/:id',
      'POST /api/auth/send-otp',
      'POST /api/auth/verify-otp',
      'POST /api/bookings'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillConnect API Preview Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Featured workers: http://localhost:${PORT}/api/workers/featured`);
  console.log(`📋 Categories: http://localhost:${PORT}/api/workers/categories`);
  console.log(`👥 Workers: http://localhost:${PORT}/api/workers`);
  console.log(`🌍 Environment: PREVIEW MODE`);
});

module.exports = app;