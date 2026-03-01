import React from 'react';

/**
 * ConfirmationModal Component
 * Modal for confirming destructive actions
 * 
 * Props:
 * - isOpen: Whether modal is open
 * - title: Modal title
 * - message: Confirmation message
 * - confirmText: Confirm button text (default: "Delete")
 * - onConfirm: Handler for confirmation
 * - onCancel: Handler for cancellation
 * - isLoading: Loading state
 * - isDangerous: If true, shows red styling
 */
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal open" onClick={onCancel}>
      <div className="confirmation-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <h3>{title}</h3>
          <button
            className="confirmation-close"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="confirmation-body">
          <p>{message}</p>
        </div>

        <div className="confirmation-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`btn-confirm ${isDangerous ? 'btn-danger' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
