import React, { useState, useRef, useEffect } from 'react';

/**
 * ActionDropdown Component
 * Dropdown menu for table row actions
 * 
 * Props:
 * - purchase: Purchase object
 * - onView: Handler for view action
 * - onEdit: Handler for edit action
 * - onMarkReceived: Handler for mark as received
 * - onDelete: Handler for delete action
 */
const ActionDropdown = ({
  purchase,
  onView,
  onEdit,
  onMarkReceived,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      <button
        className="action-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Actions"
        aria-label="Actions"
      >
        ⋮
      </button>

      {isOpen && (
        <div className="action-menu">
          <button
            className="action-item"
            onClick={() => handleAction(onView)}
          >
            👁️ View
          </button>
          <button
            className="action-item"
            onClick={() => handleAction(onEdit)}
          >
            ✏️ Edit
          </button>
          {purchase.status !== 'received' && (
            <button
              className="action-item"
              onClick={() => handleAction(onMarkReceived)}
            >
              ✓ Mark as Received
            </button>
          )}
          <button
            className="action-item action-delete"
            onClick={() => handleAction(onDelete)}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
