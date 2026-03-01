const express = require('express');
const Joi = require('joi');
const {
  getAllBatches,
  addBatch,
  getBatchesByMedicine,
  filterBatchesByExpiry,
  getLowStockBatches,
  updateBatchQuantity,
} = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const addBatchSchema = Joi.object({
  medicine: Joi.string().required(),
  batchNumber: Joi.string().required(),
  supplier: Joi.string().required(),
  quantityReceived: Joi.number().integer().min(1).required(),
  expiryDate: Joi.date().required(),
  manufacturingDate: Joi.date(),
  costPerUnit: Joi.number().positive().required(),
  sellingPrice: Joi.number().positive().required(),
  purchaseDate: Joi.date(),
  notes: Joi.string(),
});

const updateQuantitySchema = Joi.object({
  quantityAvailable: Joi.number().integer().min(0).required(),
});

/**
 * GET /api/v1/batches
 * Get all batches with optional filters
 * Query params: medicine, supplier, status, sortBy
 */
router.get('/', authenticate, getAllBatches);

/**
 * POST /api/v1/batches
 * Add a new batch (Pharmacist and Admin only)
 */
router.post('/', authenticate, authorize('pharmacist', 'admin'), validateRequest(addBatchSchema, 'body'), addBatch);

/**
 * GET /api/v1/batches/medicine/:medicineId
 * Get batches by medicine ID
 */
router.get('/medicine/:medicineId', authenticate, getBatchesByMedicine);

/**
 * GET /api/v1/batches/expiry/filter
 * Filter batches by expiry date
 * Query params: expiryBefore, expiryAfter, includeExpired
 */
router.get('/expiry/filter', authenticate, filterBatchesByExpiry);

/**
 * GET /api/v1/batches/stock/low
 * Get low stock batches (less than 50% available)
 */
router.get('/stock/low', authenticate, getLowStockBatches);

/**
 * PUT /api/v1/batches/:batchId/quantity
 * Update batch quantity (Pharmacist and Admin only)
 */
router.put('/:batchId/quantity', authenticate, authorize('pharmacist', 'admin'), validateRequest(updateQuantitySchema, 'body'), updateBatchQuantity);

module.exports = router;
