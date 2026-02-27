const Medicine = require('../models/Medicine');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Add a new medicine
 */
const addMedicine = async (req, res, next) => {
  try {
    const { name, genericName, description, dosageForm, dosageStrength, manufacturer, category, reorderLevel } = req.body;

    // Check if medicine already exists
    const existingMedicine = await Medicine.findOne({ name });
    if (existingMedicine) {
      return next(new AppError('Medicine already exists', 400));
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      description,
      dosageForm,
      dosageStrength,
      manufacturer,
      category,
      reorderLevel,
    });

    logger.info(`Medicine added: ${medicine.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Medicine added successfully',
      data: {
        medicine,
      },
    });
  } catch (error) {
    logger.error(`Add medicine error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all medicines
 */
const getAllMedicines = async (req, res, next) => {
  try {
    const { search, category, isActive } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: medicines.length,
      data: {
        medicines,
      },
    });
  } catch (error) {
    logger.error(`Get all medicines error: ${error.message}`);
    next(error);
  }
};

/**
 * Get single medicine by ID
 */
const getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        medicine,
      },
    });
  } catch (error) {
    logger.error(`Get medicine error: ${error.message}`);
    next(error);
  }
};

/**
 * Update medicine
 */
const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, genericName, description, dosageForm, dosageStrength, manufacturer, category, reorderLevel, isActive } =
      req.body;

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    // Check if new name already exists (if changing name)
    if (name && name !== medicine.name) {
      const existingMedicine = await Medicine.findOne({ name });
      if (existingMedicine) {
        return next(new AppError('Medicine name already exists', 400));
      }
    }

    // Update fields if provided
    if (name) medicine.name = name;
    if (genericName) medicine.genericName = genericName;
    if (description) medicine.description = description;
    if (dosageForm) medicine.dosageForm = dosageForm;
    if (dosageStrength) medicine.dosageStrength = dosageStrength;
    if (manufacturer) medicine.manufacturer = manufacturer;
    if (category) medicine.category = category;
    if (reorderLevel !== undefined) medicine.reorderLevel = reorderLevel;
    if (isActive !== undefined) medicine.isActive = isActive;

    await medicine.save();

    logger.info(`Medicine updated: ${medicine.name}`);

    res.status(200).json({
      status: 'success',
      message: 'Medicine updated successfully',
      data: {
        medicine,
      },
    });
  } catch (error) {
    logger.error(`Update medicine error: ${error.message}`);
    next(error);
  }
};

/**
 * Delete medicine (soft delete - set isActive to false)
 */
const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    medicine.isActive = false;
    await medicine.save();

    logger.info(`Medicine deleted: ${medicine.name}`);

    res.status(200).json({
      status: 'success',
      message: 'Medicine deleted successfully',
      data: {
        medicine,
      },
    });
  } catch (error) {
    logger.error(`Delete medicine error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
