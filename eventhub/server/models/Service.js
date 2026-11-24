const mongoose = require('mongoose');
const { PROVIDER_CATEGORIES } = require('../utils/constants');

const PRICING_TYPES = ['per event', 'per day', 'per person', 'starting from'];

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: PROVIDER_CATEGORIES,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    pricingType: {
      type: String,
      required: [true, 'Pricing type is required'],
      enum: PRICING_TYPES,
    },
    images: {
      type: [String], // Cloudinary URLs, wired up in Phase 11
      default: [],
    },
    availability: {
      type: Boolean,
      default: true, // false = provider has paused bookings for this service
    },
  },
  { timestamps: true }
);

serviceSchema.index({ providerId: 1 });
serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
module.exports.PRICING_TYPES = PRICING_TYPES;
