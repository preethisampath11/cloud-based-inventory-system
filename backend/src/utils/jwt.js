const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        role: role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );
    return token;
  } catch (error) {
    logger.error(`Error generating token: ${error.message}`);
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Decode token without verification (use carefully)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
