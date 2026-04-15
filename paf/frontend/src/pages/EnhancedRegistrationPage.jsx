import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, isValidCampusEmail } from '../services/authService';
import './EnhancedRegistrationPage.css';

const EnhancedRegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    faculty: '',
    itNumber: '',
    campusEmail: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const faculties = [
    { value: '', label: 'Select your faculty', icon: '🎓' },
    { value: 'COMPUTING', label: 'Computing', icon: '💻' },
    { value: 'ENGINEERING', label: 'Engineering', icon: '⚙️' },
    { value: 'BUSINESS', label: 'SLIIT Business School', icon: '💼' },
    { value: 'HUMANITIES', label: 'Humanities & Sciences', icon: '📚' },
    { value: 'GRADUATE', label: 'Graduate Studies', icon: '🎓' },
    { value: 'ARCHITECTURE', label: 'School of Architecture', icon: '🏛️' },
    { value: 'LAW', label: 'School of Law', icon: '⚖️' },
    { value: 'HOSPITALITY', label: 'School of Hospitality & Culinary', icon: '🍳' },
    { value: 'FOUNDATION', label: 'Foundation Programme', icon: '📖' }
  ];

  // Auto-generate campus email when IT number changes
  useEffect(() => {
    if (formData.itNumber && formData.itNumber.length === 10) {
      const email = `${formData.itNumber}@my.sliit.lk`;
      setFormData(prev => ({ ...prev, campusEmail: email }));
    }
  }, [formData.itNumber]);

  const validateITNumber = (itNumber) => {
    const pattern = /^[A-Za-z]{2}\d{8}$/;
    return pattern.test(itNumber);
  };

  const validateFullName = (name) => {
    if (!name || name.trim().length === 0) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name must not exceed 100 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length === 0) return 'Password is required';
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least 1 uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least 1 lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least 1 number';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation for full name
    if (name === 'fullName') {
      const nameError = validateFullName(value);
      if (nameError) {
        setFieldErrors(prev => ({ ...prev, fullName: nameError }));
      }
    }
    
    // Real-time validation for faculty
    if (name === 'faculty') {
      if (!value) {
        setFieldErrors(prev => ({ ...prev, faculty: 'Please select your faculty' }));
      }
    }
  };

  const handleITNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, itNumber: value }));
    
    if (value && !validateITNumber(value)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        itNumber: 'Format: 2 letters + 8 digits (e.g., IT12345678)' 
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, itNumber: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    
    // Real-time password validation
    const pwdError = validatePassword(value);
    if (pwdError) {
      setFieldErrors(prev => ({ ...prev, password: pwdError }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    
    // Check if confirm password matches
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    
    // Real-time confirm password validation
    if (value !== formData.password) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};

    // Validate full name
    const nameError = validateFullName(formData.fullName);
    if (nameError) errors.fullName = nameError;
    
    // Validate faculty
    if (!formData.faculty) errors.faculty = 'Please select your faculty';
    
    // Validate IT number
    if (!formData.itNumber) {
      errors.itNumber = 'IT Number is required';
    } else if (!validateITNumber(formData.itNumber)) {
      errors.itNumber = 'Invalid format. Use 2 letters + 8 digits (e.g., IT12345678)';
    }
    
    // Validate campus email
    if (!isValidCampusEmail(formData.campusEmail)) {
      errors.campusEmail = 'Invalid campus email format';
    }
    
    // Validate password
    const pwdError = validatePassword(formData.password);
    if (pwdError) errors.password = pwdError;
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      await register(formData.fullName, formData.campusEmail, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-registration-page">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="modern-registration-card">
        <div className="card-header">
          <div className="logo-badge">
            <span className="graduation-cap">🎓</span>
          </div>
          <h1 className="card-title">Create Account</h1>
          <p className="card-subtitle">Smart Campus Hub</p>
          <p className="card-description">Register with your SLIIT campus email</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-field">
              <label className="field-label">FULL NAME</label>
              <div className="input-group">
                <span className="input-prefix">👤</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={
                    fieldErrors.fullName 
                      ? 'input-error' 
                      : (formData.fullName && !validateFullName(formData.fullName) ? 'input-valid' : '')
                  }
                  required
                />
                {formData.fullName && !fieldErrors.fullName && !validateFullName(formData.fullName) && (
                  <span className="input-success-icon">✓</span>
                )}
              </div>
              {fieldErrors.fullName && (
                <span className="field-error">{fieldErrors.fullName}</span>
              )}
            </div>

            {/* Faculty */}
            <div className="form-field">
              <label className="field-label">FACULTY</label>
              <div className="input-group">
                <span className="input-prefix">🎓</span>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={fieldErrors.faculty ? 'input-error' : ''}
                  required
                >
                  {faculties.map(f => (
                    <option key={f.value} value={f.value}>
                      {f.icon} {f.label}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
              {fieldErrors.faculty && (
                <span className="field-error">{fieldErrors.faculty}</span>
              )}
            </div>

            {/* IT Number */}
            <div className="form-field">
              <label className="field-label">IT NUMBER</label>
              <div className="input-group">
                <span className="input-prefix">🆔</span>
                <input
                  type="text"
                  name="itNumber"
                  value={formData.itNumber}
                  onChange={handleITNumberChange}
                  placeholder="AB12345678"
                  maxLength="10"
                  className={
                    fieldErrors.itNumber 
                      ? 'input-error' 
                      : (formData.itNumber && validateITNumber(formData.itNumber) ? 'input-valid' : '')
                  }
                  required
                />
                {formData.itNumber && !fieldErrors.itNumber && validateITNumber(formData.itNumber) && (
                  <span className="input-success-icon">✓</span>
                )}
              </div>
              {fieldErrors.itNumber && (
                <span className="field-error">{fieldErrors.itNumber}</span>
              )}
              {!fieldErrors.itNumber && formData.itNumber && formData.itNumber.length > 0 && (
                <span className="field-hint">
                  {formData.itNumber.length}/10 characters
                </span>
              )}
            </div>

            {/* Campus Email */}
            <div className="form-field">
              <label className="field-label">CAMPUS EMAIL</label>
              <div className="input-group">
                <span className="input-prefix">📧</span>
                <input
                  type="email"
                  name="campusEmail"
                  value={formData.campusEmail}
                  readOnly
                  placeholder="12345678@my.sliit.lk"
                  className="input-readonly"
                />
              </div>
              <span className="field-hint">Use your SLIIT email (AB********@my.sliit.lk)</span>
            </div>

            {/* Password */}
            <div className="form-field">
              <label className="field-label">PASSWORD</label>
              <div className="input-group">
                <span className="input-prefix">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="8+ chars, uppercase, lowercase, number"
                  className={fieldErrors.password ? 'input-error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
              {!fieldErrors.password && formData.password && (
                <div className="password-requirements">
                  <div className={formData.password.length >= 8 ? 'requirement-met' : 'requirement-unmet'}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={/[A-Z]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                  </div>
                  <div className={/[a-z]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                  </div>
                  <div className={/[0-9]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label className="field-label">CONFIRM PASSWORD</label>
              <div className="input-group">
                <span className="input-prefix">🔑</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Re-enter your password"
                  className={fieldErrors.confirmPassword ? 'input-error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            <span className="button-icon">🚀</span>
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="card-footer">
          <p className="footer-text">
            Already have an account? <Link to="/login" className="footer-link">Sign in</Link>
          </p>
          <p className="terms-text">
            By registering, you agree to the Smart Campus<br />
            terms of use and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegistrationPage;
