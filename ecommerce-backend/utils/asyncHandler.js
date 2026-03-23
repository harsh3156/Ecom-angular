/**
 * Wraps async route handlers to catch errors and pass to Express error handler.
 * Ensures "next is not a function" and unhandled promise rejections are avoided.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
