import React, { useState, useCallback, useEffect } from 'react';
import AuthContext from './AuthContext';
import authService from '../services/authService';

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods
 * 
 * State:
 * - user: { id, email, role, name }
 * - token: JWT access token
 * - loading: boolean (true during auth operations)
 * - error: string (error message if any)
 * - isAuthenticated: boolean
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Verify token is still valid
          const userObj = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userObj);
          // Set axios default header
          authService.setAuthToken(storedToken);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      authService.setAuthToken(token);

      return { success: true, user };
    } catch (err) {
      // Network error
      if (!err.response) {
        const errorMessage =
          'Network error: Unable to connect to backend server. Make sure:\n' +
          '1. Backend server is running (npm run dev)\n' +
          '2. Backend is running on http://localhost:5000';
        setError(errorMessage);
        console.error('Network error:', err);
        return { success: false, error: errorMessage };
      }

      // 401 Unauthorized
      if (err.response?.status === 401) {
        const errorMessage =
          err.response.data?.message || 'Invalid email or password';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Other errors
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (email, password, name, role = 'pharmacist') => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(email, password, name, role);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      authService.setAuthToken(token);

      return { success: true, user };
    } catch (err) {
      // Network error
      if (!err.response) {
        const errorMessage =
          'Network error: Unable to connect to backend server. Make sure:\n' +
          '1. Backend server is running (npm run dev in parent directory)\n' +
          '2. Backend is running on http://localhost:5000\n' +
          '3. Check REACT_APP_API_URL in .env.local';
        setError(errorMessage);
        console.error('Network error:', err);
        return { success: false, error: errorMessage };
      }

      // Backend validation error (422)
      if (err.response?.status === 422) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          'Validation failed. Please check your input.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Other errors
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.clearAuthToken();
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Profile update failed.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
