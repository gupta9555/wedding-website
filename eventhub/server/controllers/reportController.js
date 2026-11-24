const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Report = require('../models/Report');

// @desc    Report a piece of content (service, blog, review, or provider) as inappropriate
// @route   POST /api/reports
// @access  Private (any logged-in user)
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    throw new ErrorResponse('Please provide targetType, targetId, and reason', 400);
  }

  const report = await Report.create({
    reporterId: req.user._id,
    targetType,
    targetId,
    reason,
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted — our team will review it shortly',
    report,
  });
});

module.exports = { createReport };
