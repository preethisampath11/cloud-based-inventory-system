import React from 'react';

/**
 * ErrorAlert Component
 * Display error messages to user
 */
const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="error-alert">
      <p>{message}</p>
      {onClose && <button onClick={onClose}>Dismiss</button>}
    </div>
  );
};

export default ErrorAlert;
