const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Blog = require('../models/Blog');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private (provider or admin)
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, coverImage, category, tags } = req.body;

  if (!title || !content || !category) {
    throw new ErrorResponse('Please provide title, content, and category', 400);
  }

  const blog = await Blog.create({
    title,
    content,
    coverImage,
    category,
    tags,
    author: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blog,
  });
});

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private (author, or any admin)
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  const isAuthor = blog.author.toString() === req.user._id.toString();
  if (!isAuthor && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to update this blog', 403);
  }

  const { title, content, coverImage, category, tags } = req.body;
  const updates = { title, content, coverImage, category, tags };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  // Note: updating the title does NOT change the slug (see models/Blog.js) —
  // this keeps the blog's URL stable even after edits.
  Object.assign(blog, updates);
  await blog.save();

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully',
    blog,
  });
});

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private (author, or any admin)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  const isAuthor = blog.author.toString() === req.user._id.toString();
  if (!isAuthor && req.user.role !== 'admin') {
    throw new ErrorResponse('You are not authorized to delete this blog', 403);
  }

  await blog.deleteOne();

  res.status(200).json({ success: true, message: 'Blog deleted successfully' });
});

// @desc    Get all blogs — public, with search/filter/pagination
// @route   GET /api/blogs
// @access  Public
// Query params: category, tag, search, page, limit, sort ('newest' default | 'oldest')
const getAllBlogs = asyncHandler(async (req, res) => {
  const { category, tag, search, sort } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };
  if (tag) filter.tags = tag.toLowerCase();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const sortBy = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name profileImage role')
      .select('-content') // omit full content in list view — keeps the response light
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: blogs.length,
    pagination: buildPaginationMeta(total, page, limit),
    blogs,
  });
});

// @desc    Get a single blog's full details, by MongoDB _id OR by slug
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

  const blog = await Blog.findOne(query).populate('author', 'name profileImage role');

  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  res.status(200).json({ success: true, blog });
});

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
};
