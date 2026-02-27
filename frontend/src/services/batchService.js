import apiClient from './api';

/**
 * Batch Service
 * API calls for batch management
 */
const batchService = {
  /**
   * Get all batches with optional filters
   */
  getBatches: (filters = {}) => {
    return apiClient.get('/batches', { params: filters });
  },

  /**
   * Get single batch by ID
   */
  getBatchById: (id) => {
    return apiClient.get(`/batches/${id}`);
  },

  /**
   * Get batches for a medicine
   */
  getBatchesByMedicine: (medicineId) => {
    return apiClient.get(`/batches/medicine/${medicineId}`);
  },

  /**
   * Create batch (usually through purchase)
   */
  createBatch: (batchData) => {
    return apiClient.post('/batches', batchData);
  },

  /**
   * Get low stock batches
   */
  getLowStockBatches: (threshold = 50) => {
    return apiClient.get('/batches/low-stock', {
      params: { threshold },
    });
  },

  /**
   * Get expiring batches
   */
  getExpiringBatches: (days = 30) => {
    return apiClient.get('/batches/expiring', {
      params: { days },
    });
  },

  /**
   * Get available stock for a medicine
   */
  getAvailableStock: (medicineId) => {
    return apiClient.get(`/batches/medicine/${medicineId}/available`);
  },
};

export default batchService;
