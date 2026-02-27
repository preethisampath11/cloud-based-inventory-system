const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const logger = require('../utils/logger');
const AppError = require('../utils/errorClass');

/**
 * Reports Service
 * Uses MongoDB aggregation pipeline for complex analytics
 */

const reportsService = {
  /**
   * Get total sales for today
   * Returns: total amount, count, average transaction, payment methods breakdown
   */
  getTotalSalesForToday: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: today,
              $lt: tomorrow,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            totalTax: { $sum: '$taxAmount' },
            netRevenue: { $sum: { $subtract: ['$totalAmount', '$discountAmount'] } },
            transactionCount: { $sum: 1 },
            averageTransaction: { $avg: '$totalAmount' },
            minTransaction: { $min: '$totalAmount' },
            maxTransaction: { $max: '$totalAmount' },
          },
        },
        {
          $project: {
            _id: 0,
            date: today,
            totalAmount: { $round: ['$totalAmount', 2] },
            totalDiscount: { $round: ['$totalDiscount', 2] },
            totalTax: { $round: ['$totalTax', 2] },
            netRevenue: { $round: ['$netRevenue', 2] },
            transactionCount: 1,
            averageTransaction: { $round: ['$averageTransaction', 2] },
            minTransaction: { $round: ['$minTransaction', 2] },
            maxTransaction: { $round: ['$maxTransaction', 2] },
          },
        },
      ]);

      if (result.length === 0) {
        return {
          date: today,
          totalAmount: 0,
          totalDiscount: 0,
          totalTax: 0,
          netRevenue: 0,
          transactionCount: 0,
          averageTransaction: 0,
          minTransaction: 0,
          maxTransaction: 0,
        };
      }

      return result[0];
    } catch (error) {
      logger.error(`Get total sales for today service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get monthly sales summary
   * Returns: daily breakdown, weekly summary, totals
   */
  getMonthlySalesSummary: async (year, month) => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const dailySales = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$saleDate',
              },
            },
            totalAmount: { $sum: '$totalAmount' },
            transactionCount: { $sum: 1 },
            totalDiscount: { $sum: '$discountAmount' },
            totalTax: { $sum: '$taxAmount' },
            averageTransaction: { $avg: '$totalAmount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const monthlyTotal = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            totalTax: { $sum: '$taxAmount' },
            netRevenue: { $sum: { $subtract: ['$totalAmount', '$discountAmount'] } },
            transactionCount: { $sum: 1 },
            averageDaily: { $avg: '$totalAmount' },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmount: { $round: ['$totalAmount', 2] },
            totalDiscount: { $round: ['$totalDiscount', 2] },
            totalTax: { $round: ['$totalTax', 2] },
            netRevenue: { $round: ['$netRevenue', 2] },
            transactionCount: 1,
            averageDaily: { $round: ['$averageDaily', 2] },
          },
        },
      ]);

      return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        daily: dailySales.map((day) => ({
          date: day._id,
          totalAmount: Number(day.totalAmount.toFixed(2)),
          transactionCount: day.transactionCount,
          discount: Number(day.totalDiscount.toFixed(2)),
          tax: Number(day.totalTax.toFixed(2)),
          average: Number(day.averageTransaction.toFixed(2)),
        })),
        summary: monthlyTotal.length > 0 ? monthlyTotal[0] : {
          totalAmount: 0,
          totalDiscount: 0,
          totalTax: 0,
          netRevenue: 0,
          transactionCount: 0,
          averageDaily: 0,
        },
      };
    } catch (error) {
      logger.error(`Get monthly sales summary service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get top 5 selling medicines
   * Returns: medicine name, quantity sold, revenue, profit margin
   */
  getTopSellingMedicines: async (filters = {}) => {
    try {
      const { startDate, endDate, limit = 5 } = filters;
      const matchStage = {};

      if (startDate || endDate) {
        matchStage.saleDate = {};
        if (startDate) matchStage.saleDate.$gte = startDate;
        if (endDate) matchStage.saleDate.$lte = endDate;
      }

      const result = await Sale.aggregate([
        {
          $match: matchStage,
        },
        {
          $unwind: '$items',
        },
        {
          $group: {
            _id: '$items.medicine',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            averagePrice: { $avg: '$items.pricePerUnit' },
            transactionCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'medicines',
            localField: '_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        {
          $unwind: '$medicine',
        },
        {
          $project: {
            _id: 1,
            medicineName: '$medicine.name',
            genericName: '$medicine.genericName',
            dosageForm: '$medicine.dosageForm',
            totalQuantity: 1,
            totalRevenue: { $round: ['$totalRevenue', 2] },
            averagePrice: { $round: ['$averagePrice', 2] },
            transactionCount: 1,
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return {
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'all-time',
        },
        topMedicines: result,
      };
    } catch (error) {
      logger.error(`Get top selling medicines service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get low stock medicines
   * Returns: medicine info, current stock, threshold, alert status
   */
  getLowStockMedicines: async (threshold = 50) => {
    try {
      const result = await Batch.aggregate([
        {
          $match: {
            isExpired: false,
            quantityAvailable: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: '$medicine',
            totalQuantity: { $sum: '$quantityAvailable' },
            batchCount: { $sum: 1 },
            oldestExpiry: { $min: '$expiryDate' },
            lowestStock: { $min: '$quantityAvailable' },
          },
        },
        {
          $match: {
            totalQuantity: { $lte: threshold },
          },
        },
        {
          $lookup: {
            from: 'medicines',
            localField: '_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        {
          $unwind: '$medicine',
        },
        {
          $project: {
            _id: 1,
            medicineName: '$medicine.name',
            genericName: '$medicine.genericName',
            dosageForm: '$medicine.dosageForm',
            reorderLevel: '$medicine.reorderLevel',
            currentStock: '$totalQuantity',
            batchCount: 1,
            oldestExpiry: { $dateToString: { format: '%Y-%m-%d', date: '$oldestExpiry' } },
            lowestStock: 1,
            urgency:
              {
                $cond: [
                  { $lte: ['$totalQuantity', { $divide: ['$medicine.reorderLevel', 2] }] },
                  'critical',
                  'warning',
                ],
              },
          },
        },
        {
          $sort: { currentStock: 1 },
        },
      ]);

      return {
        threshold,
        medicineCount: result.length,
        medicines: result,
      };
    } catch (error) {
      logger.error(`Get low stock medicines service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get medicines expiring within X days
   * Returns: medicine info, expiry date, batches affected, days remaining
   */
  getMedicinesExpiringWithinDays: async (days = 30) => {
    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const result = await Batch.aggregate([
        {
          $match: {
            isExpired: false,
            expiryDate: {
              $gte: now,
              $lte: expiryDate,
            },
          },
        },
        {
          $group: {
            _id: '$medicine',
            totalQuantity: { $sum: '$quantityAvailable' },
            batchCount: { $sum: 1 },
            oldestExpiry: { $min: '$expiryDate' },
            batches: {
              $push: {
                batchId: '$_id',
                batchNumber: '$batchNumber',
                quantity: '$quantityAvailable',
                expiryDate: '$expiryDate',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'medicines',
            localField: '_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        {
          $unwind: '$medicine',
        },
        {
          $project: {
            _id: 1,
            medicineName: '$medicine.name',
            genericName: '$medicine.genericName',
            totalQuantity: 1,
            batchCount: 1,
            oldestExpiryDate: { $dateToString: { format: '%Y-%m-%d', date: '$oldestExpiry' } },
            daysUntilExpiration: {
              $toInt: {
                $divide: [
                  { $subtract: ['$oldestExpiry', now] },
                  86400000, // milliseconds in a day
                ],
              },
            },
            batches: {
              $map: {
                input: '$batches',
                as: 'batch',
                in: {
                  batchNumber: '$$batch.batchNumber',
                  quantity: '$$batch.quantity',
                  expiryDate: { $dateToString: { format: '%Y-%m-%d', date: '$$batch.expiryDate' } },
                },
              },
            },
            priority:
              {
                $cond: [
                  { $lte: [{ $subtract: ['$oldestExpiry', now] }, 604800000] }, // 7 days in ms
                  'urgent',
                  'warning',
                ],
              },
          },
        },
        {
          $sort: { oldestExpiry: 1 },
        },
      ]);

      return {
        withinDays: days,
        medicineCount: result.length,
        totalQuantityAtRisk: result.reduce((sum, med) => sum + med.totalQuantity, 0),
        medicines: result,
      };
    } catch (error) {
      logger.error(`Get medicines expiring within days service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get profit calculation report
   * Returns: cost of goods sold, revenue, gross profit, profit margin
   */
  getProfitCalculationReport: async (filters = {}) => {
    try {
      const matchStage = {};

      if (filters.startDate || filters.endDate) {
        matchStage.saleDate = {};
        if (filters.startDate) matchStage.saleDate.$gte = filters.startDate;
        if (filters.endDate) matchStage.saleDate.$lte = filters.endDate;
      }

      // Get all sales with batch cost data
      const sales = await Sale.find(matchStage)
        .populate('items.batch')
        .populate('items.medicine')
        .select('items totalAmount saleDate discountAmount');

      let totalRevenue = 0;
      let totalCost = 0;
      let totalQuantity = 0;
      const medicineProfit = {};

      for (const sale of sales) {
        for (const item of sale.items) {
          if (item.batch) {
            const costPerUnit = item.batch.costPerUnit || 0;
            const quantity = item.quantity || 0;
            const revenue = item.totalPrice || 0;

            totalQuantity += quantity;
            totalRevenue += revenue;
            totalCost += costPerUnit * quantity;

            const medName = item.medicine.name;
            if (!medicineProfit[medName]) {
              medicineProfit[medName] = {
                medicine: item.medicine.name,
                quantity: 0,
                revenue: 0,
                cost: 0,
              };
            }

            medicineProfit[medName].quantity += quantity;
            medicineProfit[medName].revenue += revenue;
            medicineProfit[medName].cost += costPerUnit * quantity;
          }
        }
      }

      const grossProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // Calculate profit per medicine
      const medicineProfits = Object.values(medicineProfit).map((med) => ({
        ...med,
        profit: med.revenue - med.cost,
        marginPercent: med.revenue > 0 ? ((med.revenue - med.cost) / med.revenue) * 100 : 0,
        revenue: Number(med.revenue.toFixed(2)),
        cost: Number(med.cost.toFixed(2)),
        profit: Number((med.revenue - med.cost).toFixed(2)),
        marginPercent: Number((med.revenue > 0 ? ((med.revenue - med.cost) / med.revenue) * 100 : 0).toFixed(2)),
      }));

      return {
        period: {
          startDate: filters.startDate || 'all-time',
          endDate: filters.endDate || 'all-time',
        },
        summary: {
          totalQuantitySold: totalQuantity,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalCost: Number(totalCost.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(2)),
          profitMarginPercent: Number(profitMargin.toFixed(2)),
        },
        byMedicine: medicineProfits.sort((a, b) => b.profit - a.profit),
      };
    } catch (error) {
      logger.error(`Get profit calculation report service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get sales trend over time for charts
   * Returns: time-series data grouped by day/week/month
   */
  getSalesTrend: async (filters = {}) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = filters;
      const matchStage = {};

      if (startDate || endDate) {
        matchStage.saleDate = {};
        if (startDate) matchStage.saleDate.$gte = startDate;
        if (endDate) matchStage.saleDate.$lte = endDate;
      }

      let dateFormat = '%Y-%m-%d'; // day
      if (groupBy === 'week') {
        dateFormat = '%Y-W%V'; // week
      } else if (groupBy === 'month') {
        dateFormat = '%Y-%m'; // month
      }

      const result = await Sale.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: '$saleDate',
              },
            },
            totalAmount: { $sum: '$totalAmount' },
            transactionCount: { $sum: 1 },
            averageTransaction: { $avg: '$totalAmount' },
            totalDiscount: { $sum: '$discountAmount' },
            totalTax: { $sum: '$taxAmount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            totalAmount: { $round: ['$totalAmount', 2] },
            transactionCount: 1,
            averageTransaction: { $round: ['$averageTransaction', 2] },
            totalDiscount: { $round: ['$totalDiscount', 2] },
            totalTax: { $round: ['$totalTax', 2] },
          },
        },
      ]);

      return {
        groupBy,
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'all-time',
        },
        data: result,
      };
    } catch (error) {
      logger.error(`Get sales trend service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get inventory health report
   * Returns: total medicines, stock status, expiry risk, reorder recommendations
   */
  getInventoryHealthReport: async () => {
    try {
      const now = new Date();

      const [totalMedicines, lowStock, expiringSoon, expired, totalBatches, totalValue] = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        Batch.countDocuments({
          isExpired: false,
          quantityAvailable: { $gt: 0, $lte: 50 },
        }),
        Batch.countDocuments({
          isExpired: false,
          expiryDate: {
            $gte: now,
            $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
        Batch.countDocuments({ isExpired: true }),
        Batch.countDocuments({ isExpired: false }),
        Batch.aggregate([
          {
            $match: { isExpired: false },
          },
          {
            $group: {
              _id: null,
              totalValue: {
                $sum: {
                  $multiply: ['$quantityAvailable', '$sellingPrice'],
                },
              },
            },
          },
        ]),
      ]);

      const totalInventoryValue = totalValue.length > 0 ? totalValue[0].totalValue : 0;

      return {
        metrics: {
          activeMedicines: totalMedicines,
          totalBatches,
          activeBatches: totalBatches,
          expiredBatches: expired,
          estimatedInventoryValue: Number(totalInventoryValue.toFixed(2)),
        },
        alerts: {
          lowStockCount: lowStock,
          expiringWithin30Days: expiringSoon,
          expiredCount: expired,
          criticalStatus: lowStock > 0 || expiringSoon > 0,
        },
        healthScore:
          {
            value:
              (
                ((totalBatches - expired) / (totalBatches || 1)) * 100 -
                (lowStock * 5 + expiringSoon * 3 + expired * 10)
              ).toFixed(2),
            assessment:
              lowStock === 0 && expiringSoon === 0 && expired === 0 ? 'excellent' : lowStock > 5 || expired > 2
                ? 'critical'
                : 'good',
          },
      };
    } catch (error) {
      logger.error(`Get inventory health report service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get medicine category analysis
   * Returns: sales by category, popular dosage forms, category profit
   */
  getMedicineCategoryAnalysis: async (filters = {}) => {
    try {
      const matchStage = {};

      if (filters.startDate || filters.endDate) {
        matchStage.saleDate = {};
        if (filters.startDate) matchStage.saleDate.$gte = filters.startDate;
        if (filters.endDate) matchStage.saleDate.$lte = filters.endDate;
      }

      const result = await Sale.aggregate([
        {
          $match: matchStage,
        },
        {
          $unwind: '$items',
        },
        {
          $lookup: {
            from: 'medicines',
            localField: 'items.medicine',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        {
          $unwind: '$medicine',
        },
        {
          $group: {
            _id: {
              category: '$medicine.category',
              dosageForm: '$medicine.dosageForm',
            },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            transactionCount: { $sum: 1 },
            medicineCount: { $addToSet: '$medicine._id' },
          },
        },
        {
          $project: {
            category: '$_id.category',
            dosageForm: '$_id.dosageForm',
            totalQuantity: 1,
            totalRevenue: { $round: ['$totalRevenue', 2] },
            transactionCount: 1,
            uniqueMedicines: { $size: '$medicineCount' },
            _id: 0,
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
      ]);

      return {
        period: {
          startDate: filters.startDate || 'all-time',
          endDate: filters.endDate || 'all-time',
        },
        categories: result,
      };
    } catch (error) {
      logger.error(`Get medicine category analysis service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get supplier performance report
   * Returns: supplier efficiency, delivery metrics, cost analysis
   */
  getSupplierPerformanceReport: async () => {
    try {
      const result = await Purchase.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: '$supplier',
            totalPurchases: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            batchesReceived: {
              $sum: {
                $cond: [{ $eq: ['$status', 'received'] }, 1, 0],
              },
            },
            pendingBatches: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
              },
            },
            partialBatches: {
              $sum: {
                $cond: [{ $eq: ['$status', 'partial'] }, 1, 0],
              },
            },
            averagePurchaseAmount: { $avg: '$totalAmount' },
          },
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: '_id',
            foreignField: '_id',
            as: 'supplier',
          },
        },
        {
          $unwind: '$supplier',
        },
        {
          $project: {
            _id: 1,
            supplierName: '$supplier.name',
            supplierEmail: '$supplier.email',
            totalPurchases: 1,
            totalAmount: { $round: ['$totalAmount', 2] },
            batchesReceived: 1,
            pendingBatches: 1,
            partialBatches: 1,
            completionRate: {
              $round: [
                {
                  $divide: [
                    '$batchesReceived',
                    { $add: ['$batchesReceived', '$pendingBatches', '$partialBatches'] },
                  ],
                },
                2,
              ],
            },
            averagePurchaseAmount: { $round: ['$averagePurchaseAmount', 2] },
          },
        },
        {
          $sort: { totalAmount: -1 },
        },
      ]);

      return {
        suppliers: result,
        summary: {
          totalSuppliers: result.length,
          totalPurchases: result.reduce((sum, s) => sum + s.totalPurchases, 0),
          totalSpent: Number(
            result.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)
          ),
        },
      };
    } catch (error) {
      logger.error(`Get supplier performance report service error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = reportsService;
