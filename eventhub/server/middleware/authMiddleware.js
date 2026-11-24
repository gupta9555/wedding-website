const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Verifies the JWT sent in the Authorization header ("Bearer <token>")
// and attaches the logged-in user to req.user for downstream handlers.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ErrorResponse('Not authorized, no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data (password excluded by default via select:false)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ErrorResponse('Not authorized, user no longer exists', 401);
    }

    if (!user.isActive) {
      throw new ErrorResponse('This account has been deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ErrorResponse) throw error;
    throw new ErrorResponse('Not authorized, invalid or expired token', 401);
  }
});

// Restricts a route to specific roles. Must be used AFTER `protect`,
// since it relies on req.user being already set.
//
// Usage: router.delete('/:id', protect, authorize('admin'), deleteSomething)
//        router.post('/services', protect, authorize('provider', 'admin'), createService)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check — should never happen if `protect` runs first,
      // but fail safely instead of assuming.
      throw new ErrorResponse('Not authorized, please log in', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ErrorResponse(
        `Role '${req.user.role}' is not permitted to perform this action`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
