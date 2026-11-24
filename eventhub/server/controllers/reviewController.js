const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// Recalculates a provider's aggregate rating + review count from scratch,
// based on every review currently in the database for them. Called after
// every create/delete so ProviderProfile.rating never drifts out of sync.
const recalculateProviderRating = async (providerId) => {
  const stats = await Review.aggregate([
    { $match: { providerId } },
    {
      $group: {
        _id: '$providerId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const numReviews = stats.length > 0 ? stats[0].numReviews : 0;

  await ProviderProfile.findByIdAndUpdate(providerId, { rating, numReviews });
};

// @desc    Create a review for a provider, tied to a specific completed booking
// @route   POST /api/reviews
// @access  Private (client only)
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    throw new ErrorResponse('Please provide bookingId and rating', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }

  if (booking.clientId.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('You can only review your own bookings', 403);
  }

  if (booking.status !== 'completed') {
    throw new ErrorResponse('You can only review a service after the booking is completed', 400);
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new ErrorResponse('You have already reviewed this booking', 400);
  }

  const review = await Review.create({
    clientId: req.user._id,
    providerId: booking.providerId,
    bookingId,
    rating,
    comment,
  });

  await recalculateProviderRating(booking.providerId);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

// @desc    Get all reviews for a specific provider (public)
// @route   GET /api/reviews/provider/:id
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { providerId: req.params.id };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('clientId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: buildPaginationMeta(total, page, limit),
    reviews,
  });
});

// @desc    Check whether a specific booking has already been reviewed
// @route   GET /api/reviews/booking/:bookingId
// @access  Private (the booking's client or provider)
const getReviewForBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }

  const isOwningClient = booking.clientId.toString() === req.user._id.toString();
  let isOwningProvider = false;
  if (req.user.role === 'provider') {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    isOwningProvider = profile && booking.providerId.toString() === profile._id.toString();
  }

  if (!isOwningClient && !isOwningProvider && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to view this', 403);
  }

  const review = await Review.findOne({ bookingId: req.params.bookingId });

  res.status(200).json({ success: true, review: review || null });
});

// @desc    Delete a review (author, or an admin moderating inappropriate content)
// @route   DELETE /api/reviews/:id
// @access  Private (author or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ErrorResponse('Review not found', 404);
  }

  const isAuthor = review.clientId.toString() === req.user._id.toString();
  if (!isAuthor && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to delete this review', 403);
  }

  const { providerId } = review;
  await review.deleteOne();
  await recalculateProviderRating(providerId);

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});

const toggleReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ErrorResponse('Review not found', 404);

  const userId = req.user._id.toString();
  const alreadyHelpful = review.helpfulBy.some((id) => id.toString() === userId);
  if (alreadyHelpful) {
    review.helpfulBy = review.helpfulBy.filter((id) => id.toString() !== userId);
  } else {
    review.helpfulBy.push(req.user._id);
  }
  await review.save();
  res.status(200).json({
    success: true,
    helpful: !alreadyHelpful,
    helpfulCount: review.helpfulBy.length,
  });
});

module.exports = {
  createReview,
  getProviderReviews,
  getReviewForBooking,
  deleteReview,
  toggleReviewHelpful,
};
