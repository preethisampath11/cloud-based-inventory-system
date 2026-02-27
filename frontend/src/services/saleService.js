import apiClient from './api';

/**
 * Sale Service
 * API calls for sales transactions
 */
const saleService = {
  /**
   * Get all sales with optional filters
   */
  getSales: (filters = {}) => {
    return apiClient.get('/sales', { params: filters });
  },

  /**
   * Get single sale by ID
   */
  getSaleById: (id) => {
    return apiClient.get(`/sales/${id}`);
  },

  /**
   * Create sale transaction with FIFO batch deduction
   */
  createSale: (saleData) => {
    return apiClient.post('/sales', saleData);
  },

  /**
   * Get sales by date range
   */
  getSalesByDateRange: (startDate, endDate) => {
    return apiClient.get('/sales/date-range', {
      params: { startDate, endDate },
    });
  },

  /**
   * Get available stock for sale
   */
  getAvailableStock: (medicineId) => {
    return apiClient.get(`/sales/available-stock/${medicineId}`);
  },
};

export default saleService;
