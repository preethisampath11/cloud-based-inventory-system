const express = require('express');
const Joi = require('joi');
const { processAIQuery, getSupportedIntents } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const querySchema = Joi.object({
  question: Joi.string().required().max(500).min(3).messages({
    'string.empty': 'Question cannot be empty',
    'string.max': 'Question must be less than 500 characters',
    'string.min': 'Question must be at least 3 characters',
  }),
});

/**
 * POST /api/v1/ai/query
 * Process natural language question and return structured data
 * 
 * Request body:
 * {
 *   "question": "What medicines are expiring soon?"
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "data": {
 *     "result": {
 *       "question": "...",
 *       "intent": "EXPIRY_CHECK",
 *       "confidence": 0.95,
 *       "data": {...},
 *       "timestamp": "..."
 *     }
 *   }
 * }
 */
router.post('/query', authenticate, validateRequest(querySchema, 'body'), processAIQuery);

/**
 * GET /api/v1/ai/intents
 * Get list of supported intents and example questions
 * 
 * Response:
 * {
 *   "status": "success",
 *   "data": {
 *     "intents": [
 *       {
 *         "intent": "EXPIRY_CHECK",
 *         "keywords": [...],
 *         "description": "...",
 *         "exampleQuestions": [...]
 *       }
 *     ]
 *   }
 * }
 */
router.get('/intents', authenticate, getSupportedIntents);

module.exports = router;
