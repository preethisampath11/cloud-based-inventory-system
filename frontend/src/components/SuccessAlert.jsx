import React from 'react';

/**
 * SuccessAlert Component
 * Display success messages to user
 */
const SuccessAlert = ({ message, onClose }) => {
  return (
    <div className="success-alert">
      <p>{message}</p>
      {onClose && <button onClick={onClose}>Dismiss</button>}
    </div>
  );
};

export default SuccessAlert;
