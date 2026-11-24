const express = require('express');
const router = express.Router();
const {
  upsertProfile,
  getMyProfile,
  getAllProviders,
  getProviderById,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// IMPORTANT: '/profile/me' must be declared BEFORE '/:id',
// otherwise Express would treat "profile" as an :id value.
router.get('/profile/me', protect, authorize('provider'), getMyProfile);
router.post('/profile', protect, authorize('provider'), upsertProfile);
router.put('/profile', protect, authorize('provider'), upsertProfile);

router.get('/', getAllProviders);
router.get('/:id', getProviderById);

module.exports = router;
