import React from 'react';

/**
 * LoadingSpinner Component
 * Generic loading indicator
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
