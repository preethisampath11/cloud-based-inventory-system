const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
      default: new Date(),
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        costPerUnit: {
          type: Number,
          required: true,
          min: [0, 'Cost cannot be negative'],
        },
        totalCost: {
          type: Number,
          required: true,
          min: [0, 'Total cost cannot be negative'],
        },
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'received', 'cancelled', 'partial'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ purchaseDate: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
