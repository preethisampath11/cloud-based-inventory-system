import React from 'react';

/**
 * DynamicPurchaseItemRow Component
 * Individual row for each medicine in a purchase order
 * 
 * Props:
 * - item: Item object with medicine, quantity, costPerUnit, sellingPrice, expiryDate, batchNumber, notes
 * - medicines: Array of available medicines
 * - errors: Object containing field errors
 * - onChange: Function to handle field changes
 * - onRemove: Function to remove this item
 * - isLoading: Loading state
 */
const DynamicPurchaseItemRow = ({
  item,
  medicines = [],
  errors = {},
  onChange,
  onRemove,
  isLoading = false,
}) => {
  const itemTotal = (parseFloat(item.costPerUnit) || 0) * (parseInt(item.quantity) || 0);

  return (
    <div className="purchase-item-row">
      <div className="col-medicine">
        <div className="form-group">
          <select
            value={item.medicine}
            onChange={(e) => onChange('medicine', e.target.value)}
            className={errors.medicine ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="">Select medicine</option>
            {medicines.map((medicine) => (
              <option key={medicine._id || medicine.id} value={medicine._id || medicine.id}>
                {medicine.name}
              </option>
            ))}
          </select>
          {errors.medicine && <span className="error-message">{errors.medicine}</span>}
        </div>
      </div>

      <div className="col-quantity">
        <div className="form-group">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onChange('quantity', e.target.value)}
            placeholder="Qty"
            className={errors.quantity ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.quantity && <span className="error-message">{errors.quantity}</span>}
        </div>
      </div>

      <div className="col-cost">
        <div className="form-group">
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.costPerUnit}
            onChange={(e) => onChange('costPerUnit', e.target.value)}
            placeholder="Cost"
            className={errors.costPerUnit ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.costPerUnit && <span className="error-message">{errors.costPerUnit}</span>}
        </div>
      </div>

      <div className="col-selling">
        <div className="form-group">
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.sellingPrice}
            onChange={(e) => onChange('sellingPrice', e.target.value)}
            placeholder="Selling Price"
            className={errors.sellingPrice ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.sellingPrice && <span className="error-message">{errors.sellingPrice}</span>}
        </div>
      </div>

      <div className="col-expiry">
        <div className="form-group">
          <input
            type="date"
            value={item.expiryDate}
            onChange={(e) => onChange('expiryDate', e.target.value)}
            className={errors.expiryDate ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
        </div>
      </div>

      <div className="col-batch">
        <div className="form-group">
          <input
            type="text"
            value={item.batchNumber}
            onChange={(e) => onChange('batchNumber', e.target.value)}
            placeholder="Batch #"
            className={errors.batchNumber ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.batchNumber && <span className="error-message">{errors.batchNumber}</span>}
        </div>
      </div>

      <div className="col-action">
        <div className="item-actions">
          <span className="item-total">
            ₹{itemTotal.toFixed(2)}
          </span>
          <button
            type="button"
            className="btn-remove"
            onClick={onRemove}
            disabled={isLoading}
            title="Remove item"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicPurchaseItemRow;
