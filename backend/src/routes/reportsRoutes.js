const express = require('express');
const {
  getTotalSalesForToday,
  getMonthlySalesSummary,
  getTopSellingMedicines,
  getLowStockMedicines,
  getMedicinesExpiringWithinDays,
  getProfitCalculationReport,
  getSalesTrend,
  getInventoryHealthReport,
  getMedicineCategoryAnalysis,
  getSupplierPerformanceReport,
} = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All reports routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/reports/sales/today
 * Get total sales for today
 */
router.get('/sales/today', getTotalSalesForToday);

/**
 * GET /api/v1/reports/sales/monthly
 * Get monthly sales summary
 * Query params: year (required), month (required)
 */
router.get('/sales/monthly', getMonthlySalesSummary);

/**
 * GET /api/v1/reports/medicines/top-selling
 * Get top 5 selling medicines
 * Query params: startDate (optional), endDate (optional), limit (optional, default 5)
 */
router.get('/medicines/top-selling', getTopSellingMedicines);

/**
 * GET /api/v1/reports/medicines/low-stock
 * Get medicines with low stock
 * Query params: threshold (optional, default 50)
 */
router.get('/medicines/low-stock', getLowStockMedicines);

/**
 * GET /api/v1/reports/medicines/expiring
 * Get medicines expiring within X days
 * Query params: days (optional, default 30)
 */
router.get('/medicines/expiring', getMedicinesExpiringWithinDays);

/**
 * GET /api/v1/reports/profit
 * Get profit calculation report
 * Query params: startDate (optional), endDate (optional)
 */
router.get('/profit', getProfitCalculationReport);

/**
 * GET /api/v1/reports/sales/trend
 * Get sales trend over time
 * Query params: startDate (optional), endDate (optional), groupBy (optional: day/week/month, default day)
 */
router.get('/sales/trend', getSalesTrend);

/**
 * GET /api/v1/reports/inventory/health
 * Get inventory health report
 */
router.get('/inventory/health', getInventoryHealthReport);

/**
 * GET /api/v1/reports/medicines/category
 * Get medicine category analysis
 * Query params: startDate (optional), endDate (optional)
 */
router.get('/medicines/category', getMedicineCategoryAnalysis);

/**
 * GET /api/v1/reports/suppliers/performance
 * Get supplier performance report
 */
router.get('/suppliers/performance', getSupplierPerformanceReport);

module.exports = router;
