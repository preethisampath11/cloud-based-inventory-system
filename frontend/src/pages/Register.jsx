import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import ConnectionDiagnostics from '../components/ConnectionDiagnostics';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

/**
 * Register Page
 * New user registration form with admin request option
 * 
 * Features:
 * - Email/password registration
 * - Admin access request (requires approval)
 * - Real-time password validation
 * - Error handling
 * - Redirect to login
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError, clearError } = useAuth();
  const [registrationType, setRegistrationType] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pharmacist',
    reason: '', // For admin request only
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);

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

      case 'reason':
        if (registrationType === 'admin') {
          if (!value || value.trim().length < 10) {
            errors.reason = 'Please provide at least 10 characters explaining why you need admin access';
          } else if (value.length > 500) {
            errors.reason = 'Reason should not exceed 500 characters';
          } else {
            delete errors.reason;
          }
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
    const baseValid = (
      formData.name.trim() &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      Object.keys(validationErrors).length === 0
    );

    if (registrationType === 'admin') {
      return baseValid && formData.reason.trim().length >= 10 && !validationErrors.reason;
    }

    return baseValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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

    if (registrationType === 'admin') {
      // Submit admin request
      handleAdminRequest();
    } else {
      // Regular user registration
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
    }
  };

  const handleAdminRequest = async () => {
    try {
      setAdminLoading(true);
      setError(null);

      await authService.requestAdminAccess({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        reason: formData.reason,
      });

      setSuccess('Admin request submitted successfully! Please check your email for confirmation. You will receive approval email once the admin reviews your request.');
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'pharmacist',
          reason: '',
        });
        setValidationErrors({});
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit admin request');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <ConnectionDiagnostics />

        {/* Registration Type Selector */}
        <div className="registration-type-selector" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`type-button ${registrationType === 'user' ? 'active' : ''}`}
            onClick={() => {
              setRegistrationType('user');
              setError(null);
              setSuccess(null);
              clearError();
            }}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: registrationType === 'user' ? '#6366f1' : '#e0e7ff',
              color: registrationType === 'user' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Register as User
          </button>
          <button
            type="button"
            className={`type-button ${registrationType === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRegistrationType('admin');
              setError(null);
              setSuccess(null);
              clearError();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: registrationType === 'admin' ? '#6366f1' : '#e0e7ff',
              color: registrationType === 'admin' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Request Admin Access
          </button>
        </div>

        {/* Admin Request Info */}
        {registrationType === 'admin' && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            color: '#1e40af',
            fontSize: '14px',
          }}>
            <strong>ℹ️ Admin Access:</strong> Your request will be sent for approval. You'll receive an email confirmation once the admin reviews your request. If approved, you'll be able to log in with admin privileges.
          </div>
        )}

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
              disabled={loading || adminLoading}
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
              disabled={loading || adminLoading}
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
              disabled={loading || adminLoading}
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
              disabled={loading || adminLoading}
              placeholder="Re-enter your password"
              className={validationErrors.confirmPassword ? 'input-error' : ''}
              required
            />
          </div>

          {registrationType === 'user' && (
            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading || adminLoading}
              >
                <option value="pharmacist">Pharmacist</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          )}

          {registrationType === 'admin' && (
            <div className="form-group">
              <label htmlFor="reason">
                Why do you need admin access?
                {validationErrors.reason && (
                  <span className="field-error"> - {validationErrors.reason}</span>
                )}
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={loading || adminLoading}
                placeholder="Please describe your reason for requesting admin access (minimum 10 characters)"
                className={validationErrors.reason ? 'input-error' : ''}
                rows="4"
                maxLength="500"
                required
              />
              <small style={{ color: '#666' }}>
                {formData.reason.length}/500 characters
              </small>
            </div>
          )}

          {(error || authError) && (
            <div className="error-message error-message-multiline">
              {(error || authError).split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}

          {success && <SuccessAlert message={success} />}

          <button
            type="submit"
            disabled={loading || adminLoading || !isFormValid()}
            className={!isFormValid() ? 'btn-disabled' : ''}
          >
            {adminLoading || loading ? (
              registrationType === 'admin' ? 'Submitting request...' : 'Creating account...'
            ) : (
              registrationType === 'admin' ? 'Request Admin Access' : 'Register'
            )}
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
