const aiService = require('../services/aiService');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * AI Assistant Controller
 * Handles natural language queries and returns formatted results
 */

/**
 * Process AI query
 */
const processAIQuery = async (req, res, next) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || typeof question !== 'string') {
      return next(new AppError('Question must be a non-empty string', 400));
    }

    if (question.length > 500) {
      return next(new AppError('Question must be less than 500 characters', 400));
    }

    // Process the question through AI service
    const result = await aiService.processQuestion(question);

    logger.info(`AI query processed: ${result.intent}`);

    res.status(200).json({
      status: 'success',
      data: {
        result,
      },
    });
  } catch (error) {
    logger.error(`AI query error: ${error.message}`);
    next(error);
  }
};

/**
 * Get supported intents
 */
const getSupportedIntents = async (req, res, next) => {
  try {
    const intentDetector = require('../utils/intentDetector');
    const intents = intentDetector.getSupportedIntents();

    const intentsWithDescriptions = intents.map((intent) => ({
      ...intent,
      description: intentDetector.getIntentDescription(intent.intent),
      exampleQuestions: getExampleQuestions(intent.intent),
    }));

    res.status(200).json({
      status: 'success',
      data: {
        intents: intentsWithDescriptions,
      },
    });
  } catch (error) {
    logger.error(`Get intents error: ${error.message}`);
    next(error);
  }
};

/**
 * Get example questions for an intent
 */
function getExampleQuestions(intent) {
  const examples = {
    EXPIRY_CHECK: [
      'What medicines are expiring soon?',
      'Show me medicines expiring within 7 days',
      'List expired medicines',
      'Which items will expire in the next month?',
    ],
    LOW_STOCK: [
      'What medicines have low stock?',
      'Which items are running low?',
      'Show inventory shortage',
      'What needs reordering?',
    ],
    SALES_SUMMARY: [
      "What were today's sales?",
      'How much did we sell this week?',
      'Monthly revenue report',
      'Total sales for today',
    ],
    PROFIT_REPORT: [
      'What is our profit margin?',
      'How much profit did we make today?',
      'Calculate earnings for this month',
      'Show profit analysis',
    ],
    REORDER_SUGGESTION: [
      'What should I order?',
      'Suggest reorders',
      'Which medicines should we buy?',
      'What needs restocking?',
    ],
    INVENTORY_HEALTH: [
      'How is our inventory?',
      'Overall inventory status',
      'Inventory health check',
      'Current stock situation',
    ],
    TOP_MEDICINES: [
      'What are our best sellers?',
      'Top 5 selling medicines',
      'Most popular medicines',
      'Which medicines sell the most?',
    ],
  };

  return examples[intent] || [];
}

module.exports = {
  processAIQuery,
  getSupportedIntents,
};
