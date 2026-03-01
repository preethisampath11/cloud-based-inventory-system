import React, { useState, useEffect } from 'react';
import DynamicPurchaseItemRow from './DynamicPurchaseItemRow';

/**
 * PurchaseForm Component
 * Form to create purchase orders with multiple items
 * 
 * Props:
 * - medicines: Array of available medicines
 * - suppliers: Array of available suppliers
 * - onSubmit: Function to handle form submission
 * - isLoading: Loading state during submission
 */
const PurchaseForm = ({ medicines = [], suppliers = [], onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
  });

  const [items, setItems] = useState([
    {
      id: 1,
      medicine: '',
      quantity: '',
      costPerUnit: '',
      sellingPrice: '',
      expiryDate: '',
      manufacturingDate: '',
      batchNumber: '',
      notes: '',
    }
  ]);

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [nextItemId, setNextItemId] = useState(2);

  // Handle main form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle item field changes
  const handleItemChange = (itemId, fieldName, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, [fieldName]: value }
          : item
      )
    );
    // Clear error for this field
    if (itemErrors[itemId]?.[fieldName]) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [fieldName]: '',
        },
      }));
    }
  };

  // Add new item row
  const handleAddItem = () => {
    const newItem = {
      id: nextItemId,
      medicine: '',
      quantity: '',
      costPerUnit: '',
      sellingPrice: '',
      expiryDate: '',
      manufacturingDate: '',
      batchNumber: '',
      notes: '',
    };
    setItems((prev) => [...prev, newItem]);
    setNextItemId((prev) => prev + 1);
  };

  // Remove item row
  const handleRemoveItem = (itemId) => {
    if (items.length === 1) {
      alert('You must have at least one item in the purchase order');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    // Clear errors for this item
    setItemErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  };

  // Validate individual item
  const validateItem = (item) => {
    const newErrors = {};

    if (!item.medicine) {
      newErrors.medicine = 'Medicine is required';
    }
    if (!item.quantity || isNaN(item.quantity) || item.quantity < 1) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!item.costPerUnit || isNaN(item.costPerUnit) || item.costPerUnit < 0) {
      newErrors.costPerUnit = 'Valid cost is required';
    }
    if (!item.sellingPrice || isNaN(item.sellingPrice) || item.sellingPrice < 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (!item.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(item.expiryDate) < new Date()) {
      newErrors.expiryDate = 'Expiry date cannot be in the past';
    }
    if (!item.batchNumber) {
      newErrors.batchNumber = 'Batch number is required';
    }

    return newErrors;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    const newItemErrors = {};

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    } else if (new Date(formData.expectedDeliveryDate) < new Date(formData.purchaseDate)) {
      newErrors.expectedDeliveryDate = 'Delivery date must be after purchase date';
    }

    // Validate all items
    items.forEach((item) => {
      const itemErrors = validateItem(item);
      if (Object.keys(itemErrors).length > 0) {
        newItemErrors[item.id] = itemErrors;
      }
    });

    setErrors(newErrors);
    setItemErrors(newItemErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newItemErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare purchase data
    const purchaseData = {
      supplier: formData.supplier,
      purchaseDate: formData.purchaseDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      notes: formData.notes,
      items: items.map((item) => ({
        medicine: item.medicine,
        quantity: parseInt(item.quantity),
        costPerUnit: parseFloat(item.costPerUnit),
        sellingPrice: parseFloat(item.sellingPrice),
        expiryDate: item.expiryDate,
        manufacturingDate: item.manufacturingDate || null,
        batchNumber: item.batchNumber,
        notes: item.notes || '',
      })),
    };

    onSubmit(purchaseData);

    // Reset form on successful submission
    if (!isLoading) {
      setFormData({
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: '',
      });
      setItems([
        { id: 1, medicine: '', quantity: '', costPerUnit: '', sellingPrice: '', expiryDate: '', manufacturingDate: '', batchNumber: '', notes: '' }
      ]);
      setNextItemId(2);
      setErrors({});
      setItemErrors({});
    }
  };

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => {
    const cost = parseFloat(item.costPerUnit) || 0;
    const qty = parseInt(item.quantity) || 0;
    return sum + (cost * qty);
  }, 0);

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>Purchase Details</h2>

        <div className="form-group">
          <label htmlFor="supplier">
            Supplier <span className="required">*</span>
          </label>
          <select
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleFormChange}
            className={errors.supplier ? 'error' : ''}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplier && <span className="error-message">{errors.supplier}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate">
              Purchase Date <span className="required">*</span>
            </label>
            <input
              id="purchaseDate"
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleFormChange}
              className={errors.purchaseDate ? 'error' : ''}
            />
            {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expectedDeliveryDate">
              Expected Delivery Date <span className="required">*</span>
            </label>
            <input
              id="expectedDeliveryDate"
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleFormChange}
              className={errors.expectedDeliveryDate ? 'error' : ''}
            />
            {errors.expectedDeliveryDate && (
              <span className="error-message">{errors.expectedDeliveryDate}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleFormChange}
            placeholder="Add any special instructions or notes..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h2>Purchase Items</h2>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddItem}
            disabled={isLoading}
          >
            + Add Item
          </button>
        </div>

        <div className="items-table-container">
          <div className="items-table-header">
            <div className="col-medicine">Medicine</div>
            <div className="col-quantity">Qty</div>
            <div className="col-cost">Cost/Unit</div>
            <div className="col-selling">Selling Price</div>
            <div className="col-expiry">Expiry Date</div>
            <div className="col-batch">Batch Number</div>
            <div className="col-action">Action</div>
          </div>

          <div className="items-table-body">
            {items.map((item) => (
              <DynamicPurchaseItemRow
                key={item.id}
                item={item}
                medicines={medicines}
                errors={itemErrors[item.id] || {}}
                onChange={(fieldName, value) => handleItemChange(item.id, fieldName, value)}
                onRemove={() => handleRemoveItem(item.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="form-section summary-section">
        <div className="summary-row">
          <span className="summary-label">Total Items:</span>
          <span className="summary-value">{items.length}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Quantity:</span>
          <span className="summary-value">
            {items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
          </span>
        </div>
        <div className="summary-row total">
          <span className="summary-label">Total Amount:</span>
          <span className="summary-value">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Purchase Order...' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;
