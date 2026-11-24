const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { uploadBufferToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryUploader');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');
const Blog = require('../models/Blog');

// @desc    Upload/replace the logged-in user's profile image
// @route   POST /api/upload/user/profile-image
// @access  Private (any logged-in user)
const uploadUserProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please attach an image file (field name: "image")', 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'users');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage: result.secure_url },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile image updated',
    profileImage: user.profileImage,
  });
});

// @desc    Upload/replace the logged-in provider's business profile image
// @route   POST /api/upload/provider/profile-image
// @access  Private (provider only)
const uploadProviderProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please attach an image file (field name: "image")', 400);
  }

  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'providers/profile');
  profile.profileImage = result.secure_url;
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Provider profile image updated',
    profileImage: profile.profileImage,
  });
});

// @desc    Upload/replace the logged-in provider's cover image
// @route   POST /api/upload/provider/cover-image
// @access  Private (provider only)
const uploadProviderCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please attach an image file (field name: "image")', 400);
  }

  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'providers/cover');
  profile.coverImage = result.secure_url;
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Provider cover image updated',
    coverImage: profile.coverImage,
  });
});

// @desc    Add one or more images to the logged-in provider's gallery
// @route   POST /api/upload/provider/gallery
// @access  Private (provider only)
const uploadProviderGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ErrorResponse('Please attach at least one image file (field name: "images")', 400);
  }

  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  const results = await uploadMultipleToCloudinary(req.files, 'providers/gallery');
  const newUrls = results.map((r) => r.secure_url);

  profile.gallery.push(...newUrls);
  await profile.save();

  res.status(200).json({
    success: true,
    message: `${newUrls.length} image(s) added to gallery`,
    gallery: profile.gallery,
  });
});

// @desc    Remove a single image from the logged-in provider's gallery (by URL)
// @route   DELETE /api/upload/provider/gallery
// @access  Private (provider only)
const removeProviderGalleryImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    throw new ErrorResponse('Please provide the imageUrl to remove', 400);
  }

  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  profile.gallery = profile.gallery.filter((url) => url !== imageUrl);
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Image removed from gallery',
    gallery: profile.gallery,
  });
});

// @desc    Upload/replace images for a specific service owned by the logged-in provider
// @route   POST /api/upload/service/:id
// @access  Private (provider only, must own the service)
const uploadServiceImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ErrorResponse('Please attach at least one image file (field name: "images")', 400);
  }

  const profile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!profile) {
    throw new ErrorResponse('Create your provider profile first', 400);
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    throw new ErrorResponse('Service not found', 404);
  }

  if (service.providerId.toString() !== profile._id.toString()) {
    throw new ErrorResponse('You are not authorized to update this service', 403);
  }

  const results = await uploadMultipleToCloudinary(req.files, 'services');
  const newUrls = results.map((r) => r.secure_url);

  service.images.push(...newUrls);
  await service.save();

  res.status(200).json({
    success: true,
    message: `${newUrls.length} image(s) added to service`,
    images: service.images,
  });
});

// @desc    Upload/replace the cover image for a blog post
// @route   POST /api/upload/blog/:id
// @access  Private (author, or any admin)
const uploadBlogCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please attach an image file (field name: "image")', 400);
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  const isAuthor = blog.author.toString() === req.user._id.toString();
  if (!isAuthor && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to update this blog', 403);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'blogs');
  blog.coverImage = result.secure_url;
  await blog.save();

  res.status(200).json({
    success: true,
    message: 'Blog cover image updated',
    coverImage: blog.coverImage,
  });
});

module.exports = {
  uploadUserProfileImage,
  uploadProviderProfileImage,
  uploadProviderCoverImage,
  uploadProviderGalleryImages,
  removeProviderGalleryImage,
  uploadServiceImages,
  uploadBlogCoverImage,
};
