const express = require('express');
const router = express.Router();

// Placeholder for chat routes
router.get('/rooms/:userId', (req, res) => {
  res.json({ message: 'Get chat rooms' });
});

router.post('/messages', (req, res) => {
  res.json({ message: 'Send message' });
});

module.exports = router;