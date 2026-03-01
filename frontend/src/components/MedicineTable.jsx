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
 * - canEdit: Boolean indicating if user can edit/delete medicines
 */
const MedicineTable = ({ medicines, isLoading, onEdit, onDelete, canEdit = false }) => {
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

  return (
    <div className="table-container">
      <table className="medicines-table">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Generic Name</th>
            <th>Manufacturer</th>
            <th>Dosage Form</th>
            <th>Dosage Strength</th>
            <th>Category</th>
            <th>Reorder Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine._id || medicine.id} className="medicine-row">
              <td className="medicine-name">{medicine.name}</td>
              <td>{medicine.genericName}</td>
              <td>{medicine.manufacturer}</td>
              <td>{medicine.dosageForm || '-'}</td>
              <td>{medicine.dosageStrength || '-'}</td>
              <td>{medicine.category || '-'}</td>
              <td className="reorder-level">{medicine.reorderLevel || 50} units</td>
              <td className="actions">
                {canEdit ? (
                  <>
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
                  </>
                ) : (
                  <span className="text-muted">No actions available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicineTable;
