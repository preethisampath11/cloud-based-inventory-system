const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    saleDate: {
      type: Date,
      required: [true, 'Sale date is required'],
      default: new Date(),
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier is required'],
    },
    items: [
      {
        batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Batch',
          required: [true, 'Batch is required'],
        },
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
          required: [true, 'Medicine is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        pricePerUnit: {
          type: Number,
          required: [true, 'Price per unit is required'],
          min: [0, 'Price cannot be negative'],
        },
        totalPrice: {
          type: Number,
          required: [true, 'Total price is required'],
          min: [0, 'Total price cannot be negative'],
        },
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'check', 'mobile_money'],
      required: [true, 'Payment method is required'],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
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
saleSchema.index({ cashier: 1 });
saleSchema.index({ saleDate: 1 });
saleSchema.index({ 'items.batch': 1 });
saleSchema.index({ 'items.medicine': 1 });

module.exports = mongoose.model('Sale', saleSchema);
