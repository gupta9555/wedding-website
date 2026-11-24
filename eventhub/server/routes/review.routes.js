const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  getReviewForBooking,
  deleteReview,
  toggleReviewHelpful,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('client'), createReview);
router.get('/provider/:id', getProviderReviews);
router.get('/booking/:bookingId', protect, getReviewForBooking);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, toggleReviewHelpful);

module.exports = router;
