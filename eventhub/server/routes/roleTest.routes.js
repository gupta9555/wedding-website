// Temporary demo routes used ONLY to verify that `protect` + `authorize` work
// correctly for each role. Real admin/provider/client routes with actual
// business logic will replace/extend these starting in Phase 5 onward.
// Safe to delete once those real routes exist.

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Accessible by ANY logged-in user, regardless of role
router.get('/any-logged-in-user', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Hello ${req.user.name}, you are logged in as a ${req.user.role}`,
  });
});

// Accessible ONLY by admins
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, admin ${req.user.name}. You can see this because your role is 'admin'.`,
  });
});

// Accessible ONLY by providers (or admins, since admins can usually do everything)
router.get('/provider-only', protect, authorize('provider', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, ${req.user.name}. You can see this because your role is 'provider' or 'admin'.`,
  });
});

// Accessible ONLY by clients
router.get('/client-only', protect, authorize('client'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, ${req.user.name}. You can see this because your role is 'client'.`,
  });
});

module.exports = router;
