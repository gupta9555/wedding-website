const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    // 'provider' categories are used for ProviderProfile.categories / Service.category
    // 'event' categories are used for Booking.eventType
    type: {
      type: String,
      enum: ['provider', 'event'],
      required: [true, 'Category type is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
