const express = require('express');
const router = express.Router();

// Placeholder for admin routes
router.get('/users', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.patch('/users/:id/verify', (req, res) => {
  res.json({ message: 'Verify user' });
});

module.exports = router;