const mongoose = require('mongoose');

const REPORT_TARGET_TYPES = ['service', 'blog', 'review', 'provider'];
const REPORT_STATUSES = ['pending', 'resolved'];

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: REPORT_TARGET_TYPES,
      required: [true, 'Target type is required'],
    },
    // Polymorphic reference — intentionally not a `ref` to a single model,
    // since it can point at a Service, Blog, Review, or ProviderProfile
    // depending on targetType. The admin controller resolves it manually.
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target id is required'],
    },
    reason: {
      type: String,
      required: [true, 'A reason for the report is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'pending',
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
module.exports.REPORT_TARGET_TYPES = REPORT_TARGET_TYPES;
