import apiClient from './api';

/**
 * AI Service
 * API calls for AI assistant queries
 */
const aiService = {
  /**
   * Process natural language question
   */
  query: (question) => {
    return apiClient.post('/ai/query', { question });
  },

  /**
   * Get supported intents
   */
  getIntents: () => {
    return apiClient.get('/ai/intents');
  },
};

export default aiService;
