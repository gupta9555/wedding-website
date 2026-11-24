const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  uploadUserProfileImage,
  uploadProviderProfileImage,
  uploadProviderCoverImage,
  uploadProviderGalleryImages,
  removeProviderGalleryImage,
  uploadServiceImages,
  uploadBlogCoverImage,
} = require('../controllers/uploadController');

router.post('/user/profile-image', protect, upload.single('image'), uploadUserProfileImage);

router.post(
  '/provider/profile-image',
  protect,
  authorize('provider'),
  upload.single('image'),
  uploadProviderProfileImage
);
router.post(
  '/provider/cover-image',
  protect,
  authorize('provider'),
  upload.single('image'),
  uploadProviderCoverImage
);
router.post(
  '/provider/gallery',
  protect,
  authorize('provider'),
  upload.array('images', 10),
  uploadProviderGalleryImages
);
router.delete('/provider/gallery', protect, authorize('provider'), removeProviderGalleryImage);

router.post(
  '/service/:id',
  protect,
  authorize('provider'),
  upload.array('images', 10),
  uploadServiceImages
);

router.post(
  '/blog/:id',
  protect,
  authorize('provider', 'admin'),
  upload.single('image'),
  uploadBlogCoverImage
);

module.exports = router;
