const AppError = require('../utils/AppError');

/**
 * Converts known error types (Mongoose validation, cast errors, etc.)
 * into a consistent AppError so the response shape is predictable.
 */
const normalizeError = (err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(messages.join(', '), 400);
  }

  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    return new AppError('Duplicate value entered', 400);
  }

  return err;
};

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Centralized error handler — must be registered last
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong on the server';

  if (!error.isOperational) {
    // Log unexpected errors for debugging
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler, notFound };
