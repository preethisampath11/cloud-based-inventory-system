const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Must be defined after all other middleware and routes
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details
  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);

  // Don't expose error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
};
