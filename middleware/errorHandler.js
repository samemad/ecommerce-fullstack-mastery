// 1. Custom Error Classes for all possible errors that u might face !!🌚
const { ApiError, ValidationError, AuthError } = require('../utils/errors');
// Now you can check: if (err instanceof ValidationError)

const errorHandler = (err, req, res, next) => {
  console.log('🔥 Error caught by global handler:', err.message);
  
  // Operational errors (we expect these)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.field && { field: err.field })
      }
    });
  }

  // Database unique constraint errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'Email already exists'
      }
    });
  }

  // Unexpected errors (programming bugs)
  console.error('💥 Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our end'
    }
  });
};

module.exports = errorHandler;