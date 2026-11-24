const mongoose = require('mongoose');
const { EVENT_TYPES } = require('../utils/constants');

const BOOKING_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];

const bookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: EVENT_TYPES,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (value) {
          // Must be today or in the future — no booking events in the past.
          //
          // IMPORTANT: this compares against UTC midnight, not the server's local
          // timezone. A date-only string like "2026-08-15" (what an HTML
          // <input type="date"> sends) is parsed by JS as UTC midnight. If we
          // compared against the SERVER's local midnight instead, a user picking
          // literally today's date could get incorrectly rejected as "in the past"
          // whenever the server's timezone has already rolled over to the next
          // calendar day ahead of the user's — e.g. a server running in IST
          // (UTC+5:30) shortly after its own local midnight, while the user's
          // browser is still on the previous UTC calendar day. Comparing in UTC
          // terms on both sides removes that whole class of false rejection,
          // regardless of what timezone the server happens to be deployed in.
          const startOfTodayUTC = new Date();
          startOfTodayUTC.setUTCHours(0, 0, 0, 0);
          return value >= startOfTodayUTC;
        },
        message: 'Event date cannot be in the past',
      },
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    eventLocation: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [300, 'Event location cannot exceed 300 characters'],
    },
    clientMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
      // Snapshotted from the service's price at the time of booking, so later
      // price changes by the provider don't retroactively alter existing bookings.
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
    },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: BOOKING_STATUSES, required: true },
          changedAt: { type: Date, default: Date.now },
          changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
      ],
      default: [
        {
          status: 'pending',
          changedAt: new Date(),
        },
      ],
    },
  },
  { timestamps: true }
);

bookingSchema.index({ clientId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
