import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import styles from './ForgotPassword.module.css';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.forgotPassword(email);
      setSuccess('OTP sent to your email. Please check your inbox.');
      // Store email in sessionStorage to use it in the OTP verification page
      sessionStorage.setItem('resetEmail', email);
      // Navigate to OTP verification page after a short delay
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordWrapper}>
        <div className={styles.forgotPasswordHeader}>
          <h1>Inventory Management System</h1>
          <p>Password Recovery</p>
        </div>

        <Card className={styles.forgotPasswordCard}>
          <h2 className={styles.forgotPasswordTitle}>Forgot Password</h2>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <p className={styles.forgotPasswordInfo}>
            Enter your email address below. We'll send you an OTP to verify your identity.
          </p>

          <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
            <Input
              label="Email"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
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

export default ForgotPassword;