const Medicine = require('../models/Medicine');
const AppError = require('../utils/errorClass');
const logger = require('../utils/logger');

/**
 * Medicine Service
 * Business logic for medicine operations
 */

const medicineService = {
  /**
   * Create a new medicine
   */
  createMedicine: async (medicineData) => {
    try {
      const { name, genericName, description, dosageForm, dosageStrength, manufacturer, category, reorderLevel } =
        medicineData;

      // Check if medicine already exists
      const existingMedicine = await Medicine.findOne({ name });
      if (existingMedicine) {
        throw new AppError('Medicine already exists with this name', 400);
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

      return medicine;
    } catch (error) {
      logger.error(`Create medicine service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get all medicines with filters
   */
  getMedicines: async (filters = {}) => {
    try {
      const query = {};

      if (filters.search) {
        query.$or = [{ name: { $regex: filters.search, $options: 'i' } }, { genericName: { $regex: filters.search, $options: 'i' } }];
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const medicines = await Medicine.find(query).sort({ name: 1 });
      return medicines;
    } catch (error) {
      logger.error(`Get medicines service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get medicine by ID
   */
  getMedicineById: async (id) => {
    try {
      const medicine = await Medicine.findById(id);

      if (!medicine) {
        throw new AppError('Medicine not found', 404);
      }

      return medicine;
    } catch (error) {
      logger.error(`Get medicine by ID service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Update medicine
   */
  updateMedicine: async (id, updateData) => {
    try {
      const medicine = await Medicine.findById(id);

      if (!medicine) {
        throw new AppError('Medicine not found', 404);
      }

      // Check if new name already exists (if changing name)
      if (updateData.name && updateData.name !== medicine.name) {
        const existingMedicine = await Medicine.findOne({ name: updateData.name });
        if (existingMedicine) {
          throw new AppError('Medicine name already exists', 400);
        }
      }

      // Update only provided fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && medicine[key] !== undefined) {
          medicine[key] = updateData[key];
        }
      });

      await medicine.save();
      return medicine;
    } catch (error) {
      logger.error(`Update medicine service error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Delete medicine (soft delete)
   */
  deleteMedicine: async (id) => {
    try {
      const medicine = await Medicine.findById(id);

      if (!medicine) {
        throw new AppError('Medicine not found', 404);
      }

      medicine.isActive = false;
      await medicine.save();

      return medicine;
    } catch (error) {
      logger.error(`Delete medicine service error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = medicineService;
