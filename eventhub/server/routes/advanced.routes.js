const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getFavorites,
  toggleFavorite,
  getNotifications,
  markNotificationsRead,
  getProviderAnalytics,
  updateUnavailableDates,
} = require('../controllers/advancedController');

router.get('/favorites', protect, authorize('client'), getFavorites);
router.put('/favorites/:providerId', protect, authorize('client'), toggleFavorite);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.get('/analytics/provider', protect, authorize('provider'), getProviderAnalytics);
router.put('/availability', protect, authorize('provider'), updateUnavailableDates);

module.exports = router;
