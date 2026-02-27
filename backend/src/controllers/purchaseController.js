const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');
const Supplier = require('../models/Supplier');
const Medicine = require('../models/Medicine');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');
const purchaseService = require('../services/purchaseService');

/**
 * Create a new purchase with batch entries
 */
const createPurchase = async (req, res, next) => {
  try {
    const { supplier, expectedDeliveryDate, items, notes } = req.body;

    // Validate supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return next(new AppError('Supplier not found', 404));
    }

    // Validate all medicines exist
    const medicineIds = items.map((item) => item.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });

    if (medicines.length !== items.length) {
      return next(new AppError('One or more medicines not found', 404));
    }

    // Create purchase with batch records
    const purchase = await purchaseService.createPurchaseWithBatches({
      supplier,
      expectedDeliveryDate,
      items,
      notes,
    });

    logger.info(`Purchase created: ${purchase._id}`);

    res.status(201).json({
      status: 'success',
      message: 'Purchase created successfully with batches',
      data: {
        purchase,
      },
    });
  } catch (error) {
    logger.error(`Create purchase error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all purchases with filters
 */
const getAllPurchases = async (req, res, next) => {
  try {
    const { status, supplier, startDate, endDate } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) {
        filter.purchaseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.purchaseDate.$lte = new Date(endDate);
      }
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier')
      .populate('items.medicine')
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      status: 'success',
      count: purchases.length,
      data: {
        purchases,
      },
    });
  } catch (error) {
    logger.error(`Get all purchases error: ${error.message}`);
    next(error);
  }
};

/**
 * Get purchase by ID
 */
const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id)
      .populate('supplier')
      .populate('items.medicine');

    if (!purchase) {
      return next(new AppError('Purchase not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        purchase,
      },
    });
  } catch (error) {
    logger.error(`Get purchase error: ${error.message}`);
    next(error);
  }
};

/**
 * Update purchase status
 */
const updatePurchaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actualDeliveryDate } = req.body;

    if (!['pending', 'received', 'cancelled', 'partial'].includes(status)) {
      return next(new AppError('Invalid purchase status', 400));
    }

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return next(new AppError('Purchase not found', 404));
    }

    purchase.status = status;

    if (status === 'received' && actualDeliveryDate) {
      purchase.actualDeliveryDate = new Date(actualDeliveryDate);
    }

    await purchase.save();

    logger.info(`Purchase ${id} status updated to ${status}`);

    res.status(200).json({
      status: 'success',
      message: 'Purchase status updated successfully',
      data: {
        purchase,
      },
    });
  } catch (error) {
    logger.error(`Update purchase status error: ${error.message}`);
    next(error);
  }
};

/**
 * Get purchase with batches details
 */
const getPurchaseWithBatches = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id)
      .populate('supplier')
      .populate('items.medicine');

    if (!purchase) {
      return next(new AppError('Purchase not found', 404));
    }

    // Get batches created from this purchase
    const batches = await Batch.find({
      purchaseDate: {
        $gte: new Date(purchase.purchaseDate.getTime() - 60000), // Within 1 minute of purchase creation
        $lte: new Date(purchase.purchaseDate.getTime() + 60000),
      },
    }).populate(['medicine', 'supplier']);

    res.status(200).json({
      status: 'success',
      data: {
        purchase,
        batches: batches.filter((batch) =>
          purchase.items.some((item) => item.medicine._id.toString() === batch.medicine._id.toString())
        ),
      },
    });
  } catch (error) {
    logger.error(`Get purchase with batches error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  getPurchaseWithBatches,
};
