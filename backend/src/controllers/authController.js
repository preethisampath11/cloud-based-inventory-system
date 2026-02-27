const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * User Registration
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * User Login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account is inactive', 403));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * Get Current User
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};

/**
 * Update User Profile
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

/**
 * Get All Users (Admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true });

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getAllUsers,
};
