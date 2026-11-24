const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  approveProvider,
  rejectProvider,
  toggleUserActive,
  getAllServicesAdmin,
  getAllBookingsAdmin,
  getAllReports,
  resolveReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Every route below requires a logged-in admin — applied once here instead of
// repeating `protect, authorize('admin')` on every single line.
router.use(protect, authorize('admin'));

router.get('/stats', getStats);

router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveProvider);
router.put('/users/:id/reject', rejectProvider);
router.put('/users/:id/toggle-active', toggleUserActive);

router.get('/services', getAllServicesAdmin);
router.get('/bookings', getAllBookingsAdmin);

router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

// NOTE: admin blog/service/review moderation reuses the existing endpoints from
// earlier phases (they already accept an admin token):
//   POST/PUT/DELETE /api/blogs        (Phase 9 — admin can edit/delete ANY blog)
//   DELETE /api/services/:id           (Phase 6 — admin can delete ANY service)
//   DELETE /api/reviews/:id            (Phase 10 — admin can delete ANY review)

module.exports = router;
