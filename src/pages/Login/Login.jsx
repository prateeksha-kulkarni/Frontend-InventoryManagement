import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Login.module.css';
import logo from '../../assets/images/logo.png';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'Associate',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          {/* Logo Section */}
          <div className={styles.logoWrapper}>
            <div className={styles.logoCircle}>
              <img src={logo} alt="Logo" className={styles.logoImage} />
            </div>
          </div>

          {/* Form Section */}
          <div className={styles.formWrapper}>
            <h2 className={styles.title}>Login</h2>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Username */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username</label>
                <Input
                    type="text"
                    name="username"
                    placeholder="Enter your Username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
              </div>

              {/* Password */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <Input
                    type="password"
                    name="password"
                    placeholder="Enter your Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
              </div>

              {/* Role Selection (4 Roles) */}
              <div className={styles.roleSelector}>
                <label className={styles.label}>Login as:</label>
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

              {/* Sign In Button */}
              <Button type="submit" fullWidth disabled={loading} className={styles.signInButton}>
                {loading ? 'Logging in...' : 'Sign In'}
              </Button>

              {/* Forgot Password */}
              <div className={styles.forgotPassword}>
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;
