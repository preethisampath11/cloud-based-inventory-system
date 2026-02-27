const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Sale Service
 * Handles business logic for sales including FIFO batch deduction
 */

const saleService = {
  /**
   * Create sale with FIFO batch deduction
   * Implements transaction-like logic:
   * 1. Validate availability across all medicines
   * 2. Deduct stock from oldest batches (by expiry date)
   * 3. Create sale record
   * 4. If any step fails, rollback is applied
   */
  createSaleWithFIFODeduction: async (saleData) => {
    try {
      const { items, cashierId, paymentMethod, discountAmount, taxAmount, notes } = saleData;

      // Step 1: Validate and collect batch information for each item
      const saleItems = [];
      const batchUpdates = []; // Track batch updates for potential rollback

      let totalAmount = 0;
      let totalQuantity = 0;

      for (const item of items) {
        const { medicine, quantity, pricePerUnit } = item;

        // Fetch all available batches for this medicine, sorted by expiry (FIFO)
        const availableBatches = await Batch.find({
          medicine,
          isExpired: false,
          quantityAvailable: { $gt: 0 },
        })
          .populate('medicine')
          .sort({ expiryDate: 1 }); // Oldest (earliest expiry) first

        if (availableBatches.length === 0) {
          throw new AppError(`No available stock for medicine ${medicine}`, 400);
        }

        // Calculate total available quantity
        const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

        if (totalAvailable < quantity) {
          throw new AppError(
            `Insufficient stock for medicine. Available: ${totalAvailable}, Requested: ${quantity}`,
            400
          );
        }

        // FIFO Logic: Deduct from oldest batch(es) first
        let remainingQuantity = quantity;
        const itemBatches = [];

        for (const batch of availableBatches) {
          if (remainingQuantity <= 0) break;

          const deductQuantity = Math.min(remainingQuantity, batch.quantityAvailable);

          itemBatches.push({
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            deductQuantity,
            previousQuantity: batch.quantityAvailable,
            newQuantity: batch.quantityAvailable - deductQuantity,
          });

          batchUpdates.push({
            batchId: batch._id,
            oldQuantity: batch.quantityAvailable,
            newQuantity: batch.quantityAvailable - deductQuantity,
          });

          remainingQuantity -= deductQuantity;
        }

        const totalPrice = quantity * pricePerUnit;
        totalAmount += totalPrice;
        totalQuantity += quantity;

        saleItems.push({
          medicine,
          batch: availableBatches[0]._id, // Reference to primary batch used
          quantity,
          pricePerUnit,
          totalPrice,
          batchDetails: itemBatches, // Track which batches were used
        });
      }

      // Step 2: Update batch quantities (atomic-like operation)
      try {
        for (const update of batchUpdates) {
          await Batch.findByIdAndUpdate(update.batchId, { quantityAvailable: update.newQuantity });
        }
      } catch (error) {
        // Rollback: Restore batch quantities
        logger.error(`Batch update failed, rolling back: ${error.message}`);
        for (const update of batchUpdates) {
          await Batch.findByIdAndUpdate(update.batchId, { quantityAvailable: update.oldQuantity });
        }
        throw new AppError('Failed to update batch quantities. Transaction rolled back.', 500);
      }

      // Step 3: Create sale record
      let sale;
      try {
        sale = await Sale.create({
          saleDate: new Date(),
          cashier: cashierId,
          items: saleItems,
          totalAmount,
          paymentMethod,
          discountAmount,
          taxAmount,
          notes,
        });
      } catch (error) {
        // Rollback: Restore batch quantities
        logger.error(`Sale creation failed, rolling back: ${error.message}`);
        for (const update of batchUpdates) {
          await Batch.findByIdAndUpdate(update.batchId, { quantityAvailable: update.oldQuantity });
        }
        throw new AppError('Failed to create sale. Transaction rolled back.', 500);
      }

      // Populate and return
      const populatedSale = await Sale.findById(sale._id)
        .populate('cashier', 'email firstName lastName')
        .populate('items.batch')
        .populate('items.medicine');

      logger.info(
        `Sale created: ${sale._id} for ${totalQuantity} items. Total: ${totalAmount}. Batches updated: ${batchUpdates.length}`
      );

      return populatedSale;
    } catch (error) {
      logger.error(`Create sale with FIFO deduction service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get sales with filtering
   */
  getSales: async (filters = {}) => {
    try {
      const query = {};

      if (filters.cashier) {
        query.cashier = filters.cashier;
      }

      if (filters.startDate || filters.endDate) {
        query.saleDate = {};
        if (filters.startDate) {
          query.saleDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.saleDate.$lte = new Date(filters.endDate);
        }
      }

      if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters.minAmount || filters.maxAmount) {
        query.totalAmount = {};
        if (filters.minAmount) {
          query.totalAmount.$gte = parseFloat(filters.minAmount);
        }
        if (filters.maxAmount) {
          query.totalAmount.$lte = parseFloat(filters.maxAmount);
        }
      }

      const sales = await Sale.find(query)
        .populate('cashier', 'email firstName lastName')
        .populate('items.batch')
        .populate('items.medicine')
        .sort({ saleDate: -1 });

      return sales;
    } catch (error) {
      logger.error(`Get sales service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get sale by ID with full details
   */
  getSaleById: async (saleId) => {
    try {
      const sale = await Sale.findById(saleId)
        .populate('cashier', 'email firstName lastName')
        .populate('items.batch')
        .populate('items.medicine');

      if (!sale) {
        throw new AppError('Sale not found', 404);
      }

      return sale;
    } catch (error) {
      logger.error(`Get sale by ID service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get sales summary statistics
   */
  getSalesSummary: async (filters = {}) => {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.saleDate = {};
        if (filters.startDate) {
          query.saleDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.saleDate.$lte = new Date(filters.endDate);
        }
      }

      const sales = await Sale.find(query)
        .populate('cashier', 'email firstName lastName')
        .populate('items.medicine');

      const summary = {
        totalSales: sales.length,
        totalRevenue: 0,
        totalDiscount: 0,
        totalTax: 0,
        netRevenue: 0,
        paymentBreakdown: {},
        topMedicines: {},
        byPaymentMethod: {},
      };

      sales.forEach((sale) => {
        summary.totalRevenue += sale.totalAmount;
        summary.totalDiscount += sale.discountAmount;
        summary.totalTax += sale.taxAmount;

        // Payment method breakdown
        if (!summary.paymentBreakdown[sale.paymentMethod]) {
          summary.paymentBreakdown[sale.paymentMethod] = 0;
        }
        summary.paymentBreakdown[sale.paymentMethod]++;

        // By payment method - total amount
        if (!summary.byPaymentMethod[sale.paymentMethod]) {
          summary.byPaymentMethod[sale.paymentMethod] = { count: 0, amount: 0 };
        }
        summary.byPaymentMethod[sale.paymentMethod].count++;
        summary.byPaymentMethod[sale.paymentMethod].amount += sale.totalAmount;

        // Top medicines
        sale.items.forEach((item) => {
          const medName = item.medicine.name;
          if (!summary.topMedicines[medName]) {
            summary.topMedicines[medName] = { quantity: 0, revenue: 0 };
          }
          summary.topMedicines[medName].quantity += item.quantity;
          summary.topMedicines[medName].revenue += item.totalPrice;
        });
      });

      summary.netRevenue = summary.totalRevenue - summary.totalDiscount;

      return summary;
    } catch (error) {
      logger.error(`Get sales summary service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get available stock for a medicine (FIFO order)
   */
  getAvailableStockForMedicine: async (medicineId) => {
    try {
      const batches = await Batch.find({
        medicine: medicineId,
        isExpired: false,
        quantityAvailable: { $gt: 0 },
      })
        .populate('medicine')
        .sort({ expiryDate: 1 }); // FIFO order

      const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

      return {
        medicineId,
        totalAvailable,
        batches: batches.map((batch) => ({
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          availableQuantity: batch.quantityAvailable,
          expiryDate: batch.expiryDate,
          sellingPrice: batch.sellingPrice,
          costPerUnit: batch.costPerUnit,
        })),
      };
    } catch (error) {
      logger.error(`Get available stock service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get daily sales report
   */
  getDailySalesReport: async (date) => {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const sales = await Sale.find({
        saleDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate('cashier', 'email firstName lastName')
        .populate('items.medicine');

      const report = {
        date: date.toISOString().split('T')[0],
        totalSales: sales.length,
        totalAmount: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
        totalTax: sales.reduce((sum, sale) => sum + sale.taxAmount, 0),
        salesByCashier: {},
        topMedicines: [],
      };

      // Sales by cashier
      sales.forEach((sale) => {
        const cashierName = `${sale.cashier.firstName} ${sale.cashier.lastName}`;
        if (!report.salesByCashier[cashierName]) {
          report.salesByCashier[cashierName] = { count: 0, amount: 0 };
        }
        report.salesByCashier[cashierName].count++;
        report.salesByCashier[cashierName].amount += sale.totalAmount;
      });

      // Top medicines
      const medicineMap = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          const medName = item.medicine.name;
          if (!medicineMap[medName]) {
            medicineMap[medName] = { quantity: 0, revenue: 0 };
          }
          medicineMap[medName].quantity += item.quantity;
          medicineMap[medName].revenue += item.totalPrice;
        });
      });

      report.topMedicines = Object.entries(medicineMap)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return report;
    } catch (error) {
      logger.error(`Get daily sales report service error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = saleService;
