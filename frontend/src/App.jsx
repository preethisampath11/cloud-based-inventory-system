import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Batches from './pages/Batches';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

/**
 * Main App Component
 * 
 * Route Structure:
 * - /login - Public login page
 * - /register - Public registration page
 * - /dashboard - Protected dashboard
 * - /medicines/* - Protected medicines management
 * - /batches/* - Protected batch management
 * - /purchases/* - Protected purchase orders
 * - /sales/* - Protected sales transactions
 * - /reports/* - Protected reports and analytics
 * - /ai - Protected AI assistant
 * - /profile - Protected user profile
 * - /unauthorized - Access denied page
 * - /* - 404 not found
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medicines/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Medicines />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/batches/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Batches />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/purchases/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Purchases />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sales/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sales />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/*"
              element={
                <ProtectedRoute requiredRoles={['admin', 'pharmacist']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AIAssistant />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
