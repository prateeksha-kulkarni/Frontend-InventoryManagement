import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import styles from './VerifyOTP.module.css';
import authService from '../../services/authService';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail.toLowerCase()); // force lowercase for consistency
    }
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log("📨 Email:", email);
    console.log("🔢 OTP entered:", otp);

    try {
      const result = await authService.verifyOTP(email, otp);
      console.log("✅ Backend response:", result);

      if (result.valid || result.message?.toLowerCase().includes("verified")) {
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.verifyOTPContainer}>
        <div className={styles.verifyOTPWrapper}>
          <div className={styles.verifyOTPHeader}>
            <h1>Inventory Management System</h1>
            <p>Verify OTP</p>
          </div>

          <Card className={styles.verifyOTPCard}>
            <h2 className={styles.verifyOTPTitle}>Enter OTP</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <p className={styles.verifyOTPInfo}>
              Please enter the 6-digit OTP sent to your email address.
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
          </Card>
        </div>
      </div>
  );
};

export default VerifyOTP;
