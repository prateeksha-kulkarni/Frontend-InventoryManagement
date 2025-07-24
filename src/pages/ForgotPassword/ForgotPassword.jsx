import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import styles from './ForgotPassword.module.css';
import authService from '../../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email. Please check your inbox.');
      sessionStorage.setItem('resetEmail', email);
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);
    } catch (err) {
      toast.error('Failed to send OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.forgotPasswordContainer}>
        {/* Toast notification in top-right corner */}
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />

        <div className={styles.forgotPasswordWrapper}>
          <div className={styles.forgotPasswordHeader}>
            <h1>Inventory Management System</h1>
            <p>Password Recovery</p>
          </div>

          <Card className={styles.forgotPasswordCard}>
            <h2 className={styles.forgotPasswordTitle}>Forgot Password</h2>

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
