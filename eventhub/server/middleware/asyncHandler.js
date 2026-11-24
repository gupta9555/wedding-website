// Wraps an async controller function so any thrown/rejected error
// is automatically forwarded to next(), instead of writing try/catch
// in every single controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
