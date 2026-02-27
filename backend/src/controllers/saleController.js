const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');
const saleService = require('../services/saleService');

/**
 * Create a new sale with FIFO batch deduction
 */
const createSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, discountAmount, taxAmount, notes } = req.body;
    const cashierId = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return next(new AppError('At least one item is required', 400));
    }

    // Validate all medicines exist
    const medicineIds = items.map((item) => item.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });

    if (medicines.length !== medicineIds.length) {
      return next(new AppError('One or more medicines not found', 404));
    }

    // Create sale with FIFO batch deduction
    const sale = await saleService.createSaleWithFIFODeduction({
      items,
      cashierId,
      paymentMethod,
      discountAmount: discountAmount || 0,
      taxAmount: taxAmount || 0,
      notes,
    });

    logger.info(`Sale created: ${sale._id} by cashier ${cashierId}`);

    res.status(201).json({
      status: 'success',
      message: 'Sale recorded successfully',
      data: {
        sale,
      },
    });
  } catch (error) {
    logger.error(`Create sale error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all sales with filters
 */
const getAllSales = async (req, res, next) => {
  try {
    const { cashier, startDate, endDate, paymentMethod, minAmount, maxAmount } = req.query;

    const filter = {};

    if (cashier) {
      filter.cashier = cashier;
    }

    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) {
        filter.saleDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.saleDate.$lte = new Date(endDate);
      }
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) {
        filter.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filter.totalAmount.$lte = parseFloat(maxAmount);
      }
    }

    const sales = await Sale.find(filter)
      .populate('cashier', 'email firstName lastName')
      .populate('items.batch')
      .populate('items.medicine')
      .sort({ saleDate: -1 });

    res.status(200).json({
      status: 'success',
      count: sales.length,
      data: {
        sales,
      },
    });
  } catch (error) {
    logger.error(`Get all sales error: ${error.message}`);
    next(error);
  }
};

/**
 * Get sale by ID
 */
const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate('cashier', 'email firstName lastName')
      .populate('items.batch')
      .populate('items.medicine');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        sale,
      },
    });
  } catch (error) {
    logger.error(`Get sale error: ${error.message}`);
    next(error);
  }
};

/**
 * Get sales summary by date range
 */
const getSalesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) {
        filter.saleDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.saleDate.$lte = new Date(endDate);
      }
    }

    const sales = await Sale.find(filter)
      .populate('cashier', 'email firstName lastName')
      .populate('items.medicine');

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      totalTax: sales.reduce((sum, sale) => sum + sale.taxAmount, 0),
      paymentBreakdown: {},
      topMedicines: {},
    };

    // Payment method breakdown
    sales.forEach((sale) => {
      if (!summary.paymentBreakdown[sale.paymentMethod]) {
        summary.paymentBreakdown[sale.paymentMethod] = 0;
      }
      summary.paymentBreakdown[sale.paymentMethod]++;
    });

    // Top medicines by quantity
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const medName = item.medicine.name;
        if (!summary.topMedicines[medName]) {
          summary.topMedicines[medName] = { quantity: 0, revenue: 0 };
        }
        summary.topMedicines[medName].quantity += item.quantity;
        summary.topMedicines[medName].revenue += item.totalPrice;
      });
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary,
      },
    });
  } catch (error) {
    logger.error(`Get sales summary error: ${error.message}`);
    next(error);
  }
};

/**
 * Get available stock for a medicine
 */
const getAvailableStock = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const batches = await Batch.find({
      medicine: medicineId,
      isExpired: false,
      quantityAvailable: { $gt: 0 },
    })
      .populate('medicine')
      .sort({ expiryDate: 1 });

    const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

    res.status(200).json({
      status: 'success',
      data: {
        medicine: medicineId,
        totalAvailable,
        batches: batches.map((batch) => ({
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          quantity: batch.quantityAvailable,
          expiryDate: batch.expiryDate,
          sellingPrice: batch.sellingPrice,
        })),
      },
    });
  } catch (error) {
    logger.error(`Get available stock error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  getSalesSummary,
  getAvailableStock,
};
