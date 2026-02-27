const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const Purchase = require('../models/Purchase');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');
const intentDetector = require('../utils/intentDetector');

/**
 * AI Assistant Service
 * Handles intent detection and execution of predefined queries
 */

const aiService = {
  /**
   * Process user question and return appropriate data
   * Flow: Detect Intent → Map to Query Function → Execute → Format Result
   */
  processQuestion: async (question) => {
    try {
      logger.info(`Processing AI question: ${question}`);

      // Step 1: Detect intent from question
      const detectedIntent = intentDetector.detectIntent(question);

      if (!detectedIntent) {
        throw new AppError('Unable to understand your question. Please ask about expiry dates, low stock, sales, profit, or reordering.', 400);
      }

      logger.info(`Detected intent: ${detectedIntent.intent} (confidence: ${detectedIntent.confidence})`);

      // Step 2: Execute corresponding query based on intent
      let result;

      switch (detectedIntent.intent) {
        case 'EXPIRY_CHECK':
          result = await aiService.queryExpiringMedicines(detectedIntent);
          break;

        case 'LOW_STOCK':
          result = await aiService.queryLowStock(detectedIntent);
          break;

        case 'SALES_SUMMARY':
          result = await aiService.querySalesSummary(detectedIntent);
          break;

        case 'PROFIT_REPORT':
          result = await aiService.queryProfitReport(detectedIntent);
          break;

        case 'REORDER_SUGGESTION':
          result = await aiService.queryReorderSuggestions(detectedIntent);
          break;

        case 'INVENTORY_HEALTH':
          result = await aiService.queryInventoryHealth(detectedIntent);
          break;

        case 'TOP_MEDICINES':
          result = await aiService.queryTopMedicines(detectedIntent);
          break;

        default:
          throw new AppError(`Intent mapping not found: ${detectedIntent.intent}`, 500);
      }

      // Step 3: Format and return result
      return {
        question,
        intent: detectedIntent.intent,
        confidence: detectedIntent.confidence,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`AI service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query medicines expiring within specified days
   */
  queryExpiringMedicines: async (intentData) => {
    try {
      const days = intentData.parameters.days || 30;

      const expiringMedicines = await Batch.aggregate([
        {
          $match: {
            isExpired: false,
            expiryDate: {
              $gte: new Date(),
              $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: '$medicine',
            totalQuantity: { $sum: '$quantityAvailable' },
            batchCount: { $sum: 1 },
            oldestExpiry: { $min: '$expiryDate' },
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
            medicineName: '$medicine.name',
            quantity: '$totalQuantity',
            batches: '$batchCount',
            expiryDate: { $dateToString: { format: '%Y-%m-%d', date: '$oldestExpiry' } },
            daysUntilExpiry: {
              $toInt: {
                $divide: [
                  { $subtract: ['$oldestExpiry', new Date()] },
                  86400000,
                ],
              },
            },
          },
        },
        {
          $sort: { oldestExpiry: 1 },
        },
        {
          $limit: 10,
        },
      ]);

      const summary = expiringMedicines.length > 0
        ? {
          count: expiringMedicines.length,
          totalAtRisk: expiringMedicines.reduce((sum, m) => sum + m.quantity, 0),
          medicines: expiringMedicines,
        }
        : {
          count: 0,
          totalAtRisk: 0,
          medicines: [],
          message: `No medicines expiring within ${days} days. Inventory looks good!`,
        };

      return summary;
    } catch (error) {
      logger.error(`Query expiring medicines error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query low stock medicines
   */
  queryLowStock: async (intentData) => {
    try {
      const threshold = intentData.parameters.threshold || 50;

      const lowStockMedicines = await Batch.aggregate([
        {
          $match: {
            isExpired: false,
            quantityAvailable: { $gt: 0, $lte: threshold },
          },
        },
        {
          $group: {
            _id: '$medicine',
            totalQuantity: { $sum: '$quantityAvailable' },
            batchCount: { $sum: 1 },
            lowestBatch: { $min: '$quantityAvailable' },
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
            medicineName: '$medicine.name',
            currentStock: '$totalQuantity',
            reorderLevel: '$medicine.reorderLevel',
            batches: '$batchCount',
            urgency: {
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
        {
          $limit: 15,
        },
      ]);

      const summary = lowStockMedicines.length > 0
        ? {
          count: lowStockMedicines.length,
          critical: lowStockMedicines.filter((m) => m.urgency === 'critical').length,
          warning: lowStockMedicines.filter((m) => m.urgency === 'warning').length,
          medicines: lowStockMedicines,
        }
        : {
          count: 0,
          critical: 0,
          warning: 0,
          medicines: [],
          message: 'All medicines have healthy stock levels.',
        };

      return summary;
    } catch (error) {
      logger.error(`Query low stock error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query sales summary for specified period
   */
  querySalesSummary: async (intentData) => {
    try {
      const period = intentData.parameters.period || 'today'; // today, week, month

      let startDate = new Date();
      let endDate = new Date();

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      const salesData = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: startDate,
              $lte: endDate,
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
            averageTransaction: { $round: ['$averageTransaction', 2] },
          },
        },
      ]);

      const summary = salesData.length > 0
        ? {
          period,
          ...salesData[0],
        }
        : {
          period,
          totalAmount: 0,
          totalDiscount: 0,
          totalTax: 0,
          netRevenue: 0,
          transactionCount: 0,
          averageTransaction: 0,
          message: `No sales recorded for ${period}.`,
        };

      return summary;
    } catch (error) {
      logger.error(`Query sales summary error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query profit report
   */
  queryProfitReport: async (intentData) => {
    try {
      const period = intentData.parameters.period || 'today';

      let startDate = new Date();
      let endDate = new Date();

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      const sales = await Sale.find({
        saleDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate('items.batch')
        .select('items totalAmount saleDate');

      let totalRevenue = 0;
      let totalCost = 0;
      let totalQuantity = 0;

      for (const sale of sales) {
        for (const item of sale.items) {
          if (item.batch) {
            const costPerUnit = item.batch.costPerUnit || 0;
            totalRevenue += item.totalPrice || 0;
            totalCost += costPerUnit * (item.quantity || 0);
            totalQuantity += item.quantity || 0;
          }
        }
      }

      const grossProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return {
        period,
        transactionCount: sales.length,
        totalQuantitySold: totalQuantity,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        profitMarginPercent: Number(profitMargin.toFixed(2)),
      };
    } catch (error) {
      logger.error(`Query profit report error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query reorder suggestions based on stock levels and reorder levels
   */
  queryReorderSuggestions: async (intentData) => {
    try {
      const medicines = await Medicine.find({ isActive: true });

      const suggestions = [];

      for (const medicine of medicines) {
        const batches = await Batch.find({
          medicine: medicine._id,
          isExpired: false,
        });

        const totalStock = batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

        if (totalStock < medicine.reorderLevel) {
          suggestions.push({
            medicineId: medicine._id,
            medicineName: medicine.name,
            currentStock: totalStock,
            reorderLevel: medicine.reorderLevel,
            suggestedOrderQuantity: medicine.reorderLevel * 2 - totalStock,
            urgency: totalStock < medicine.reorderLevel / 2 ? 'critical' : 'normal',
          });
        }
      }

      suggestions.sort((a, b) => {
        if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
        if (a.urgency !== 'critical' && b.urgency === 'critical') return 1;
        return b.suggestedOrderQuantity - a.suggestedOrderQuantity;
      });

      return {
        count: suggestions.length,
        suggestions: suggestions.slice(0, 10),
        message:
          suggestions.length === 0
            ? 'No reorders needed. All medicines are stocked above reorder levels.'
            : undefined,
      };
    } catch (error) {
      logger.error(`Query reorder suggestions error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query inventory health status
   */
  queryInventoryHealth: async (intentData) => {
    try {
      const [totalMedicines, lowStock, expiringSoon, expired, totalBatches] = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        Batch.countDocuments({
          isExpired: false,
          quantityAvailable: { $gt: 0, $lte: 50 },
        }),
        Batch.countDocuments({
          isExpired: false,
          expiryDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
        Batch.countDocuments({ isExpired: true }),
        Batch.countDocuments({ isExpired: false }),
      ]);

      const healthScore = Math.max(
        0,
        100 - (lowStock * 5 + expiringSoon * 3 + expired * 10)
      );
      const assessment =
        healthScore > 85 ? 'excellent' : healthScore > 70 ? 'good' : 'needs attention';

      return {
        activeMedicines: totalMedicines,
        totalBatches,
        activeBatches: totalBatches,
        expiredBatches: expired,
        alerts: {
          lowStockCount: lowStock,
          expiringWithin30Days: expiringSoon,
        },
        healthScore: Number(healthScore.toFixed(2)),
        assessment,
      };
    } catch (error) {
      logger.error(`Query inventory health error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Query top selling medicines
   */
  queryTopMedicines: async (intentData) => {
    try {
      const limit = intentData.parameters.limit || 5;
      const period = intentData.parameters.period || 'month';

      let startDate = new Date();
      let endDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'all':
          startDate = new Date(0);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const topMedicines = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $unwind: '$items',
        },
        {
          $group: {
            _id: '$items.medicine',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
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
            medicineName: '$medicine.name',
            quantity: '$totalQuantity',
            revenue: { $round: ['$totalRevenue', 2] },
          },
        },
        {
          $sort: { revenue: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return {
        period,
        count: topMedicines.length,
        medicines: topMedicines,
        message: topMedicines.length === 0 ? `No sales data for ${period}.` : undefined,
      };
    } catch (error) {
      logger.error(`Query top medicines error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = aiService;
