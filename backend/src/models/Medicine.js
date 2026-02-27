const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      unique: true,
      sparse: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'powder', 'drops', 'patch'],
      trim: true,
    },
    dosageStrength: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    reorderLevel: {
      type: Number,
      default: 50,
      min: [0, 'Reorder level cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Medicine', medicineSchema);
