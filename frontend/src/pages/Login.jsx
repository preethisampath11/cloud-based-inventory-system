import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionDiagnostics from '../components/ConnectionDiagnostics';

/**
 * Login Page
 * User authentication form
 * 
 * Features:
 * - Email/password login
 * - Real-time validation
 * - Error handling
 * - Redirect to register
 * - Remember token in localStorage
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateField = (name, value) => {
    let errors = { ...validationErrors };

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    clearError();
    validateField(name, value);
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Pharmacy Inventory System</h1>
        <ConnectionDiagnostics />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email:
              {validationErrors.email && (
                <span className="field-error"> - {validationErrors.email}</span>
              )}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="your.email@example.com"
              className={validationErrors.email ? 'input-error' : ''}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password:
              {validationErrors.password && (
                <span className="field-error"> - {validationErrors.password}</span>
              )}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your password"
              className={validationErrors.password ? 'input-error' : ''}
              required
            />
          </div>

          {(error || authError) && (
            <div className="error-message error-message-multiline">
              {(error || authError).split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading || !isFormValid()}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="link-button"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
