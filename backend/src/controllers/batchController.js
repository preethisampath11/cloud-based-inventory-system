const Batch = require('../models/Batch');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Get all batches with optional filters
 */
const getAllBatches = async (req, res, next) => {
  try {
    const { medicine, supplier, status, sortBy = 'purchaseDate' } = req.query;

    // Build filter object
    const filter = {};

    if (medicine) {
      filter.medicine = medicine;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    if (status === 'expired') {
      filter.isExpired = true;
    } else if (status === 'active') {
      filter.isExpired = false;
    }

    // Fetch batches with populated references
    const batches = await Batch.find(filter)
      .populate('medicine')
      .populate('supplier')
      .sort({ [sortBy]: -1 });

    res.status(200).json({
      status: 'success',
      count: batches.length,
      data: {
        batches,
      },
    });
  } catch (error) {
    logger.error(`Get all batches error: ${error.message}`);
    next(error);
  }
};

/**
 * Add a new batch
 */
const addBatch = async (req, res, next) => {
  try {
    const { medicine, batchNumber, supplier, quantityReceived, expiryDate, manufacturingDate, costPerUnit, sellingPrice, purchaseDate, notes } =
      req.body;

    // Check if batch number already exists
    const existingBatch = await Batch.findOne({ batchNumber });
    if (existingBatch) {
      return next(new AppError('Batch number already exists', 400));
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

    // Populate references
    await batch.populate(['medicine', 'supplier']);

    logger.info(`Batch added: ${batch.batchNumber}`);

    res.status(201).json({
      status: 'success',
      message: 'Batch added successfully',
      data: {
        batch,
      },
    });
  } catch (error) {
    logger.error(`Add batch error: ${error.message}`);
    next(error);
  }
};

/**
 * Get batches by medicine ID
 */
const getBatchesByMedicine = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const batches = await Batch.find({ medicine: medicineId })
      .populate('medicine')
      .populate('supplier')
      .sort({ purchaseDate: -1 });

    if (batches.length === 0) {
      return res.status(200).json({
        status: 'success',
        count: 0,
        data: {
          batches: [],
        },
      });
    }

    res.status(200).json({
      status: 'success',
      count: batches.length,
      data: {
        batches,
      },
    });
  } catch (error) {
    logger.error(`Get batches by medicine error: ${error.message}`);
    next(error);
  }
};

/**
 * Filter batches by expiry date
 */
const filterBatchesByExpiry = async (req, res, next) => {
  try {
    const { expiryBefore, expiryAfter, includeExpired } = req.query;

    const filter = {};

    // Filter by expiry date range
    if (expiryBefore || expiryAfter) {
      filter.expiryDate = {};

      if (expiryBefore) {
        filter.expiryDate.$lte = new Date(expiryBefore);
      }

      if (expiryAfter) {
        filter.expiryDate.$gte = new Date(expiryAfter);
      }
    }

    // Include or exclude expired batches
    if (includeExpired !== 'true') {
      filter.isExpired = false;
    }

    const batches = await Batch.find(filter)
      .populate('medicine')
      .populate('supplier')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      status: 'success',
      count: batches.length,
      data: {
        batches,
      },
    });
  } catch (error) {
    logger.error(`Filter batches by expiry error: ${error.message}`);
    next(error);
  }
};

/**
 * Get low stock batches
 * Returns batches where quantityAvailable is below or equal to half of quantityReceived
 */
const getLowStockBatches = async (req, res, next) => {
  try {
    // Get all batches
    const allBatches = await Batch.find({ isExpired: false })
      .populate('medicine')
      .populate('supplier');

    // Filter batches with low stock (less than 50% available)
    const lowStockBatches = allBatches.filter((batch) => {
      const stockPercentage = (batch.quantityAvailable / batch.quantityReceived) * 100;
      return stockPercentage <= 50;
    });

    // Sort by stock percentage (ascending)
    lowStockBatches.sort((a, b) => {
      const percentageA = (a.quantityAvailable / a.quantityReceived) * 100;
      const percentageB = (b.quantityAvailable / b.quantityReceived) * 100;
      return percentageA - percentageB;
    });

    // Enhance with stock percentage
    const enhancedBatches = lowStockBatches.map((batch) => {
      return {
        ...batch.toObject(),
        stockPercentage: ((batch.quantityAvailable / batch.quantityReceived) * 100).toFixed(2),
      };
    });

    logger.info(`Retrieved ${lowStockBatches.length} low stock batches`);

    res.status(200).json({
      status: 'success',
      count: lowStockBatches.length,
      data: {
        batches: enhancedBatches,
      },
    });
  } catch (error) {
    logger.error(`Get low stock batches error: ${error.message}`);
    next(error);
  }
};

/**
 * Update batch quantity
 */
const updateBatchQuantity = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const { quantityAvailable } = req.body;

    if (quantityAvailable === undefined) {
      return next(new AppError('Quantity available is required', 400));
    }

    const batch = await Batch.findById(batchId).populate(['medicine', 'supplier']);

    if (!batch) {
      return next(new AppError('Batch not found', 404));
    }

    if (quantityAvailable > batch.quantityReceived) {
      return next(new AppError('Available quantity cannot exceed received quantity', 400));
    }

    batch.quantityAvailable = quantityAvailable;
    await batch.save();

    logger.info(`Batch ${batch.batchNumber} quantity updated to ${quantityAvailable}`);

    res.status(200).json({
      status: 'success',
      message: 'Batch quantity updated successfully',
      data: {
        batch,
      },
    });
  } catch (error) {
    logger.error(`Update batch quantity error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllBatches,
  addBatch,
  getBatchesByMedicine,
  filterBatchesByExpiry,
  getLowStockBatches,
  updateBatchQuantity,
};
