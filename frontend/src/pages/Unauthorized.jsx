import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Unauthorized/Access Denied Page
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <h1>403 - Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <button onClick={() => navigate('/')}>Go to Dashboard</button>
    </div>
  );
};

export default Unauthorized;
