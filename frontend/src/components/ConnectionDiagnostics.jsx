import React, { useEffect, useState } from 'react';

/**
 * ConnectionDiagnostics Component
 * Shows API connection status and debugging information
 * Useful for troubleshooting network errors
 */
const ConnectionDiagnostics = () => {
  const [connected, setConnected] = useState(null);
  const [status, setStatus] = useState('Checking...');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
  const backendUrl = apiUrl.replace('/api/v1', ''); // Get base backend URL

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Call health endpoint directly using fetch, bypassing apiClient baseURL
        const response = await fetch(`${backendUrl}/api/health`, {
          timeout: 5000,
        });

        if (response.ok) {
          setConnected(true);
          setStatus('✓ Backend is running and responding');
        } else {
          setConnected(false);
          setStatus(`✗ Server error: ${response.status}`);
        }
      } catch (err) {
        // Network error
        setConnected(false);
        setStatus(
          `✗ Cannot connect to ${backendUrl} - Backend server may not be running`
        );
      }
    };

    const timer = setTimeout(checkConnection, 1000);
    return () => clearTimeout(timer);
  }, [backendUrl]);

  const bgColor =
    connected === true
      ? '#d4edda'
      : connected === false
      ? '#f8d7da'
      : '#fff3cd';
  const borderColor =
    connected === true
      ? '#c3e6cb'
      : connected === false
      ? '#f5c6cb'
      : '#ffeaa7';
  const textColor =
    connected === true
      ? '#155724'
      : connected === false
      ? '#dc3545'
      : '#856404';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderLeft: `4px solid ${borderColor}`,
        padding: '10px 12px',
        margin: '10px 0',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: textColor,
      }}
    >
      <div style={{ marginBottom: '5px', fontWeight: 600 }}>
        {status}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
        API URL: {apiUrl}
      </div>
      {connected === false && (
        <div style={{ fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic' }}>
          💡 Make sure the backend is running with: <code>npm run dev</code>
        </div>
      )}
    </div>
  );
};

export default ConnectionDiagnostics;
