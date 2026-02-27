import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionDiagnostics from '../components/ConnectionDiagnostics';

/**
 * Register Page
 * New user registration form
 * 
 * Features:
 * - Email/password registration
 * - Name input
 * - Role selection (pharmacist, cashier)
 * - Real-time password validation
 * - Error handling
 * - Redirect to login
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pharmacist',
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Real-time validation
  const validateField = (name, value) => {
    let errors = { ...validationErrors };

    switch (name) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errors.name = 'Name must be at least 3 characters';
        } else {
          delete errors.name;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!value || value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else if (!/\d/.test(value) && !/[!@#$%^&*]/.test(value)) {
          errors.password =
            'Password should contain numbers or special characters for better security';
        } else {
          delete errors.password;
        }
        // Check if confirm password needs update
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
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
      formData.name.trim() &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Final validation before submit
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register(
      formData.email,
      formData.password,
      formData.name,
      formData.role
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <ConnectionDiagnostics />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Full Name:
              {validationErrors.name && (
                <span className="field-error"> - {validationErrors.name}</span>
              )}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your full name"
              className={validationErrors.name ? 'input-error' : ''}
              required
            />
          </div>

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
              <span className="password-requirement">
                {' '}
                (minimum 6 characters)
              </span>
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
              placeholder="At least 6 characters"
              className={validationErrors.password ? 'input-error' : ''}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password:
              {validationErrors.confirmPassword && (
                <span className="field-error">
                  {' '}
                  - {validationErrors.confirmPassword}
                </span>
              )}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Re-enter your password"
              className={validationErrors.confirmPassword ? 'input-error' : ''}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="pharmacist">Pharmacist</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          {(error || authError) && (
            <div className="error-message error-message-multiline">
              {(error || authError).split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={!isFormValid() ? 'btn-disabled' : ''}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="link-button"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
