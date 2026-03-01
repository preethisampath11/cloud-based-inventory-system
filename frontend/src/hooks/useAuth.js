import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useAuth Hook
 * Re-exported from context for easier imports
 * Use: const { user, login, logout, isAuthenticated } = useAuth();
 */
export { useAuth };

/**
 * useApi Hook
 * Provides loading and error states for API calls
 */
export const useApi = (apiCall) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

  const execute = React.useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiCall(...args);
        setData(response.data?.data || response.data);
        return response.data?.data || response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return { loading, error, data, execute };
};
