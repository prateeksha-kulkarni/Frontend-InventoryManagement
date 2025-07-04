// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import Button from '../../components/Button/Button';
// import Input from '../../components/Input/Input';
// import Card from '../../components/Card/Card';
// import styles from './Login.module.css';
//
// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: '',
//     password: '',
//     role: 'Associate' // Default role
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();
//
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCredentials(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//
//     try {
//       await login(credentials);
//       navigate('/dashboard');
//     } catch (err) {
//       setError('Invalid credentials. Please try again.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className={styles.loginContainer}>
//       <div className={styles.loginWrapper}>
//         <div className={styles.loginHeader}>
//           <h1>Inventory Management System</h1>
//           <p>Store-level inventory control and management</p>
//         </div>
//
//         <Card className={styles.loginCard}>
//           <h2 className={styles.loginTitle}>Login</h2>
//
//           {error && <div className={styles.errorMessage}>{error}</div>}
//
//           {/*<div className={styles.loginInfo}>*/}
//           {/*  <p>For demo purposes, you can use any username and password.</p>*/}
//           {/*  <p>Just select your role and click Login.</p>*/}
//           {/*</div>*/}
//
//           <form onSubmit={handleSubmit} className={styles.loginForm}>
//             <Input
//               label="Username"
//               type="text"
//               id="username"
//               name="username"
//               value={credentials.username}
//               onChange={handleChange}
//               required
//               placeholder="Enter any username"
//             />
//
//             <Input
//               label="Password"
//               type="password"
//               id="password"
//               name="password"
//               value={credentials.password}
//               onChange={handleChange}
//               required
//               placeholder="Enter any password"
//             />
//
//             <div className={styles.roleSelector}>
//               <label>Login as:</label>
//               <div className={styles.roleOptions}>
//                 <label className={styles.roleOption}>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="Associate"
//                     checked={credentials.role === 'Associate'}
//                     onChange={handleChange}
//                   />
//                   <span>Associate</span>
//                 </label>
//
//                 <label className={styles.roleOption}>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="Analyst"
//                     checked={credentials.role === 'Analyst'}
//                     onChange={handleChange}
//                   />
//                   <span>Analyst</span>
//                 </label>
//
//                 <label className={styles.roleOption}>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="Manager"
//                     checked={credentials.role === 'Manager'}
//                     onChange={handleChange}
//                   />
//                   <span>Manager</span>
//                 </label>
//
//                 <label className={styles.roleOption}>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="Admin"
//                     checked={credentials.role === 'Admin'}
//                     onChange={handleChange}
//                   />
//                   <span>Admin</span>
//                 </label>
//               </div>
//             </div>
//
//             <Button
//               type="submit"
//               variant="primary"
//               fullWidth
//               disabled={loading}
//             >
//               {loading ? 'Logging in...' : 'Login'}
//             </Button>
//           </form>
//         </Card>
//       </div>
//     </div>
//   );
// };
//
// export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import styles from './Login.module.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'Associate'
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.loginContainer}>
        <div className={styles.loginWrapper}>
          <div className={styles.loginHeader}>
            <h1>Inventory Management System</h1>
            <p>Store-level inventory control and management</p>
          </div>

          <Card className={styles.loginCard}>
            <h2 className={styles.loginTitle}>Login</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <Input
                  label="Username"
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter any username"
              />

              <Input
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter any password"
              />

              <div className={styles.roleSelector}>
                <label>Login as:</label>
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

              <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className={styles.forgotPasswordLink}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
  );
};

export default Login;

