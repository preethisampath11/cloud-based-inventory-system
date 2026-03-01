import React from 'react';

/**
 * PurchaseFilters Component
 * Filter form for supplier and date range
 * 
 * Props:
 * - suppliers: Array of supplier objects
 * - filterSupplier: Current supplier filter value
 * - filterStartDate: Current start date filter value
 * - filterEndDate: Current end date filter value
 * - onSupplierChange: Handler for supplier dropdown
 * - onStartDateChange: Handler for start date input
 * - onEndDateChange: Handler for end date input
 * - onApplyFilters: Handler for apply button
 * - onResetFilters: Handler for reset button
 * - isLoading: Loading state
 */
const PurchaseFilters = ({
  suppliers = [],
  filterSupplier = '',
  filterStartDate = '',
  filterEndDate = '',
  onSupplierChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}) => {
  return (
    <div className="purchase-filters-card">
      <h3 className="filters-title">Filter Purchases</h3>
      
      <div className="filters-grid">
        <div className="filter-field">
          <label htmlFor="filterSupplier" className="filter-label">
            Supplier
          </label>
          <select
            id="filterSupplier"
            value={filterSupplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="filter-input"
            disabled={isLoading}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="filterStartDate" className="filter-label">
            From Date
          </label>
          <input
            id="filterStartDate"
            type="date"
            value={filterStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="filter-input"
            disabled={isLoading}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="filterEndDate" className="filter-label">
            To Date
          </label>
          <input
            id="filterEndDate"
            type="date"
            value={filterEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="filter-input"
            disabled={isLoading}
          />
        </div>

        <div className="filter-actions">
          <button
            className="btn-filter-apply"
            onClick={onApplyFilters}
            disabled={isLoading}
          >
            Apply Filters
          </button>
          <button
            className="btn-filter-reset"
            onClick={onResetFilters}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFilters;
