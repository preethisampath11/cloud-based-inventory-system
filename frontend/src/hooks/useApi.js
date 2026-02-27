import React from 'react';

/**
 * useApi Hook
 * Provides loading and error states for async API calls
 * 
 * Usage:
 * const { loading, error, data, execute } = useApi(medicineService.getMedicines);
 * useEffect(() => { execute(); }, []);
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
        const result = response.data?.data || response.data;
        setData(result);
        return result;
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
