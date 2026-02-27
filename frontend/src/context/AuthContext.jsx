import { createContext, useContext } from 'react';

/**
 * Auth Context
 * Provides authentication state to all components
 * Includes: user data, token, loading state, error state
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * @throws {Error} if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
