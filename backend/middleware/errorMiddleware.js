/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error(err.stack);

  // Default error status and message
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Something went wrong on the server';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  errorHandler
};