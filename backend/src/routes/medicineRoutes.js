const express = require('express');
const Joi = require('joi');
const { addMedicine, getAllMedicines, getMedicineById, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const addMedicineSchema = Joi.object({
  name: Joi.string().required(),
  genericName: Joi.string(),
  description: Joi.string(),
  dosageForm: Joi.string().valid('tablet', 'capsule', 'liquid', 'injection', 'cream', 'powder', 'drops', 'patch'),
  dosageStrength: Joi.string(),
  manufacturer: Joi.string(),
  category: Joi.string(),
  reorderLevel: Joi.number().integer().min(0),
});

const updateMedicineSchema = Joi.object({
  name: Joi.string(),
  genericName: Joi.string(),
  description: Joi.string(),
  dosageForm: Joi.string().valid('tablet', 'capsule', 'liquid', 'injection', 'cream', 'powder', 'drops', 'patch'),
  dosageStrength: Joi.string(),
  manufacturer: Joi.string(),
  category: Joi.string(),
  reorderLevel: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
});

/**
 * POST /api/v1/medicines
 * Add a new medicine (Pharmacist and Admin only)
 */
router.post('/', authenticate, authorize('pharmacist', 'admin'), validateRequest(addMedicineSchema, 'body'), addMedicine);

/**
 * GET /api/v1/medicines
 * Get all medicines with optional filters
 * Query params: search, category, isActive
 */
router.get('/', authenticate, getAllMedicines);

/**
 * GET /api/v1/medicines/:id
 * Get single medicine by ID
 */
router.get('/:id', authenticate, getMedicineById);

/**
 * PUT /api/v1/medicines/:id
 * Update medicine (Pharmacist and Admin only)
 */
router.put('/:id', authenticate, authorize('pharmacist', 'admin'), validateRequest(updateMedicineSchema, 'body'), updateMedicine);

/**
 * DELETE /api/v1/medicines/:id
 * Delete medicine (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteMedicine);

module.exports = router;
