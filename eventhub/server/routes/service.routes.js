const express = require('express');
const router = express.Router();
const {
  createService,
  updateService,
  deleteService,
  getMyServices,
  getAllServices,
  getServiceById,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// IMPORTANT: '/my' must be declared BEFORE '/:id', otherwise Express would
// treat "my" as an :id value.
router.get('/my', protect, authorize('provider'), getMyServices);

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
