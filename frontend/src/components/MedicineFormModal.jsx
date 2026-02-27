import React, { useState, useEffect } from 'react';

/**
 * MedicineFormModal Component
 * Modal form for adding/editing medicines
 * 
 * Props:
 * - isOpen: Boolean to show/hide modal
 * - onClose: Function to close modal
 * - onSubmit: Function to handle form submission
 * - initialData: Medicine data for editing (null for create)
 * - isLoading: Loading state
 */
const MedicineFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    quantity: '',
    price: '',
    expiryDate: '',
    batchNumber: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          genericName: '',
          manufacturer: '',
          quantity: '',
          price: '',
          expiryDate: '',
          batchNumber: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }
    if (!formData.genericName.trim()) {
      newErrors.genericName = 'Generic name is required';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }
    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Medicine Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="genericName">Generic Name *</label>
              <input
                type="text"
                id="genericName"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                className={errors.genericName ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.genericName && <span className="field-error">{errors.genericName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer *</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={errors.manufacturer ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.manufacturer && <span className="field-error">{errors.manufacturer}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="batchNumber">Batch Number *</label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className={errors.batchNumber ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.batchNumber && <span className="field-error">{errors.batchNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity (units) *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'input-error' : ''}
                disabled={isLoading}
                min="0"
              />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'input-error' : ''}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={errors.expiryDate ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows="3"
            />
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
              {isLoading ? 'Saving...' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;
