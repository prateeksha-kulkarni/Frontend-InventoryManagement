import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import styles from './Login.module.css';
import logo from '../../assets/images/logo1.jpg';
import { Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'Associate',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        {/* Toast Container */}
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
        />

        {/* Login Main Container */}
        <div className={styles.loginContainer}>
          {/* Left Logo Section */}
          <div className={styles.imageSection}>
            <div className={styles.logoCircle}>
              <img src={logo} alt="Company Logo" className={styles.logoImage} />
            </div>
            <div className={styles.welcomeContent}>
              <h2>Welcome Back</h2>
              <p>
                Access your professional dashboard and manage your account with our secure login portal.
              </p>
            </div>
          </div>

          {/* Right Form Section */}
          <div className={styles.loginSection}>
            <h1 className={styles.loginTitle}>Stockpilot</h1>
            <p className={styles.loginSubtitle}>Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Username */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username</label>
                <input
                    type="text"
                    name="username"
                    placeholder="Enter your Username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
              </div>

              {/* Password with Eye */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordContainer}>
                  <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your Password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                      className={styles.input}
                  />
                  <span
                      className={styles.eyeIcon}
                      onClick={() => setShowPassword(prev => !prev)}
                  >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                </div>
              </div>

              {/* Role Selection */}
              <div className={styles.roleSelector}>
                <label className={styles.label}>Select Role</label>
                <div className={styles.roleOptions}>
                  {['Associate', 'Analyst', 'Manager', 'Admin'].map(role => (
                      <label key={role} className={styles.roleOption}>
                        <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={credentials.role === role}
                            onChange={handleChange}
                        />
                        <span>{role}</span>
                      </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  className={styles.signInButton}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Forgot Password */}
              <div className={styles.forgotPassword}>
                <a href="/forgot-password">Forgot your password?</a>
              </div>
            </form>
          </div>
        </div>
      </>
  );
};

export default Login;
