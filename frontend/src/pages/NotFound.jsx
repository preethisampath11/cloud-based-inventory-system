import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')}>Go to Dashboard</button>
    </div>
  );
};

export default NotFound;
