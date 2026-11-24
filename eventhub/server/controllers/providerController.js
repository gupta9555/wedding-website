const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// @desc    Create or update the logged-in provider's profile (upsert)
// @route   POST /api/providers/profile
// @route   PUT  /api/providers/profile
// @access  Private (provider only)
const upsertProfile = asyncHandler(async (req, res) => {
  const {
    businessName,
    ownerName,
    about,
    email,
    phone,
    fullAddress,
    city,
    state,
    pincode,
    experience,
    categories,
    socialLinks,
  } = req.body;

  const profileFields = {
    userId: req.user._id,
    businessName,
    ownerName,
    about,
    email,
    phone,
    fullAddress,
    city,
    state,
    pincode,
    experience,
    categories,
    socialLinks,
  };

  // Remove undefined keys so a partial PUT doesn't overwrite existing fields with undefined
  Object.keys(profileFields).forEach((key) => {
    if (profileFields[key] === undefined) delete profileFields[key];
  });

  let profile = await ProviderProfile.findOne({ userId: req.user._id });

  if (profile) {
    profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileFields },
      { new: true, runValidators: true }
    );
  } else {
    profile = await ProviderProfile.create(profileFields);
  }

  res.status(200).json({
    success: true,
    message: 'Provider profile saved successfully',
    profile,
  });
});

// @desc    Get the logged-in provider's own profile (including unapproved/pending)
// @route   GET /api/providers/profile/me
// @access  Private (provider only)
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user._id }).populate(
    'userId',
    'name email phone role isApproved isActive createdAt'
  );

  if (!profile) {
    throw new ErrorResponse('No profile found — create one first via POST /api/providers/profile', 404);
  }

  res.status(200).json({ success: true, profile });
});

// @desc    Get approved & active providers, with search/filter/pagination
// @route   GET /api/providers
// @access  Public
// Query params:
//   category   - exact match against a category in the provider's categories array
//   city       - case-insensitive partial match
//   minRating  - only providers with rating >= this value
//   search     - case-insensitive partial match against businessName or about
//   page, limit
//   sort       - 'rating' | 'experience' | 'newest' (default)
const getAllProviders = asyncHandler(async (req, res) => {
  const { category, city, state, minRating, search, sort } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  // Only show providers whose linked User account is approved and active
  const approvedUserIds = await User.find({
    role: 'provider',
    isApproved: true,
    isActive: true,
  }).distinct('_id');

  const filter = { userId: { $in: approvedUserIds } };

  if (category) {
    filter.categories = category;
  }

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }
  if (state) {
    filter.state = { $regex: state, $options: 'i' };
  }

  if (minRating) {
    const parsedRating = Number(minRating);
    if (!Number.isNaN(parsedRating)) {
      filter.rating = { $gte: parsedRating };
    }
  }

  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { about: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {
    rating: { rating: -1 },
    experience: { experience: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const [providers, total] = await Promise.all([
    ProviderProfile.find(filter)
      .populate('userId', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    ProviderProfile.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: providers.length,
    pagination: buildPaginationMeta(total, page, limit),
    providers,
  });
});

// @desc    Get a single provider's public profile by profile id
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findById(req.params.id).populate(
    'userId',
    'name email isApproved isActive'
  );

  if (!profile) {
    throw new ErrorResponse('Provider not found', 404);
  }

  if (!profile.userId || !profile.userId.isApproved || !profile.userId.isActive) {
    // Keep the same message as "not found" so unapproved providers aren't
    // distinguishable from nonexistent ones to public visitors.
    throw new ErrorResponse('Provider not found', 404);
  }

  res.status(200).json({ success: true, profile });
});

module.exports = {
  upsertProfile,
  getMyProfile,
  getAllProviders,
  getProviderById,
};
