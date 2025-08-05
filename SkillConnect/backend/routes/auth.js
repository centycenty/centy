const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');

const router = express.Router();

// In production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'skillconnect_jwt_secret_key_2024';
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Temporary OTP storage (use Redis in production)
const otpStore = new Map();

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send SMS (using Twilio)
const sendSMS = async (phone, message) => {
  try {
    // In demo mode, just log the OTP
    console.log(`📱 SMS to ${phone}: ${message}`);
    return { success: true };
    
    // Uncomment for actual Twilio integration:
    /*
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    return { success: true };
    */
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP endpoint
router.post('/send-otp', [
  body('phone').isMobilePhone('en-NG').withMessage('Invalid Nigerian phone number')
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

    const { phone } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store OTP with expiry
    otpStore.set(phone, { otp, expiresAt });

    // Send OTP via SMS
    const smsResult = await sendSMS(phone, `Your SkillConnect verification code is: ${otp}`);
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY / 1000 // seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('phone').isMobilePhone('en-NG').withMessage('Invalid Nigerian phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
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

    const { phone, otp } = req.body;
    
    // Check if OTP exists and is valid
    const storedOTPData = otpStore.get(phone);
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    const { otp: storedOTP, expiresAt } = storedOTPData;

    // Check if OTP is expired
    if (Date.now() > expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify OTP
    if (otp !== storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Remove OTP from store
    otpStore.delete(phone);

    // Check if user exists in Firestore
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('phone', '==', phone).get();

    let user;
    let isNewUser = false;

    if (userQuery.empty) {
      // Create new user
      isNewUser = true;
      const newUserData = {
        phone,
        isVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newUserRef = await usersRef.add(newUserData);
      user = { id: newUserRef.id, ...newUserData };
    } else {
      // Existing user
      const userDoc = userQuery.docs[0];
      user = { id: userDoc.id, ...userDoc.data() };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        type: user.type || 'customer'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: isNewUser ? 'User created successfully' : 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          type: user.type || 'customer',
          isVerified: user.isVerified,
          profileImage: user.profileImage
        },
        token,
        isNewUser
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register/Update user profile
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone('en-NG').withMessage('Invalid Nigerian phone number'),
  body('type').isIn(['customer', 'worker']).withMessage('Invalid user type')
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

    const { name, email, phone, type, ...additionalData } = req.body;

    const db = admin.firestore();
    const usersRef = db.collection('users');
    
    // Find user by phone
    const userQuery = await usersRef.where('phone', '==', phone).get();
    
    if (userQuery.empty) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please verify your phone number first.'
      });
    }

    const userDoc = userQuery.docs[0];
    const updateData = {
      name,
      email,
      type,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };

    // If user is a worker, add worker-specific fields
    if (type === 'worker') {
      const { category, skills, experience, hourlyRate, location } = additionalData;
      updateData.category = category;
      updateData.skills = skills || [];
      updateData.experience = experience || 0;
      updateData.hourlyRate = hourlyRate || 0;
      updateData.location = location;
      updateData.availability = 'available';
      updateData.rating = 0;
      updateData.reviewCount = 0;
    }

    await userDoc.ref.update(updateData);

    // Get updated user data
    const updatedUser = await userDoc.ref.get();
    const userData = { id: updatedUser.id, ...updatedUser.data() };

    // Generate new JWT token with updated info
    const token = jwt.sign(
      { 
        userId: userData.id, 
        phone: userData.phone,
        type: userData.type
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          type: userData.type,
          isVerified: userData.isVerified,
          profileImage: userData.profileImage
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token
router.post('/refresh-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        phone: decoded.phone,
        type: decoded.type
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;