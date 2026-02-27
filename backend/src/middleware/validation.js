const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation Middleware Factory
 * Creates middleware to validate request data against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Where to validate ('body', 'params', 'query')
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn(`Validation error on ${source}:`, errorMessages);

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // Replace request data with validated/sanitized data
    req[source] = value;
    next();
  };
};

module.exports = {
  validateRequest,
};
