const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      // NOT required here — it's generated automatically in the pre-save hook below.
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content should be at least 50 characters'],
    },
    coverImage: {
      type: String,
      default: '', // Cloudinary URL, wired up in Phase 11
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    },
  },
  { timestamps: true }
);

// Auto-generate a unique slug from the title when a blog is first created.
// The slug intentionally does NOT change on later title edits, so permalinks
// stay stable — that's a deliberate design choice, not an oversight.
blogSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const baseSlug = slugify(this.title);
  let candidateSlug = baseSlug;
  let counter = 1;

  const BlogModel = this.constructor;
  // Keep trying candidate-1, candidate-2, ... until we find a free slug
  while (await BlogModel.exists({ slug: candidateSlug })) {
    candidateSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = candidateSlug;
  next();
});

blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model('Blog', blogSchema);
