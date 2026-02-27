const reportsService = require('../services/reportsService');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Get total sales for today
 */
const getTotalSalesForToday = async (req, res, next) => {
  try {
    const report = await reportsService.getTotalSalesForToday();

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get total sales for today error: ${error.message}`);
    next(error);
  }
};

/**
 * Get monthly sales summary
 */
const getMonthlySalesSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return next(new AppError('Year and month are required', 400));
    }

    const report = await reportsService.getMonthlySalesSummary(year, month);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get monthly sales summary error: ${error.message}`);
    next(error);
  }
};

/**
 * Get top 5 selling medicines
 */
const getTopSellingMedicines = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const filters = {
      limit: parseInt(limit),
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const report = await reportsService.getTopSellingMedicines(filters);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get top selling medicines error: ${error.message}`);
    next(error);
  }
};

/**
 * Get low stock medicines
 */
const getLowStockMedicines = async (req, res, next) => {
  try {
    const { threshold = 50 } = req.query;

    const report = await reportsService.getLowStockMedicines(parseInt(threshold));

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get low stock medicines error: ${error.message}`);
    next(error);
  }
};

/**
 * Get medicines expiring within X days
 */
const getMedicinesExpiringWithinDays = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    if (days < 1) {
      return next(new AppError('Days must be at least 1', 400));
    }

    const report = await reportsService.getMedicinesExpiringWithinDays(parseInt(days));

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get medicines expiring within days error: ${error.message}`);
    next(error);
  }
};

/**
 * Get profit calculation report
 */
const getProfitCalculationReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const report = await reportsService.getProfitCalculationReport(filters);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get profit calculation report error: ${error.message}`);
    next(error);
  }
};

/**
 * Get sales trend over time (for charts)
 */
const getSalesTrend = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const filters = {
      groupBy,
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const report = await reportsService.getSalesTrend(filters);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get sales trend error: ${error.message}`);
    next(error);
  }
};

/**
 * Get inventory health report
 */
const getInventoryHealthReport = async (req, res, next) => {
  try {
    const report = await reportsService.getInventoryHealthReport();

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get inventory health report error: ${error.message}`);
    next(error);
  }
};

/**
 * Get medicine category analysis
 */
const getMedicineCategoryAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const report = await reportsService.getMedicineCategoryAnalysis(filters);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get medicine category analysis error: ${error.message}`);
    next(error);
  }
};

/**
 * Get supplier performance report
 */
const getSupplierPerformanceReport = async (req, res, next) => {
  try {
    const report = await reportsService.getSupplierPerformanceReport();

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    logger.error(`Get supplier performance report error: ${error.message}`);
    next(error);
  }
};

module.exports = {
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
};
