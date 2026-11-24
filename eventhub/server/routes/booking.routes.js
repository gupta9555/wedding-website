const express = require('express');
const router = express.Router();
const {
  createBooking,
  getClientBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// IMPORTANT: '/client' and '/provider' must be declared BEFORE '/:id',
// otherwise Express would treat them as an :id value.
router.get('/client', protect, authorize('client'), getClientBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);

router.post('/', protect, authorize('client'), createBooking);
router.put('/:id/status', protect, authorize('client', 'provider'), updateBookingStatus);
router.get('/:id', protect, getBookingById);

module.exports = router;
