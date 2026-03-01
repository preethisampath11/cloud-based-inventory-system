import React, { useState, useEffect } from 'react';

/**
 * BatchForm Modal Component
 * Form to add new batches
 * 
 * Props:
 * - isOpen: Whether modal is open
 * - onClose: Function to close modal
 * - onSubmit: Function to submit form
 * - medicines: Array of available medicines
 * - suppliers: Array of available suppliers (if provided)
 * - isLoading: Submission loading state
 */
const BatchForm = ({ isOpen, onClose, onSubmit, medicines = [], suppliers = [], isLoading }) => {
  const [formData, setFormData] = useState({
    medicine: '',
    batchNumber: '',
    supplier: '',
    quantityReceived: '',
    expiryDate: '',
    manufacturingDate: '',
    costPerUnit: '',
    sellingPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'medicine':
        if (!value) error = 'Medicine is required';
        break;
      case 'batchNumber':
        if (!value) error = 'Batch number is required';
        break;
      case 'supplier':
        if (!value) error = 'Supplier is required';
        break;
      case 'quantityReceived':
        if (!value) error = 'Quantity is required';
        else if (isNaN(value) || value < 1) error = 'Quantity must be at least 1';
        break;
      case 'expiryDate':
        if (!value) error = 'Expiry date is required';
        else if (new Date(value) < new Date()) error = 'Expiry date cannot be in the past';
        break;
      case 'costPerUnit':
        if (!value) error = 'Cost per unit is required';
        else if (isNaN(value) || value < 0) error = 'Cost must be a positive number';
        break;
      case 'sellingPrice':
        if (!value) error = 'Selling price is required';
        else if (isNaN(value) || value < 0) error = 'Price must be a positive number';
        break;
      default:
        break;
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medicine) newErrors.medicine = 'Medicine is required';
    if (!formData.batchNumber) newErrors.batchNumber = 'Batch number is required';
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    if (!formData.quantityReceived || isNaN(formData.quantityReceived) || formData.quantityReceived < 1) {
      newErrors.quantityReceived = 'Valid quantity is required';
    }
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.costPerUnit || isNaN(formData.costPerUnit) || formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Valid cost is required';
    }
    if (!formData.sellingPrice || isNaN(formData.sellingPrice) || formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      quantityReceived: parseInt(formData.quantityReceived),
      costPerUnit: parseFloat(formData.costPerUnit),
      sellingPrice: parseFloat(formData.sellingPrice),
    });

    // Reset form
    setFormData({
      medicine: '',
      batchNumber: '',
      supplier: '',
      quantityReceived: '',
      expiryDate: '',
      manufacturingDate: '',
      costPerUnit: '',
      sellingPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setTouched({});
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New Batch</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isLoading}
            title="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="batch-form">
          <div className="form-grid">
            {/* Medicine Selection */}
            <div className="form-group">
              <label htmlFor="medicine">
                Medicine <span className="required">*</span>
              </label>
              <select
                id="medicine"
                name="medicine"
                value={formData.medicine}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-select ${errors.medicine && touched.medicine ? 'error' : ''}`}
              >
                <option value="">Select a medicine</option>
                {medicines.map((med) => (
                  <option key={med._id} value={med._id}>
                    {med.name}
                  </option>
                ))}
              </select>
              {errors.medicine && touched.medicine && (
                <span className="error-message">{errors.medicine}</span>
              )}
            </div>

            {/* Batch Number */}
            <div className="form-group">
              <label htmlFor="batchNumber">
                Batch Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., BATCH-2024-001"
                className={`form-input ${errors.batchNumber && touched.batchNumber ? 'error' : ''}`}
              />
              {errors.batchNumber && touched.batchNumber && (
                <span className="error-message">{errors.batchNumber}</span>
              )}
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label htmlFor="supplier">
                Supplier <span className="required">*</span>
              </label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-select ${errors.supplier && touched.supplier ? 'error' : ''}`}
              >
                <option value="">Select a supplier</option>
                {suppliers && suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplier && touched.supplier && (
                <span className="error-message">{errors.supplier}</span>
              )}
            </div>

            {/* Quantity Received */}
            <div className="form-group">
              <label htmlFor="quantityReceived">
                Quantity Received <span className="required">*</span>
              </label>
              <input
                type="number"
                id="quantityReceived"
                name="quantityReceived"
                value={formData.quantityReceived}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0"
                min="1"
                className={`form-input ${
                  errors.quantityReceived && touched.quantityReceived ? 'error' : ''
                }`}
              />
              {errors.quantityReceived && touched.quantityReceived && (
                <span className="error-message">{errors.quantityReceived}</span>
              )}
            </div>

            {/* Cost Per Unit */}
            <div className="form-group">
              <label htmlFor="costPerUnit">
                Cost Per Unit <span className="required">*</span>
              </label>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`form-input ${errors.costPerUnit && touched.costPerUnit ? 'error' : ''}`}
              />
              {errors.costPerUnit && touched.costPerUnit && (
                <span className="error-message">{errors.costPerUnit}</span>
              )}
            </div>

            {/* Selling Price */}
            <div className="form-group">
              <label htmlFor="sellingPrice">
                Selling Price <span className="required">*</span>
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`form-input ${errors.sellingPrice && touched.sellingPrice ? 'error' : ''}`}
              />
              {errors.sellingPrice && touched.sellingPrice && (
                <span className="error-message">{errors.sellingPrice}</span>
              )}
            </div>

            {/* Expiry Date */}
            <div className="form-group">
              <label htmlFor="expiryDate">
                Expiry Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input ${errors.expiryDate && touched.expiryDate ? 'error' : ''}`}
              />
              {errors.expiryDate && touched.expiryDate && (
                <span className="error-message">{errors.expiryDate}</span>
              )}
            </div>

            {/* Manufacturing Date */}
            <div className="form-group">
              <label htmlFor="manufacturingDate">Manufacturing Date</label>
              <input
                type="date"
                id="manufacturingDate"
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Purchase Date */}
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Notes */}
            <div className="form-group form-group-full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about the batch..."
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchForm;
