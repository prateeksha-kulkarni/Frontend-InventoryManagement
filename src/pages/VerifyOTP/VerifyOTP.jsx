import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './VerifyOTP.module.css';
import authService from '../../services/authService';
import LeftPanel from '../../components/LeftPanel/LeftPanel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail.toLowerCase());
    }
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.verifyOTP(email, otp);

      if (result.valid || result.message?.toLowerCase().includes("verified")) {
        toast.success('✅ OTP verified successfully!');
        setTimeout(() => navigate('/reset-password'), 1500);
      } else {
        toast.error(result.message || '❌ Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      toast.error(err.message || '❌ Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className={styles.verifyOTPContainer}>
        {/* Left Panel */}
        <LeftPanel
          title="Verify Your OTP"
          description="Enter the 6-digit OTP sent to your email to continue."
        />

        {/* Right Panel */}
        <div className={styles.verifyOTPSection}>
          <h1 className={styles.verifyOTPTitle}>Enter OTP</h1>
          <p className={styles.verifyOTPSubtitle}>
            We’ve sent a 6-digit OTP to your registered email.
          </p>

          <form onSubmit={handleSubmit} className={styles.verifyOTPForm}>
            <Input
              label="OTP"
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleChange}
              required
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              pattern="[0-9]{6}"
              title="Please enter a 6-digit number"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className={styles.resendOTPLink}>
              <Link to="/forgot-password">Resend OTP</Link>
            </div>
            <div className={styles.backToLoginLink}>
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;
