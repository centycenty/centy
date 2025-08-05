const express = require('express');
const router = express.Router();

// Placeholder for review routes
router.post('/', (req, res) => {
  res.json({ message: 'Create review' });
});

router.get('/worker/:workerId', (req, res) => {
  res.json({ message: 'Get worker reviews' });
});

module.exports = router;