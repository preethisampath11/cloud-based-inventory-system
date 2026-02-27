const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const Supplier = require('../models/Supplier');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Purchase Service
 * Handles business logic for purchase operations
 * Includes transaction-like handling for batch creation
 */

const purchaseService = {
  /**
   * Create purchase with batch entries
   * Validates supplier and medicines, creates batches and updates stock
   */
  createPurchaseWithBatches: async (purchaseData) => {
    try {
      const { supplier, expectedDeliveryDate, items, notes } = purchaseData;

      // Validate supplier exists
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        throw new AppError('Supplier not found', 404);
      }

      // Validate all medicines exist and get their details
      const medicineIds = items.map((item) => item.medicine);
      const medicines = await Medicine.find({ _id: { $in: medicineIds } });

      if (medicines.length !== items.length) {
        throw new AppError('One or more medicines not found', 404);
      }

      // Calculate total amount and validate items
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const medicine = medicines.find((m) => m._id.toString() === item.medicine.toString());

        if (!medicine) {
          throw new AppError(`Medicine ${item.medicine} not found`, 404);
        }

        const itemTotal = item.quantity * item.costPerUnit;
        totalAmount += itemTotal;

        validatedItems.push({
          medicine: item.medicine,
          quantity: item.quantity,
          costPerUnit: item.costPerUnit,
          totalCost: itemTotal,
        });
      }

      // Create the purchase record
      const purchase = await Purchase.create({
        supplier,
        expectedDeliveryDate,
        items: validatedItems,
        totalAmount,
        notes,
        status: 'pending',
      });

      // Create batch entries and update stock (transaction-like behavior)
      const batchPromises = [];

      for (const item of items) {
        // Check if batch number already exists for this medicine
        const existingBatch = await Batch.findOne({
          medicine: item.medicine,
          batchNumber: item.batchNumber,
        });

        if (existingBatch) {
          // Rollback: Delete created purchase
          await Purchase.deleteOne({ _id: purchase._id });
          throw new AppError(
            `Batch number ${item.batchNumber} already exists for this medicine`,
            400
          );
        }

        // Create batch entry
        const batchPromise = Batch.create({
          medicine: item.medicine,
          batchNumber: item.batchNumber || `BATCH-${Date.now()}-${Math.random()}`, // Auto-generate if not provided
          supplier,
          quantityReceived: item.quantity,
          quantityAvailable: item.quantity,
          expiryDate: item.expiryDate,
          manufacturingDate: item.manufacturingDate,
          costPerUnit: item.costPerUnit,
          sellingPrice: item.sellingPrice,
          purchaseDate: purchase.purchaseDate,
          notes: item.notes,
        });

        batchPromises.push(batchPromise);
      }

      // Wait for all batches to be created
      const createdBatches = await Promise.all(batchPromises);

      logger.info(`Purchase ${purchase._id} created with ${createdBatches.length} batch entries`);

      // Populate and return
      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate('supplier')
        .populate('items.medicine');

      return populatedPurchase;
    } catch (error) {
      logger.error(`Create purchase with batches service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get purchases with filtering
   */
  getPurchases: async (filters = {}) => {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.supplier) {
        query.supplier = filters.supplier;
      }

      if (filters.startDate || filters.endDate) {
        query.purchaseDate = {};
        if (filters.startDate) {
          query.purchaseDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.purchaseDate.$lte = new Date(filters.endDate);
        }
      }

      const purchases = await Purchase.find(query)
        .populate('supplier')
        .populate('items.medicine')
        .sort({ purchaseDate: -1 });

      return purchases;
    } catch (error) {
      logger.error(`Get purchases service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get purchase by ID with full details
   */
  getPurchaseById: async (purchaseId) => {
    try {
      const purchase = await Purchase.findById(purchaseId)
        .populate('supplier')
        .populate('items.medicine');

      if (!purchase) {
        throw new AppError('Purchase not found', 404);
      }

      return purchase;
    } catch (error) {
      logger.error(`Get purchase by ID service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Update purchase status
   */
  updatePurchaseStatus: async (purchaseId, newStatus, actualDeliveryDate = null) => {
    try {
      const validStatuses = ['pending', 'received', 'cancelled', 'partial'];

      if (!validStatuses.includes(newStatus)) {
        throw new AppError('Invalid purchase status', 400);
      }

      const purchase = await Purchase.findById(purchaseId);

      if (!purchase) {
        throw new AppError('Purchase not found', 404);
      }

      purchase.status = newStatus;

      if (newStatus === 'received' && actualDeliveryDate) {
        purchase.actualDeliveryDate = new Date(actualDeliveryDate);
      }

      await purchase.save();

      logger.info(`Purchase ${purchaseId} status updated to ${newStatus}`);

      return purchase;
    } catch (error) {
      logger.error(`Update purchase status service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get purchases summary by supplier
   */
  getPurchasesSummaryBySupplier: async (supplierId) => {
    try {
      const purchases = await Purchase.find({ supplier: supplierId })
        .populate('supplier')
        .populate('items.medicine');

      const summary = {
        supplier: purchases.length > 0 ? purchases[0].supplier : null,
        totalPurchases: purchases.length,
        totalSpent: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
        byStatus: {
          pending: purchases.filter((p) => p.status === 'pending').length,
          received: purchases.filter((p) => p.status === 'received').length,
          cancelled: purchases.filter((p) => p.status === 'cancelled').length,
          partial: purchases.filter((p) => p.status === 'partial').length,
        },
      };

      return summary;
    } catch (error) {
      logger.error(`Get purchases summary service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get batches created from a specific purchase
   */
  getBatchesFromPurchase: async (purchaseId) => {
    try {
      const purchase = await Purchase.findById(purchaseId);

      if (!purchase) {
        throw new AppError('Purchase not found', 404);
      }

      // Get medicine IDs from purchase items
      const medicineIds = purchase.items.map((item) => item.medicine);

      // Get batches created around the purchase date (within 1 minute)
      const batches = await Batch.find({
        purchaseDate: {
          $gte: new Date(purchase.purchaseDate.getTime() - 60000),
          $lte: new Date(purchase.purchaseDate.getTime() + 60000),
        },
        medicine: { $in: medicineIds },
      })
        .populate('medicine')
        .populate('supplier');

      return batches;
    } catch (error) {
      logger.error(`Get batches from purchase service error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = purchaseService;
