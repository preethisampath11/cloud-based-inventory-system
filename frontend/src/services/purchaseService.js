import apiClient from './api';

/**
 * Purchase Service
 * API calls for purchase order management
 */
const purchaseService = {
  /**
   * Get all purchases with optional filters
   */
  getPurchases: (filters = {}) => {
    return apiClient.get('/purchases', { params: filters });
  },

  /**
   * Get single purchase by ID
   */
  getPurchaseById: (id) => {
    return apiClient.get(`/purchases/${id}`);
  },

  /**
   * Create purchase order with batches
   */
  createPurchase: (purchaseData) => {
    return apiClient.post('/purchases', purchaseData);
  },

  /**
   * Get purchases by supplier
   */
  getPurchasesBySupplier: (supplierId) => {
    return apiClient.get(`/purchases/supplier/${supplierId}`);
  },

  /**
   * Get purchases by date range
   */
  getPurchasesByDateRange: (startDate, endDate) => {
    return apiClient.get('/purchases/date-range', {
      params: { startDate, endDate },
    });
  },

  /**
   * Mark purchase as received
   */
  markAsReceived: (purchaseId) => {
    return apiClient.patch(`/purchases/${purchaseId}/mark-received`);
  },

  /**
   * Delete purchase order
   */
  deletePurchase: (purchaseId) => {
    return apiClient.delete(`/purchases/${purchaseId}`);
  },

  /**
   * Update purchase order
   */
  updatePurchase: (purchaseId, updateData) => {
    return apiClient.put(`/purchases/${purchaseId}`, updateData);
  },
};

export default purchaseService;
