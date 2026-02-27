import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * With role restriction:
 * <ProtectedRoute requiredRoles={['admin', 'pharmacist']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  requiredRoles = null,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show nothing while loading auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    if (!user?.role || !requiredRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
