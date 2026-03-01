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
    description: '',
    dosageForm: 'tablet',
    dosageStrength: '',
    manufacturer: '',
    category: '',
    reorderLevel: '50',
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
          description: '',
          dosageForm: 'tablet',
          dosageStrength: '',
          manufacturer: '',
          category: '',
          reorderLevel: '50',
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
                placeholder="e.g., Aspirin 500mg"
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
                placeholder="e.g., Acetylsalicylic Acid"
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
                placeholder="e.g., Bayer"
                className={errors.manufacturer ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.manufacturer && <span className="field-error">{errors.manufacturer}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dosageForm">Dosage Form</label>
              <select
                id="dosageForm"
                name="dosageForm"
                value={formData.dosageForm}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream</option>
                <option value="powder">Powder</option>
                <option value="drops">Drops</option>
                <option value="patch">Patch</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dosageStrength">Dosage Strength</label>
              <input
                type="text"
                id="dosageStrength"
                name="dosageStrength"
                value={formData.dosageStrength}
                onChange={handleChange}
                placeholder="e.g., 500mg, 10mg/5ml"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Painkiller, Antibiotic"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reorderLevel">Reorder Level (units)</label>
              <input
                type="number"
                id="reorderLevel"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="50"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about the medicine..."
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
              {isLoading ? 'Saving...' : initialData ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;
