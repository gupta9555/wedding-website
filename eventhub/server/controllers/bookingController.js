const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ProviderProfile = require('../models/ProviderProfile');
const Notification = require('../models/Notification');

// Which statuses a booking is allowed to move TO from its CURRENT status.
const ALLOWED_TRANSITIONS = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['completed', 'cancelled'],
  rejected: [],
  cancelled: [],
  completed: [],
};

// Which statuses each role is allowed to SET (subject to ALLOWED_TRANSITIONS above).
const ROLE_ALLOWED_STATUSES = {
  provider: ['accepted', 'rejected', 'completed'],
  client: ['cancelled'],
};

// @desc    Create a booking request for a service
// @route   POST /api/bookings
// @access  Private (client only)
const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, eventType, eventDate, eventTime, eventLocation, clientMessage } = req.body;

  if (!serviceId || !eventType || !eventDate || !eventTime || !eventLocation) {
    throw new ErrorResponse(
      'Please provide serviceId, eventType, eventDate, eventTime, and eventLocation',
      400
    );
  }

  const service = await Service.findById(serviceId).populate('providerId');
  if (!service) {
    throw new ErrorResponse('Service not found', 404);
  }

  if (!service.availability) {
    throw new ErrorResponse('This service is not currently accepting bookings', 400);
  }

  const providerProfile = service.providerId;
  if (!providerProfile) {
    throw new ErrorResponse('This service is no longer available', 404);
  }

  const date = new Date(eventDate);
  date.setUTCHours(0, 0, 0, 0);
  const unavailable = (providerProfile.unavailableDates || []).some((blocked) =>
    new Date(blocked).setUTCHours(0, 0, 0, 0) === date.getTime()
  );
  if (unavailable) {
    throw new ErrorResponse('This provider is unavailable on the selected date', 400);
  }

  const conflict = await Booking.findOne({
    providerId: providerProfile._id,
    eventDate: date,
    status: { $in: ['pending', 'accepted'] },
  });
  if (conflict) {
    throw new ErrorResponse('This provider already has a booking for the selected date', 400);
  }

  // totalPrice is always derived from the service's current price server-side —
  // never trust a price sent from the client.
  const booking = await Booking.create({
    clientId: req.user._id,
    providerId: providerProfile._id,
    serviceId: service._id,
    eventType,
    eventDate,
    eventTime,
    eventLocation,
    clientMessage,
    totalPrice: service.price,
    status: 'pending',
  });

  await Notification.create({
    userId: providerProfile.userId,
    title: 'New booking request',
    message: `${req.user.name} requested ${service.title}`,
    type: 'booking',
    link: '/provider/bookings',
  });

  res.status(201).json({
    success: true,
    message: 'Booking request sent successfully',
    booking,
  });
});

// @desc    Get all bookings made by the logged-in client
// @route   GET /api/bookings/client
// @access  Private (client only)
const getClientBookings = asyncHandler(async (req, res) => {
  const filter = { clientId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('serviceId', 'title price pricingType images')
    .populate({
      path: 'providerId',
      select: 'businessName city state profileImage phone email',
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

// @desc    Get all bookings received by the logged-in provider
// @route   GET /api/bookings/provider
// @access  Private (provider only)
const getProviderBookings = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  const filter = { providerId: profile._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('serviceId', 'title price pricingType images')
    .populate('clientId', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

// @desc    Get a single booking's details (owner client or owning provider only)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('serviceId', 'title price pricingType images')
    .populate('clientId', 'name email phone')
    .populate('providerId', 'businessName city state profileImage phone email');

  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }

  const isOwningClient = booking.clientId._id.toString() === req.user._id.toString();
  let isOwningProvider = false;
  if (req.user.role === 'provider') {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    isOwningProvider = profile && booking.providerId._id.toString() === profile._id.toString();
  }

  if (!isOwningClient && !isOwningProvider && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to view this booking', 403);
  }

  res.status(200).json({ success: true, booking });
});

// @desc    Update a booking's status (accept/reject/complete by provider, cancel by client)
// @route   PUT /api/bookings/:id/status
// @access  Private (client or provider — must own the booking)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ErrorResponse('Please provide a status', 400);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }

  // 1. Confirm this status is even settable by the requester's role
  const allowedForRole = ROLE_ALLOWED_STATUSES[req.user.role] || [];
  if (!allowedForRole.includes(status)) {
    throw new ErrorResponse(`As a ${req.user.role}, you cannot set status to '${status}'`, 403);
  }

  // 2. Confirm ownership of the booking
  if (req.user.role === 'client') {
    if (booking.clientId.toString() !== req.user._id.toString()) {
      throw new ErrorResponse('You are not authorized to update this booking', 403);
    }
  } else if (req.user.role === 'provider') {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile || booking.providerId.toString() !== profile._id.toString()) {
      throw new ErrorResponse('You are not authorized to update this booking', 403);
    }
  }

  // 3. Confirm this is a legal state transition from the booking's CURRENT status
  const legalNextStates = ALLOWED_TRANSITIONS[booking.status] || [];
  if (!legalNextStates.includes(status)) {
    throw new ErrorResponse(
      `Booking cannot move from '${booking.status}' to '${status}'`,
      400
    );
  }

  booking.status = status;
  booking.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: req.user._id,
  });
  await booking.save();

  if (req.user.role === 'provider') {
    await Notification.create({
      userId: booking.clientId,
      title: 'Booking status updated',
      message: `Your booking is now ${status}`,
      type: 'status',
      link: '/client/bookings',
    });
  }

  res.status(200).json({
    success: true,
    message: `Booking status updated to '${status}'`,
    booking,
  });
});

module.exports = {
  createBooking,
  getClientBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
};
