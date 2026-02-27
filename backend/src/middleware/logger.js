const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`[${req.method}] ${req.originalUrl}`);

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

module.exports = {
  requestLogger,
};
