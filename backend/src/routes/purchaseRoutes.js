const express = require('express');
const Joi = require('joi');
const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  getPurchaseWithBatches,
} = require('../controllers/purchaseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createPurchaseItemSchema = Joi.object({
  medicine: Joi.string().required(),
  batchNumber: Joi.string(),
  quantity: Joi.number().integer().min(1).required(),
  costPerUnit: Joi.number().positive().required(),
  sellingPrice: Joi.number().positive().required(),
  expiryDate: Joi.date().required(),
  manufacturingDate: Joi.date(),
  notes: Joi.string(),
});

const createPurchaseSchema = Joi.object({
  supplier: Joi.string().required(),
  expectedDeliveryDate: Joi.date(),
  items: Joi.array().items(createPurchaseItemSchema).min(1).required(),
  notes: Joi.string(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'received', 'cancelled', 'partial').required(),
  actualDeliveryDate: Joi.date(),
});

/**
 * POST /api/v1/purchases
 * Create a new purchase with batch entries (Pharmacist and Admin only)
 */
router.post('/', authenticate, authorize('pharmacist', 'admin'), validateRequest(createPurchaseSchema, 'body'), createPurchase);

/**
 * GET /api/v1/purchases
 * Get all purchases with optional filters
 * Query params: status, supplier, startDate, endDate
 */
router.get('/', authenticate, getAllPurchases);

/**
 * GET /api/v1/purchases/:id
 * Get purchase by ID
 */
router.get('/:id', authenticate, getPurchaseById);

/**
 * PUT /api/v1/purchases/:id/status
 * Update purchase status (Pharmacist and Admin only)
 */
router.put('/:id/status', authenticate, authorize('pharmacist', 'admin'), validateRequest(updateStatusSchema, 'body'), updatePurchaseStatus);

/**
 * GET /api/v1/purchases/:id/batches
 * Get purchase with created batch details
 */
router.get('/:id/batches', authenticate, getPurchaseWithBatches);

module.exports = router;
