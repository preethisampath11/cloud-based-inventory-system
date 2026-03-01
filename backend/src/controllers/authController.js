const User = require('../models/User');
const AdminRequest = require('../models/AdminRequest');
const { generateToken } = require('../utils/jwt');
const { sendAdminApprovalEmail, sendAdminApprovedEmail, sendAdminRejectedEmail } = require('../utils/emailService');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');
const crypto = require('crypto');

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

/**
 * Request Admin Access
 * User submits a request to become an admin
 */
const requestAdminAccess = async (req, res, next) => {
  try {
    const { email, password, name, reason } = req.body;

    // Check if email already exists in users or admin requests
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const existingRequest = await AdminRequest.findOne({ email });
    if (existingRequest && existingRequest.status === 'pending') {
      return next(new AppError('Admin request already submitted and pending approval', 400));
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Generate approval token
    const approvalToken = crypto.randomBytes(32).toString('hex');

    // Create admin request
    const adminRequest = await AdminRequest.create({
      email,
      password, // Will be hashed by middleware if added
      firstName,
      lastName,
      reason,
      approvalToken,
    });

    logger.info(`Admin access request created: ${email}`);

    // Send email to admin for approval
    const approvalLink = `${process.env.APP_URL || 'http://localhost:3000'}/admin/approve/${approvalToken}`;
    const rejectLink = `${process.env.APP_URL || 'http://localhost:3000'}/admin/reject/${approvalToken}`;

    let emailSent = false;
    try {
      await sendAdminApprovalEmail(adminRequest, approvalLink, rejectLink);
      emailSent = true;
      logger.info(`Approval email sent to admin: ${process.env.ADMIN_EMAIL}`);
    } catch (emailError) {
      logger.error(`Failed to send approval email to ${process.env.ADMIN_EMAIL}: ${emailError.message}`);
      // Log but don't fail - request is still created
    }

    res.status(201).json({
      status: 'success',
      message: emailSent 
        ? 'Admin access request submitted. An approval email has been sent to the admin.'
        : 'Admin access request submitted. Note: Approval notification email could not be delivered.',
      data: {
        requestId: adminRequest._id,
        emailSent,
      },
    });
  } catch (error) {
    logger.error(`Request admin access error: ${error.message}`);
    next(error);
  }
};

/**
 * Approve Admin Request
 * Admin approves a user's request to become an admin
 */
const approveAdminRequest = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rejectionReason } = req.body; // Optional - for rejection

    const adminRequest = await AdminRequest.findOne({ approvalToken: token }).select('+password');

    if (!adminRequest) {
      return next(new AppError('Invalid approval token', 400));
    }

    if (adminRequest.status !== 'pending') {
      return next(new AppError(`This request has already been ${adminRequest.status}`, 400));
    }

    // Create user from admin request
    const user = await User.create({
      email: adminRequest.email,
      password: adminRequest.password,
      firstName: adminRequest.firstName,
      lastName: adminRequest.lastName,
      role: 'admin',
    });

    // Update admin request
    adminRequest.status = 'approved';
    adminRequest.respondedAt = new Date();
    adminRequest.respondedBy = req.user?.id; // If called by authenticated admin
    adminRequest.approvalToken = undefined; // Clear token
    await adminRequest.save();

    logger.info(`Admin request approved: ${adminRequest.email}`);

    // Send approval email
    try {
      await sendAdminApprovedEmail(adminRequest.email, adminRequest.firstName);
    } catch (emailError) {
      logger.warn(`Failed to send approval confirmation email: ${emailError.message}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin access approved successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error(`Approve admin request error: ${error.message}`);
    next(error);
  }
};

/**
 * Reject Admin Request
 * Admin rejects a user's request to become an admin
 */
const rejectAdminRequest = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rejectionReason } = req.body;

    const adminRequest = await AdminRequest.findOne({ approvalToken: token });

    if (!adminRequest) {
      return next(new AppError('Invalid rejection token', 400));
    }

    if (adminRequest.status !== 'pending') {
      return next(new AppError(`This request has already been ${adminRequest.status}`, 400));
    }

    // Update admin request
    adminRequest.status = 'rejected';
    adminRequest.respondedAt = new Date();
    adminRequest.respondedBy = req.user?.id; // If called by authenticated admin
    adminRequest.rejectionReason = rejectionReason || 'Request was not approved';
    adminRequest.approvalToken = undefined; // Clear token
    await adminRequest.save();

    logger.info(`Admin request rejected: ${adminRequest.email}`);

    // Send rejection email
    try {
      await sendAdminRejectedEmail(adminRequest.email, adminRequest.firstName, rejectionReason);
    } catch (emailError) {
      logger.warn(`Failed to send rejection email: ${emailError.message}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin request rejected',
    });
  } catch (error) {
    logger.error(`Reject admin request error: ${error.message}`);
    next(error);
  }
};

/**
 * Get Admin Requests (Admin only)
 * List pending admin requests
 */
const getAdminRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const requests = await AdminRequest.find(filter)
      .populate('respondedBy', 'email firstName lastName')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: {
        requests,
      },
    });
  } catch (error) {
    logger.error(`Get admin requests error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  requestAdminAccess,
  approveAdminRequest,
  rejectAdminRequest,
  getAdminRequests,
};
