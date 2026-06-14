/**
 * Wraps an async controller function so any thrown error / rejected
 * promise is automatically forwarded to Express's error-handling
 * middleware via next(error).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
