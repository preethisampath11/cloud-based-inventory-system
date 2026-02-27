const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine is required'],
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      unique: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    quantityReceived: {
      type: Number,
      required: [true, 'Quantity received is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    quantityAvailable: {
      type: Number,
      required: [true, 'Quantity available is required'],
      min: [0, 'Available quantity cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    manufacturingDate: {
      type: Date,
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Cost per unit is required'],
      min: [0, 'Cost cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price cannot be negative'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
      default: new Date(),
    },
    isExpired: {
      type: Boolean,
      default: false,
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

// Pre-save hook to check expiry
batchSchema.pre('save', function () {
  this.isExpired = new Date() > this.expiryDate;
});

// Index for common queries
batchSchema.index({ medicine: 1, batchNumber: 1 });
batchSchema.index({ expiryDate: 1 });
batchSchema.index({ quantityAvailable: 1 });

module.exports = mongoose.model('Batch', batchSchema);
