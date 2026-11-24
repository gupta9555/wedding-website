const express = require('express');
const router = express.Router();

// GET /api/health -> simple check used by frontend to confirm backend connectivity
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventHub API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
