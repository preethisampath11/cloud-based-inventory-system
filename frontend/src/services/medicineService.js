import apiClient from './api';

/**
 * Medicine Service
 * API calls for medicine management
 */
const medicineService = {
  /**
   * Get all medicines with optional filters
   */
  getMedicines: (filters = {}) => {
    return apiClient.get('/medicines', { params: filters });
  },

  /**
   * Get single medicine by ID
   */
  getMedicineById: (id) => {
    return apiClient.get(`/medicines/${id}`);
  },

  /**
   * Create new medicine
   */
  createMedicine: (medicineData) => {
    return apiClient.post('/medicines', medicineData);
  },

  /**
   * Update medicine
   */
  updateMedicine: (id, medicineData) => {
    return apiClient.put(`/medicines/${id}`, medicineData);
  },

  /**
   * Delete medicine (soft delete)
   */
  deleteMedicine: (id) => {
    return apiClient.delete(`/medicines/${id}`);
  },

  /**
   * Search medicines
   */
  searchMedicines: (searchTerm) => {
    return apiClient.get('/medicines/search', {
      params: { search: searchTerm },
    });
  },
};

export default medicineService;
