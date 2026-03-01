import React from 'react';

/**
 * BatchTable Component
 * Displays batches in a table format with expiry countdown
 * and stock status highlighting
 * 
 * Props:
 * - batches: Array of batch objects
 * - isLoading: Loading state
 */
const BatchTable = ({ batches, isLoading }) => {
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading batches...</p>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="table-empty">
        <p>No batches found. Add a new batch to get started!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const isExpiringSoon = (expiryDate) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    return daysLeft <= 30 && daysLeft > 0;
  };

  const isLowStock = (quantityAvailable) => {
    return quantityAvailable < 50; // Low stock threshold
  };

  const getRowClass = (batch) => {
    if (isExpired(batch.expiryDate)) return 'batch-row-expired';
    if (isExpiringSoon(batch.expiryDate)) return 'batch-row-expiring';
    if (isLowStock(batch.quantityAvailable)) return 'batch-row-low-stock';
    return '';
  };

  return (
    <div className="table-container">
      <table className="batches-table">
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Medicine Name</th>
            <th>Supplier</th>
            <th>Quantity Available</th>
            <th>Cost Per Unit</th>
            <th>Selling Price</th>
            <th>Expiry Date</th>
            <th>Days Left</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => {
            const daysLeft = getDaysUntilExpiry(batch.expiryDate);
            const expired = isExpired(batch.expiryDate);
            const expiringSoon = isExpiringSoon(batch.expiryDate);
            const lowStock = isLowStock(batch.quantityAvailable);

            return (
              <tr key={batch._id} className={`batch-row ${getRowClass(batch)}`}>
                <td className="batch-number">
                  <strong>{batch.batchNumber}</strong>
                </td>
                <td className="medicine-name">{batch.medicine?.name || 'N/A'}</td>
                <td className="supplier-name">{batch.supplier?.name || 'N/A'}</td>
                <td className="quantity">
                  <span className={lowStock ? 'quantity-low' : ''}>
                    {batch.quantityAvailable} units
                  </span>
                </td>
                <td className="cost-per-unit">{formatPrice(batch.costPerUnit)}</td>
                <td className="selling-price">{formatPrice(batch.sellingPrice)}</td>
                <td className="expiry-date">
                  <span
                    className={
                      expired
                        ? 'expired-badge'
                        : expiringSoon
                        ? 'expiring-badge'
                        : ''
                    }
                  >
                    {formatDate(batch.expiryDate)}
                  </span>
                </td>
                <td className="days-left">
                  <span
                    className={
                      expired
                        ? 'days-expired'
                        : expiringSoon
                        ? 'days-warning'
                        : 'days-ok'
                    }
                  >
                    {expired ? 'Expired' : expiringSoon ? `${daysLeft} days` : `${daysLeft} days`}
                  </span>
                </td>
                <td className="status">
                  {expired ? (
                    <span className="badge badge-danger">Expired</span>
                  ) : expiringSoon ? (
                    <span className="badge badge-warning">Expiring Soon</span>
                  ) : lowStock ? (
                    <span className="badge badge-info">Low Stock</span>
                  ) : (
                    <span className="badge badge-success">OK</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BatchTable;
