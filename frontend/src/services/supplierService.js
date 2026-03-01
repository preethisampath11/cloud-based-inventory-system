import apiClient from './api';

/**
 * Supplier Service
 * API calls for supplier management
 */
const supplierService = {
  /**
   * Get all suppliers
   */
  getSuppliers: (filters = {}) => {
    return apiClient.get('/suppliers', { params: filters });
  },

  /**
   * Get single supplier by ID
   */
  getSupplierById: (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },

  /**
   * Create new supplier
   */
  createSupplier: (supplierData) => {
    return apiClient.post('/suppliers', supplierData);
  },

  /**
   * Update supplier
   */
  updateSupplier: (id, supplierData) => {
    return apiClient.put(`/suppliers/${id}`, supplierData);
  },

  /**
   * Delete supplier
   */
  deleteSupplier: (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  },

  /**
   * Search suppliers by name or contact
   */
  searchSuppliers: (searchTerm) => {
    return apiClient.get('/suppliers/search', {
      params: { search: searchTerm },
    });
  },
};

export default supplierService;
