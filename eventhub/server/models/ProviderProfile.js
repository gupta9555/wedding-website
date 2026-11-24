const mongoose = require('mongoose');
const { PROVIDER_CATEGORIES } = require('../utils/constants');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per provider account
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '', // Cloudinary URL, wired up in Phase 11
    },
    coverImage: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      maxlength: [1500, 'About section cannot exceed 1500 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Business contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Business contact phone is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    fullAddress: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    categories: {
      type: [String],
      enum: PROVIDER_CATEGORIES,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Select at least one category',
      },
    },
    gallery: {
      type: [String], // Cloudinary URLs, wired up in Phase 11
      default: [],
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      website: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    // Aggregate rating fields — kept in sync by the review controller (Phase 10)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    unavailableDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
