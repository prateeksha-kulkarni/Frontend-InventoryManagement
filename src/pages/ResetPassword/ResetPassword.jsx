import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import styles from './ResetPassword.module.css';
import authService from '../../services/authService';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      // Redirect to forgot password page if email is not found
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswords = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resetPassword(email, formData.password);
      setSuccess('Password reset successful!');
      // Clear sessionStorage
      sessionStorage.removeItem('resetEmail');
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.resetPasswordWrapper}>
        <div className={styles.resetPasswordHeader}>
          <h1>Inventory Management System</h1>
          <p>Reset Password</p>
        </div>

        <Card className={styles.resetPasswordCard}>
          <h2 className={styles.resetPasswordTitle}>Create New Password</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <p className={styles.resetPasswordInfo}>
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className={styles.resetPasswordForm}>
            <Input
              label="New Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter new password"
              minLength={8}
            />

            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
              minLength={8}
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
            
            <div className={styles.backToLoginLink}>
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;