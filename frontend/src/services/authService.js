import apiClient, { setAuthToken, clearAuthToken } from './api';

/**
 * Authentication Service
 * Handles login, register, profile management
 */
const authService = {
  /**
   * Login with email and password
   */
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Register new user
   */
  register: (email, password, name, role = 'pharmacist') => {
    return apiClient.post('/auth/register', {
      email,
      password,
      name,
      role,
    });
  },

  /**
   * Get current user profile
   */
  getProfile: () => {
    return apiClient.get('/auth/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: (userData) => {
    return apiClient.put('/auth/profile', userData);
  },

  /**
   * Set auth token (used by AuthProvider)
   */
  setAuthToken,

  /**
   * Clear auth token (used on logout)
   */
  clearAuthToken,
};

export default authService;
