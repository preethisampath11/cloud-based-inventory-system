const express = require('express');
const Joi = require('joi');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getAllUsers,
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required().min(3),
  role: Joi.string().valid('admin', 'pharmacist', 'cashier').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
});

// Public routes
/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', validateRequest(registerSchema, 'body'), register);

/**
 * POST /api/v1/auth/login
 * User login
 */
router.post('/login', validateRequest(loginSchema, 'body'), login);

// Protected routes
/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, validateRequest(updateProfileSchema, 'body'), updateProfile);

/**
 * GET /api/v1/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticate, authorize('admin'), getAllUsers);

module.exports = router;
