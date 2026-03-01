const express = require('express');
const Joi = require('joi');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
} = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createSupplierSchema = Joi.object({
  name: Joi.string().required().trim(),
  contactPerson: Joi.string().optional().trim(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().trim(),
  address: Joi.string().optional().trim(),
  city: Joi.string().optional().trim(),
  state: Joi.string().optional().trim(),
  zipCode: Joi.string().optional().trim(),
  country: Joi.string().optional().trim(),
  taxId: Joi.string().optional().trim(),
});

const updateSupplierSchema = Joi.object({
  name: Joi.string().optional().trim(),
  contactPerson: Joi.string().optional().trim(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().trim(),
  address: Joi.string().optional().trim(),
  city: Joi.string().optional().trim(),
  state: Joi.string().optional().trim(),
  zipCode: Joi.string().optional().trim(),
  country: Joi.string().optional().trim(),
  taxId: Joi.string().optional().trim(),
  isActive: Joi.boolean().optional(),
});

/**
 * GET /api/v1/suppliers
 * Get all suppliers with optional filters
 * Public route (no authentication required)
 */
router.get('/', getAllSuppliers);

/**
 * GET /api/v1/suppliers/search
 * Search suppliers by name, contact, email, or city
 * Public route (no authentication required)
 */
router.get('/search', searchSuppliers);

/**
 * GET /api/v1/suppliers/:id
 * Get single supplier by ID
 * Public route (no authentication required)
 */
router.get('/:id', getSupplierById);

/**
 * POST /api/v1/suppliers
 * Create new supplier
 * Protected route (requires authentication and admin/pharmacist role)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'pharmacist'),
  validateRequest(createSupplierSchema, 'body'),
  createSupplier
);

/**
 * PUT /api/v1/suppliers/:id
 * Update supplier
 * Protected route (requires authentication and admin/pharmacist role)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'pharmacist'),
  validateRequest(updateSupplierSchema, 'body'),
  updateSupplier
);

/**
 * DELETE /api/v1/suppliers/:id
 * Delete supplier
 * Protected route (requires authentication and admin role)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteSupplier
);

module.exports = router;
