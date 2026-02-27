/**
 * Intent Detector Utility
 * Detects user intent from natural language questions
 * Uses keyword matching and pattern recognition
 * Safe approach - no external API calls, no SQL/NoSQL injection risk
 */

const intents = {
  EXPIRY_CHECK: {
    keywords: ['expir', 'expires', 'expiration', 'expire', 'expiring', 'expired', 'soon', 'shelf life'],
    parameters: {
      days: { patterns: [/(\d+)\s*(day|days)/, /within\s+(\d+)/], defaultValue: 30 },
    },
  },
  LOW_STOCK: {
    keywords: ['low', 'stock', 'inventory', 'shortage', 'out of stock', 'running low', 'depleted'],
    parameters: {
      threshold: { patterns: [/threshold.*?(\d+)/, /below\s+(\d+)/], defaultValue: 50 },
    },
  },
  SALES_SUMMARY: {
    keywords: ['sales', 'revenue', 'earn', 'income', 'transaction', 'sold', 'selling', 'total sale'],
    parameters: {
      period: { patterns: [/today|this\s+day/, /week|this\s+week/, /month|this\s+month/], defaultValue: 'today' },
    },
  },
  PROFIT_REPORT: {
    keywords: ['profit', 'margin', 'earnings', 'income', 'cost', 'expense', 'gain', 'return'],
    parameters: {
      period: { patterns: [/today|this\s+day/, /week|this\s+week/, /month|this\s+month/], defaultValue: 'today' },
    },
  },
  REORDER_SUGGESTION: {
    keywords: ['reorder', 'order', 'stock', 'purchase', 'buy', 'supplier', 'replenish', 'restock'],
    parameters: {},
  },
  INVENTORY_HEALTH: {
    keywords: ['health', 'status', 'condition', 'overall', 'inventory', 'overview', 'summary'],
    parameters: {},
  },
  TOP_MEDICINES: {
    keywords: ['top', 'best', 'selling', 'popular', 'highest', 'most', 'medicines', 'drugs'],
    parameters: {
      limit: { patterns: [/top\s+(\d+)/, /(\d+)\s+(best|top)/], defaultValue: 5 },
      period: { patterns: [/today|this\s+day/, /week|this\s+week/, /month|this\s+month/], defaultValue: 'month' },
    },
  },
};

const intentDetector = {
  /**
   * Detect intent from user question
   * Returns: { intent: string, confidence: number, parameters: {} }
   */
  detectIntent: (question) => {
    if (!question || typeof question !== 'string') {
      return null;
    }

    const lowerQuestion = question.toLowerCase();
    const matches = [];

    // Score each intent based on keyword matches
    for (const [intentName, intentConfig] of Object.entries(intents)) {
      let score = 0;
      const { keywords, parameters } = intentConfig;

      // Check keyword matches
      for (const keyword of keywords) {
        if (lowerQuestion.includes(keyword)) {
          score += 10;
        }
      }

      if (score > 0) {
        matches.push({
          intent: intentName,
          score,
          parameters: intentDetector.extractParameters(lowerQuestion, parameters),
        });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // Sort by score and pick highest
    matches.sort((a, b) => b.score - a.score);
    const topMatch = matches[0];

    // Calculate confidence (0-1)
    const confidence = Math.min(topMatch.score / 30, 1.0);

    return {
      intent: topMatch.intent,
      confidence: Number(confidence.toFixed(2)),
      parameters: topMatch.parameters,
    };
  },

  /**
   * Extract parameters from question based on patterns
   */
  extractParameters: (question, parameterConfig) => {
    const parameters = {};

    if (!parameterConfig || Object.keys(parameterConfig).length === 0) {
      return parameters;
    }

    for (const [paramName, paramConfig] of Object.entries(parameterConfig)) {
      if (paramConfig.patterns && Array.isArray(paramConfig.patterns)) {
        for (const pattern of paramConfig.patterns) {
          const match = question.match(pattern);
          if (match) {
            // Try to parse as number, otherwise use as string
            const value = match[1];
            parameters[paramName] = isNaN(value) ? value : parseInt(value, 10);
            break;
          }
        }
      }

      // Use default if not found
      if (!parameters[paramName] && paramConfig.defaultValue !== undefined) {
        parameters[paramName] = paramConfig.defaultValue;
      }
    }

    return parameters;
  },

  /**
   * Get all supported intents
   */
  getSupportedIntents: () => {
    return Object.keys(intents).map((intentName) => ({
      intent: intentName,
      keywords: intents[intentName].keywords,
    }));
  },

  /**
   * Get intent description
   */
  getIntentDescription: (intentName) => {
    const descriptions = {
      EXPIRY_CHECK: 'Check medicines that are expiring soon',
      LOW_STOCK: 'Find medicines with low stock levels',
      SALES_SUMMARY: 'Get total sales summary for a period',
      PROFIT_REPORT: 'View profit and margin analysis',
      REORDER_SUGGESTION: 'Get reorder recommendations',
      INVENTORY_HEALTH: 'Check overall inventory health status',
      TOP_MEDICINES: 'See top selling medicines',
    };
    return descriptions[intentName] || 'Unknown intent';
  },
};

module.exports = intentDetector;
