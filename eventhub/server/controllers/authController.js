const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// Roles a user is allowed to self-register as.
// "admin" accounts must be created directly in the database / a seed script,
// never through the public API.
const ALLOWED_SELF_REGISTER_ROLES = ['client', 'provider'];

// @desc    Register a new user (client or provider)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    throw new ErrorResponse('Please provide name, email, password and phone', 400);
  }

  const requestedRole = role && ALLOWED_SELF_REGISTER_ROLES.includes(role) ? role : 'client';

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ErrorResponse('An account with this email already exists', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: requestedRole,
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  // password has select:false on the schema, so we opt in explicitly here
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ErrorResponse('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new ErrorResponse('This account has been deactivated', 403);
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Log out current user
// @route   POST /api/auth/logout
// @access  Private
// Since we use stateless Bearer JWTs (stored in localStorage on the frontend),
// there is no server-side session to destroy. This endpoint exists mainly so
// the frontend has a consistent API call to make; the actual "logout" is the
// client deleting its stored token.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get the currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by the protect middleware
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

// @desc    Request a password reset token
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ErrorResponse('Please provide an email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Respond the same way whether or not the user exists, so attackers can't
  // use this endpoint to discover which emails are registered.
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent',
    });
  }

  // Generate a plain token to send to the user, but store only its hash in the DB
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // NOTE: Actual email sending (via nodemailer + EMAIL_* env vars) will be wired up
  // in a later phase. For now we log the link so it can be tested manually/in Postman.
  console.log(`Password reset link for ${user.email}: ${resetUrl}`);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent',
    // devResetUrl is only included to make local testing possible before email is wired up.
    // Remove this field once real email sending is implemented.
    devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
  });
});

// @desc    Reset password using a valid reset token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ErrorResponse('Please provide a new password', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    throw new ErrorResponse('Invalid or expired reset token', 400);
  }

  user.password = password; // pre-save hook will hash this automatically
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token,
    user: user.toSafeObject(),
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
