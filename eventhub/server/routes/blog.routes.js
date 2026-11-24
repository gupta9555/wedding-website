const express = require('express');
const router = express.Router();
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllBlogs);
router.get('/:id', getBlogById); // accepts either a MongoDB _id or a slug

router.post('/', protect, authorize('provider', 'admin'), createBlog);
router.put('/:id', protect, authorize('provider', 'admin'), updateBlog);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteBlog);

module.exports = router;
