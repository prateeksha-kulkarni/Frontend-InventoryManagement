import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './ResetPassword.module.css';
import authService from '../../services/authService';
import LeftPanel from '../../components/LeftPanel/LeftPanel';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordRules = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });

  const validatePasswords = () => {
    const rules = validatePasswordRules(formData.password);

    if (Object.values(rules).includes(false)) {
      toast.error('Password does not meet the required criteria');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setLoading(true);

    try {
      await authService.resetPassword(email, formData.password);
      toast.success('Password reset successful!');
      sessionStorage.removeItem('resetEmail');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error('Failed to reset password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rules = validatePasswordRules(formData.password);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className={styles.resetPasswordContainer}>
        {/* Left Panel */}
        <LeftPanel
          title="Reset Your Password"
          description="Create a strong password to secure your account."
        />

        {/* Right Section */}
        <div className={styles.resetPasswordSection}>
          <h2 className={styles.resetPasswordTitle}>Create New Password</h2>
          <p className={styles.resetPasswordInfo}>
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className={styles.resetPasswordForm}>
            {/* Password Field */}
            <div className={styles.passwordField}>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter new password"
                minLength={8}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>

              {formData.password && (
                <ul className={styles.validationPopup}>
                  <li className={rules.length ? styles.valid : ''}>
                    <span className={styles.circleIcon}>
                      {rules.length ? '✔' : ''}
                    </span>
                    At least 8 characters
                  </li>
                  <li className={rules.upper ? styles.valid : ''}>
                    <span className={styles.circleIcon}>
                      {rules.upper ? '✔' : ''}
                    </span>
                    At least one uppercase letter
                  </li>
                  <li className={rules.lower ? styles.valid : ''}>
                    <span className={styles.circleIcon}>
                      {rules.lower ? '✔' : ''}
                    </span>
                    At least one lowercase letter
                  </li>
                  <li className={rules.number ? styles.valid : ''}>
                    <span className={styles.circleIcon}>
                      {rules.number ? '✔' : ''}
                    </span>
                    At least one number
                  </li>
                  <li className={rules.special ? styles.valid : ''}>
                    <span className={styles.circleIcon}>
                      {rules.special ? '✔' : ''}
                    </span>
                    At least one special character
                  </li>
                </ul>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className={styles.passwordField}>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
                minLength={8}
              />
              <span
                className={styles.eyeIcon}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={
                loading || !formData.password || !formData.confirmPassword
              }
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className={styles.backToLoginLink}>
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;