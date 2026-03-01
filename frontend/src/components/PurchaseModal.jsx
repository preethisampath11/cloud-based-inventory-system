import React from 'react';
import PurchaseForm from './PurchaseForm';

/**
 * PurchaseModal Component
 * Modal dialog for creating purchase orders
 * 
 * Props:
 * - isOpen: Whether modal is open
 * - onClose: Handler to close modal
 * - medicines: Array of available medicines
 * - suppliers: Array of available suppliers
 * - onSubmit: Handler for form submission
 * - isLoading: Loading state during submission
 */
const PurchaseModal = ({
  isOpen,
  onClose,
  medicines = [],
  suppliers = [],
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Purchase Order</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <PurchaseForm
            medicines={medicines}
            suppliers={suppliers}
            onSubmit={(data) => {
              onSubmit(data);
              // Modal will be closed by parent component
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
