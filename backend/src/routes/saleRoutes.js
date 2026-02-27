const express = require('express');
const Joi = require('joi');
const {
  createSale,
  getAllSales,
  getSaleById,
  getSalesSummary,
  getAvailableStock,
} = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createSaleItemSchema = Joi.object({
  medicine: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  pricePerUnit: Joi.number().positive().required(),
});

const createSaleSchema = Joi.object({
  items: Joi.array().items(createSaleItemSchema).min(1).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'insurance', 'check', 'mobile_money').required(),
  discountAmount: Joi.number().min(0),
  taxAmount: Joi.number().min(0),
  notes: Joi.string(),
});

/**
 * POST /api/v1/sales
 * Create a new sale with FIFO batch deduction (Cashier only)
 */
router.post('/', authenticate, authorize('cashier', 'pharmacist'), validateRequest(createSaleSchema, 'body'), createSale);

/**
 * GET /api/v1/sales
 * Get all sales with optional filters
 * Query params: cashier, startDate, endDate, paymentMethod, minAmount, maxAmount
 */
router.get('/', authenticate, getAllSales);

/**
 * GET /api/v1/sales/:id
 * Get sale by ID
 */
router.get('/:id', authenticate, getSaleById);

/**
 * GET /api/v1/sales/summary/report
 * Get sales summary statistics
 * Query params: startDate, endDate
 */
router.get('/summary/report', authenticate, getSalesSummary);

/**
 * GET /api/v1/sales/stock/:medicineId
 * Get available stock for a medicine (FIFO order)
 */
router.get('/stock/:medicineId', authenticate, getAvailableStock);

module.exports = router;
