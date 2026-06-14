/**
 * Custom error class that carries an HTTP status code.
 * Throwing this from a controller lets the centralized error handler
 * return the right status code and message to the client.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
