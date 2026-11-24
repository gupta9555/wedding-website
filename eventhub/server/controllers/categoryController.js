const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Category = require('../models/Category');

// @desc    Get all active categories, optionally filtered by type
// @route   GET /api/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.type) filter.type = req.query.type;

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({ success: true, count: categories.length, categories });
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, description } = req.body;

  if (!name || !type) {
    throw new ErrorResponse('Please provide name and type', 400);
  }

  const category = await Category.create({ name, type, description });

  res.status(201).json({ success: true, message: 'Category created', category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, type, description, isActive } = req.body;
  const updates = { name, type, description, isActive };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const category = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ErrorResponse('Category not found', 404);
  }

  res.status(200).json({ success: true, message: 'Category updated', category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ErrorResponse('Category not found', 404);
  }

  await category.deleteOne();

  res.status(200).json({ success: true, message: 'Category deleted' });
});

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
