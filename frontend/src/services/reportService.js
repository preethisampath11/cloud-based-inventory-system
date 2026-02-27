import apiClient from './api';

/**
 * Reports Service
 * API calls for analytics and reporting
 */
const reportService = {
  /**
   * Get sales for today
   */
  getSalesToday: () => {
    return apiClient.get('/reports/sales/today');
  },

  /**
   * Get monthly sales summary
   */
  getMonthlySales: (month, year) => {
    return apiClient.get('/reports/sales/monthly', {
      params: { month, year },
    });
  },

  /**
   * Get top selling medicines
   */
  getTopMedicines: (period = 'month', limit = 10) => {
    return apiClient.get('/reports/medicines/top-selling', {
      params: { period, limit },
    });
  },

  /**
   * Get low stock medicines
   */
  getLowStock: () => {
    return apiClient.get('/reports/medicines/low-stock');
  },

  /**
   * Get expiring medicines
   */
  getExpiringMedicines: (days = 30) => {
    return apiClient.get('/reports/medicines/expiring', {
      params: { days },
    });
  },

  /**
   * Get profit report
   */
  getProfitReport: (period = 'today') => {
    return apiClient.get('/reports/profit', {
      params: { period },
    });
  },

  /**
   * Get sales trend
   */
  getSalesTrend: (period = 'month', groupBy = 'day') => {
    return apiClient.get('/reports/sales/trend', {
      params: { period, groupBy },
    });
  },

  /**
   * Get inventory health
   */
  getInventoryHealth: () => {
    return apiClient.get('/reports/inventory/health');
  },

  /**
   * Get medicines by category
   */
  getMedicinesByCategory: () => {
    return apiClient.get('/reports/medicines/category');
  },

  /**
   * Get supplier performance
   */
  getSupplierPerformance: () => {
    return apiClient.get('/reports/suppliers/performance');
  },
};

export default reportService;
