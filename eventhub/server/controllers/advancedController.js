const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ clientId: req.user._id })
    .populate({
      path: 'providerId',
      populate: { path: 'userId', select: 'name isApproved isActive' },
    })
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, favorites });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const existing = await Favorite.findOne({
    clientId: req.user._id,
    providerId: req.params.providerId,
  });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, favorited: false });
  }
  await Favorite.create({ clientId: req.user._id, providerId: req.params.providerId });
  res.status(201).json({ success: true, favorited: true });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.status(200).json({ success: true, unreadCount, notifications });
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true, unreadCount: 0 });
});

const getProviderAnalytics = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) throw new ErrorResponse('Create your provider profile first', 404);

  const [statusCounts, monthlyRevenue, reviewCount, favoritesCount] = await Promise.all([
    Booking.aggregate([
      { $match: { providerId: profile._id } },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    ]),
    Booking.aggregate([
      { $match: { providerId: profile._id, status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$eventDate' }, month: { $month: '$eventDate' } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Review.countDocuments({ providerId: profile._id }),
    Favorite.countDocuments({ providerId: profile._id }),
  ]);

  const completed = statusCounts.find((item) => item._id === 'completed');
  res.status(200).json({
    success: true,
    analytics: {
      rating: profile.rating,
      reviewCount,
      favoritesCount,
      statusCounts,
      monthlyRevenue,
      completedRevenue: completed?.revenue || 0,
    },
  });
});

const updateUnavailableDates = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) throw new ErrorResponse('Create your provider profile first', 404);

  const dates = Array.isArray(req.body.dates) ? req.body.dates : [];
  const parsed = [...new Set(dates
    .filter((value) => !Number.isNaN(Date.parse(value)))
    .map((value) => new Date(value).toISOString().slice(0, 10)))];

  profile.unavailableDates = parsed.map((value) => new Date(`${value}T00:00:00.000Z`));
  await profile.save();
  res.status(200).json({ success: true, unavailableDates: profile.unavailableDates });
});

module.exports = {
  getFavorites,
  toggleFavorite,
  getNotifications,
  markNotificationsRead,
  getProviderAnalytics,
  updateUnavailableDates,
};
