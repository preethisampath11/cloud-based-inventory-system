import React from 'react';

/**
 * MedicineTable Component
 * Displays medicines in a table format
 * 
 * Props:
 * - medicines: Array of medicine objects
 * - isLoading: Loading state
 * - onEdit: Function to handle edit action
 * - onDelete: Function to handle delete action
 */
const MedicineTable = ({ medicines, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading medicines...</p>
      </div>
    );
  }

  if (!medicines || medicines.length === 0) {
    return (
      <div className="table-empty">
        <p>No medicines found. Add your first medicine to get started!</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="table-container">
      <table className="medicines-table">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Generic Name</th>
            <th>Manufacturer</th>
            <th>Batch #</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine._id || medicine.id} className="medicine-row">
              <td className="medicine-name">{medicine.name}</td>
              <td>{medicine.genericName}</td>
              <td>{medicine.manufacturer}</td>
              <td className="batch-number">{medicine.batchNumber}</td>
              <td className="quantity">{medicine.quantity} units</td>
              <td className="price">{formatPrice(medicine.price)}</td>
              <td className="expiry-date">
                <span className={isExpired(medicine.expiryDate) ? 'expired' : isExpiringSoon(medicine.expiryDate) ? 'expiring-soon' : ''}>
                  {formatDate(medicine.expiryDate)}
                </span>
              </td>
              <td className="status">
                {isExpired(medicine.expiryDate) ? (
                  <span className="badge badge-danger">Expired</span>
                ) : isExpiringSoon(medicine.expiryDate) ? (
                  <span className="badge badge-warning">Expiring Soon</span>
                ) : medicine.quantity < 10 ? (
                  <span className="badge badge-info">Low Stock</span>
                ) : (
                  <span className="badge badge-success">OK</span>
                )}
              </td>
              <td className="actions">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => onEdit(medicine)}
                  title="Edit medicine"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => onDelete(medicine._id || medicine.id)}
                  title="Delete medicine"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicineTable;
