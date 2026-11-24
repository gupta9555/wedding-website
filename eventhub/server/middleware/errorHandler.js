// Centralized error handling middleware.
// Any error passed to next(err) anywhere in the app ends up here.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let error = { ...err, message: err.message };
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Mongoose bad ObjectId (e.g. GET /api/providers/not-a-valid-id)
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key (e.g. registering with an email that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error.message = `An account with this ${field} already exists`;
    statusCode = 400;
  }

  // Mongoose validation errors (e.g. missing required field, failed regex match)
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  // Multer file upload errors (wrong field name, too many files, file too large)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'Image file is too large — maximum size is 5MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.message = `Unexpected file field: '${err.field}'`;
    } else {
      error.message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
