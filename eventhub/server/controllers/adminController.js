const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Blog = require('../models/Blog');
const Report = require('../models/Report');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// @desc    Get platform-wide statistics for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private (admin only)
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProviders,
    totalClients,
    totalServices,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalBlogs,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'provider' }),
    User.countDocuments({ role: 'client' }),
    Service.countDocuments({}),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'completed' }),
    Blog.countDocuments({}),
    Report.countDocuments({ status: 'pending' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalBlogs,
      pendingReports,
    },
  });
});

// @desc    Get all users, optionally filtered by role/approval/search
// @route   GET /api/admin/users
// @access  Private (admin only)
// Query params: role ('admin'|'provider'|'client'), isApproved ('true'|'false'), search, page, limit
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isApproved, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (role) filter.role = role;
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: buildPaginationMeta(total, page, limit),
    users,
  });
});

// @desc    Approve a pending provider account
// @route   PUT /api/admin/users/:id/approve
// @access  Private (admin only)
const approveProvider = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  if (user.role !== 'provider') {
    throw new ErrorResponse('Only provider accounts can be approved', 400);
  }

  user.isApproved = true;
  await user.save();

  res.status(200).json({ success: true, message: 'Provider approved', user: user.toSafeObject() });
});

// @desc    Reject (un-approve) a provider account
// @route   PUT /api/admin/users/:id/reject
// @access  Private (admin only)
const rejectProvider = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  if (user.role !== 'provider') {
    throw new ErrorResponse('Only provider accounts can be rejected', 400);
  }

  user.isApproved = false;
  await user.save();

  res.status(200).json({ success: true, message: 'Provider rejected', user: user.toSafeObject() });
});

// @desc    Toggle a user's active/deactivated status (suspend or restore an account)
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (admin only)
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  if (user.role === 'admin') {
    // Prevent an admin from locking themselves (or another admin) out entirely
    throw new ErrorResponse('Admin accounts cannot be deactivated through this endpoint', 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    user: user.toSafeObject(),
  });
});

// @desc    Get every service on the platform, regardless of provider approval or availability
// @route   GET /api/admin/services
// @access  Private (admin only)
const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [services, total] = await Promise.all([
    Service.find({})
      .populate({ path: 'providerId', select: 'businessName city state', populate: { path: 'userId', select: 'name email isApproved isActive' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Service.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    count: services.length,
    pagination: buildPaginationMeta(total, page, limit),
    services,
  });
});

// @desc    Get every booking on the platform
// @route   GET /api/admin/bookings
// @access  Private (admin only)
const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('clientId', 'name email phone')
      .populate('providerId', 'businessName city state')
      .populate('serviceId', 'title price pricingType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination: buildPaginationMeta(total, page, limit),
    bookings,
  });
});

// @desc    Get all reported content, optionally filtered by status
// @route   GET /api/admin/reports
// @access  Private (admin only)
const getAllReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporterId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: reports.length,
    pagination: buildPaginationMeta(total, page, limit),
    reports,
  });
});

// @desc    Mark a report as resolved
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (admin only)
const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    throw new ErrorResponse('Report not found', 404);
  }

  report.status = 'resolved';
  report.resolutionNote = req.body.resolutionNote || '';
  await report.save();

  res.status(200).json({ success: true, message: 'Report marked as resolved', report });
});

module.exports = {
  getStats,
  getAllUsers,
  approveProvider,
  rejectProvider,
  toggleUserActive,
  getAllServicesAdmin,
  getAllBookingsAdmin,
  getAllReports,
  resolveReport,
};
