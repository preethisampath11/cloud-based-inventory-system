const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/errorClass');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('No token provided. Please login', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(new AppError('Invalid or expired token', 401));
  }
};

/**
 * Authorization Middleware (Role-based)
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user role is authorized
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${roles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
