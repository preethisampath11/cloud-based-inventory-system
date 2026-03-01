const Supplier = require('../models/Supplier');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Get all suppliers
 */
const getAllSuppliers = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const suppliers = await Supplier.find(filter).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: suppliers.length,
      data: {
        suppliers,
      },
    });
  } catch (error) {
    logger.error(`Get all suppliers error: ${error.message}`);
    next(error);
  }
};

/**
 * Get single supplier by ID
 */
const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        supplier,
      },
    });
  } catch (error) {
    logger.error(`Get supplier by ID error: ${error.message}`);
    next(error);
  }
};

/**
 * Create new supplier
 */
const createSupplier = async (req, res, next) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      taxId,
    } = req.body;

    // Validate required fields
    if (!name) {
      return next(new AppError('Supplier name is required', 400));
    }

    // Check if supplier with same name already exists
    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return next(new AppError('Supplier with this name already exists', 400));
    }

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      taxId,
    });

    logger.info(`Supplier created: ${supplier.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Supplier created successfully',
      data: {
        supplier,
      },
    });
  } catch (error) {
    logger.error(`Create supplier error: ${error.message}`);
    next(error);
  }
};

/**
 * Update supplier
 */
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      taxId,
      isActive,
    } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      {
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        taxId,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    logger.info(`Supplier updated: ${supplier.name}`);

    res.status(200).json({
      status: 'success',
      message: 'Supplier updated successfully',
      data: {
        supplier,
      },
    });
  } catch (error) {
    logger.error(`Update supplier error: ${error.message}`);
    next(error);
  }
};

/**
 * Delete supplier
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    logger.info(`Supplier deleted: ${supplier.name}`);

    res.status(200).json({
      status: 'success',
      message: 'Supplier deleted successfully',
      data: {
        supplier,
      },
    });
  } catch (error) {
    logger.error(`Delete supplier error: ${error.message}`);
    next(error);
  }
};

/**
 * Search suppliers
 */
const searchSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (!search) {
      return next(new AppError('Search term is required', 400));
    }

    const suppliers = await Supplier.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ],
    }).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: suppliers.length,
      data: {
        suppliers,
      },
    });
  } catch (error) {
    logger.error(`Search suppliers error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
};
