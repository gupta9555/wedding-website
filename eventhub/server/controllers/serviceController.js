const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Service = require('../models/Service');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// Helper: get the logged-in provider's ProviderProfile, or throw a clear error
// telling them to create one first (Phase 5 must be done before Phase 6).
const getOwnProviderProfile = async (userId) => {
  const profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    throw new ErrorResponse(
      'Create your provider profile first via POST /api/providers/profile before adding services',
      400
    );
  }
  return profile;
};

// @desc    Create a new service under the logged-in provider's profile
// @route   POST /api/services
// @access  Private (provider only)
const createService = asyncHandler(async (req, res) => {
  const profile = await getOwnProviderProfile(req.user._id);

  const { title, description, category, price, pricingType, images, availability } = req.body;

  const service = await Service.create({
    providerId: profile._id,
    title,
    description,
    category,
    price,
    pricingType,
    images,
    availability,
  });

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    service,
  });
});

// @desc    Update a service owned by the logged-in provider
// @route   PUT /api/services/:id
// @access  Private (provider only, must own the service)
const updateService = asyncHandler(async (req, res) => {
  const profile = await getOwnProviderProfile(req.user._id);

  const service = await Service.findById(req.params.id);
  if (!service) {
    throw new ErrorResponse('Service not found', 404);
  }

  if (service.providerId.toString() !== profile._id.toString()) {
    throw new ErrorResponse('You are not authorized to update this service', 403);
  }

  const { title, description, category, price, pricingType, images, availability } = req.body;
  const updates = { title, description, category, price, pricingType, images, availability };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const updatedService = await Service.findByIdAndUpdate(req.params.id, { $set: updates }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    service: updatedService,
  });
});

// @desc    Delete a service (owning provider, or an admin removing inappropriate content)
// @route   DELETE /api/services/:id
// @access  Private (provider who owns it, or admin)
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    throw new ErrorResponse('Service not found', 404);
  }

  if (req.user.role === 'admin') {
    // Admins can delete any service (e.g. removing inappropriate listings)
    await service.deleteOne();
    return res.status(200).json({ success: true, message: 'Service deleted by admin' });
  }

  const profile = await getOwnProviderProfile(req.user._id);
  if (service.providerId.toString() !== profile._id.toString()) {
    throw new ErrorResponse('You are not authorized to delete this service', 403);
  }

  await service.deleteOne();
  res.status(200).json({ success: true, message: 'Service deleted successfully' });
});

// @desc    Get all services belonging to the logged-in provider (any availability state)
// @route   GET /api/services/my
// @access  Private (provider only)
const getMyServices = asyncHandler(async (req, res) => {
  const profile = await getOwnProviderProfile(req.user._id);
  const services = await Service.find({ providerId: profile._id }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: services.length, services });
});

// @desc    Get services from approved/active providers, with search/filter/pagination
// @route   GET /api/services
// @access  Public
// Query params:
//   category    - exact match on the service's category
//   city        - matches the owning provider's city (case-insensitive)
//   minPrice, maxPrice - price range
//   pricingType - exact match ('per event' | 'per day' | 'per person' | 'starting from')
//   rating      - only services whose provider has rating >= this value
//   search      - case-insensitive partial match against title or description
//   providerId  - restrict to a single provider's services (used on the provider profile page)
//   page, limit
//   sort        - 'priceLow' | 'priceHigh' | 'newest' (default)
const getAllServices = asyncHandler(async (req, res) => {
  const { category, city, minPrice, maxPrice, pricingType, rating, search, sort, providerId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const approvedUserIds = await User.find({
    role: 'provider',
    isApproved: true,
    isActive: true,
  }).distinct('_id');

  // Providers can additionally be narrowed by city/rating before we ever look at services
  const providerFilter = { userId: { $in: approvedUserIds } };
  if (city) {
    providerFilter.city = { $regex: city, $options: 'i' };
  }
  if (rating) {
    const parsedRating = Number(rating);
    if (!Number.isNaN(parsedRating)) {
      providerFilter.rating = { $gte: parsedRating };
    }
  }
  const eligibleProviderIds = await ProviderProfile.find(providerFilter).distinct('_id');

  const filter = {
    providerId: { $in: eligibleProviderIds },
    availability: true,
  };

  // Narrow further to one specific provider, e.g. GET /api/services?providerId=<id>
  // for a provider's public profile page. Still constrained to eligibleProviderIds
  // above, so an unapproved provider's services still won't leak through this filter.
  if (providerId) {
    filter.providerId = eligibleProviderIds.some((id) => id.toString() === providerId)
      ? providerId
      : null; // no match — forces an empty result instead of ignoring the filter
  }

  if (category) {
    filter.category = category;
  }

  if (pricingType) {
    filter.pricingType = pricingType;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !Number.isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
    if (maxPrice && !Number.isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('providerId', 'businessName city state profileImage rating')
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Service.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: services.length,
    pagination: buildPaginationMeta(total, page, limit),
    services,
  });
});

// @desc    Get a single service's public details
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate(
    'providerId',
    'businessName city state profileImage rating phone email'
  );

  if (!service) {
    throw new ErrorResponse('Service not found', 404);
  }

  res.status(200).json({ success: true, service });
});

module.exports = {
  createService,
  updateService,
  deleteService,
  getMyServices,
  getAllServices,
  getServiceById,
};
