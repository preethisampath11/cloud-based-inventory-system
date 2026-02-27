const Batch = require('../models/Batch');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Batch Service
 * Business logic for batch operations
 */

const batchService = {
  /**
   * Create a new batch
   */
  createBatch: async (batchData) => {
    try {
      const { medicine, batchNumber, supplier, quantityReceived, expiryDate, manufacturingDate, costPerUnit, sellingPrice, purchaseDate, notes } =
        batchData;

      // Check if batch number already exists
      const existingBatch = await Batch.findOne({ batchNumber });
      if (existingBatch) {
        throw new AppError('Batch number already exists', 400);
      }

      const batch = await Batch.create({
        medicine,
        batchNumber,
        supplier,
        quantityReceived,
        quantityAvailable: quantityReceived,
        expiryDate,
        manufacturingDate,
        costPerUnit,
        sellingPrice,
        purchaseDate: purchaseDate || new Date(),
        notes,
      });

      return batch;
    } catch (error) {
      logger.error(`Create batch service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get batches by medicine
   */
  getBatchesByMedicine: async (medicineId) => {
    try {
      const batches = await Batch.find({ medicine: medicineId })
        .populate('medicine')
        .populate('supplier')
        .sort({ purchaseDate: -1 });

      return batches;
    } catch (error) {
      logger.error(`Get batches by medicine service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get batches expiring within a date range
   */
  getBatchesByExpiryRange: async (startDate, endDate) => {
    try {
      const batches = await Batch.find({
        expiryDate: {
          $gte: startDate,
          $lte: endDate,
        },
        isExpired: false,
      })
        .populate('medicine')
        .populate('supplier')
        .sort({ expiryDate: 1 });

      return batches;
    } catch (error) {
      logger.error(`Get batches by expiry range service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get low stock batches (less than 50% available)
   */
  getLowStockBatches: async () => {
    try {
      const allBatches = await Batch.find({ isExpired: false })
        .populate('medicine')
        .populate('supplier');

      const lowStockBatches = allBatches
        .filter((batch) => {
          const stockPercentage = (batch.quantityAvailable / batch.quantityReceived) * 100;
          return stockPercentage <= 50;
        })
        .map((batch) => {
          return {
            ...batch.toObject(),
            stockPercentage: ((batch.quantityAvailable / batch.quantityReceived) * 100).toFixed(2),
          };
        })
        .sort((a, b) => parseFloat(a.stockPercentage) - parseFloat(b.stockPercentage));

      return lowStockBatches;
    } catch (error) {
      logger.error(`Get low stock batches service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Reduce batch quantity (for sales)
   */
  reduceBatchQuantity: async (batchId, quantity) => {
    try {
      const batch = await Batch.findById(batchId);

      if (!batch) {
        throw new AppError('Batch not found', 404);
      }

      if (quantity > batch.quantityAvailable) {
        throw new AppError(`Insufficient quantity. Available: ${batch.quantityAvailable}`, 400);
      }

      batch.quantityAvailable -= quantity;
      await batch.save();

      return batch;
    } catch (error) {
      logger.error(`Reduce batch quantity service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get batch by ID
   */
  getBatchById: async (batchId) => {
    try {
      const batch = await Batch.findById(batchId).populate(['medicine', 'supplier']);

      if (!batch) {
        throw new AppError('Batch not found', 404);
      }

      return batch;
    } catch (error) {
      logger.error(`Get batch by ID service error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = batchService;
