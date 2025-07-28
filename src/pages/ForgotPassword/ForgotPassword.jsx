import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './ForgotPassword.module.css';
import authService from '../../services/authService';
import LeftPanel from '../../components/LeftPanel/LeftPanel';
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
    <>
      {/* Toast notification */}
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
        // theme="colored"
      />

      <div className={styles.forgotPasswordContainer}>
        {/* Left Panel */}
        <LeftPanel
          title="Forgot Password?"
          description="No worries! Enter your email and we’ll send you an OTP to reset your password."
        />

        {/* Right Panel */}
        <div className={styles.forgotPasswordSection}>
          <h1 className={styles.forgotPasswordTitle}>Password Recovery</h1>
          <p className={styles.forgotPasswordSubtitle}>
            Enter your email address to get an OTP
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

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
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

export default ForgotPassword;

