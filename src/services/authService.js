// // // // // Authentication service for handling login, logout, and token management
// // // //
// // // // const API_URL = '/api';
// // // //
// // // // const authService = {
// // // //   // Login user and store JWT token
// // // //   login: async (credentials) => {
// // // //     try {
// // // //       // In a real app, this would be an actual API call
// // // //       // const response = await axios.post(`${API_URL}/login`, credentials);
// // // //
// // // //       // For demo purposes, simulating a successful login response
// // // //       const mockResponse = {
// // // //         token: 'mock-jwt-token',
// // // //         user: {
// // // //           id: 1,
// // // //           username: credentials.username,
// // // //           role: credentials.role || 'Associate', // Default role if not provided
// // // //           name: 'John Doe'
// // // //         }
// // // //       };
// // // //
// // // //       // Store token and user info in localStorage
// // // //       localStorage.setItem('token', mockResponse.token);
// // // //       localStorage.setItem('user', JSON.stringify(mockResponse.user));
// // // //
// // // //       return mockResponse;
// // // //     } catch (error) {
// // // //       throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
// // // //     }
// // // //   },
// // // //
// // // //   // Logout user and clear storage
// // // //   logout: () => {
// // // //     localStorage.removeItem('token');
// // // //     localStorage.removeItem('user');
// // // //   },
// // // //
// // // //   // Get current user information
// // // //   getCurrentUser: () => {
// // // //     const userStr = localStorage.getItem('user');
// // // //     if (!userStr) return null;
// // // //     return JSON.parse(userStr);
// // // //   },
// // // //
// // // //   // Check if user is logged in
// // // //   isLoggedIn: () => {
// // // //     return !!localStorage.getItem('token');
// // // //   },
// // // //
// // // //   // Get authentication token
// // // //   getToken: () => {
// // // //     return localStorage.getItem('token');
// // // //   },
// // // //
// // // //   // Check if user has required role
// // // //   hasRole: (requiredRole) => {
// // // //     const user = authService.getCurrentUser();
// // // //     if (!user) return false;
// // // //
// // // //     // Role hierarchy: Manager > Analyst > Associate
// // // //     if (requiredRole === 'Associate') {
// // // //       return ['Associate', 'Analyst', 'Manager'].includes(user.role);
// // // //     } else if (requiredRole === 'Analyst') {
// // // //       return ['Analyst', 'Manager'].includes(user.role);
// // // //     } else if (requiredRole === 'Manager') {
// // // //       return user.role === 'Manager';
// // // //     }
// // // //
// // // //     return false;
// // // //   }
// // // // };
// // // //
// // // // export default authService;
// // //
// // //
// // // const API_URL = 'http://localhost:8081/api/auth';
// // //
// // // const authService = {
// // //   // Login user and store JWT token
// // //   login: async (credentials) => {
// // //     const response = await fetch(`${API_URL}/login`, {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify(credentials)
// // //     });
// // //
// // //     if (!response.ok) {
// // //       const errMsg = await response.text();
// // //       throw new Error('Login failed: ' + errMsg);
// // //     }
// // //
// // //     const data = await response.json(); // expects { token, role, storeId, location }
// // //     console.log("🔐 Login Response Data:", data);
// // //
// // //     const user = {
// // //       userId: data.userId,
// // //       username: credentials.username,
// // //       name: data.name || credentials.username,
// // //       role: (data.role || '').toUpperCase(),
// // //       phone_number: data.phone_number || '',
// // //       location: data.location || '',
// // //       storeId: data.storeId || ''
// // //     };
// // //
// // //     console.log("👤 Final User Stored:", user);
// // //
// // //     // Store token and user info
// // //     localStorage.setItem('token', data.token);
// // //     localStorage.setItem('user', JSON.stringify(user));
// // //
// // //     return { token: data.token, user };
// // //   },
// // //
// // //   // Logout user and clear storage
// // //   logout: () => {
// // //     localStorage.removeItem('token');
// // //     localStorage.removeItem('user');
// // //   },
// // //
// // //   // Get current user
// // //   getCurrentUser: () => {
// // //     const userStr = localStorage.getItem('user');
// // //     return userStr ? JSON.parse(userStr) : null;
// // //   },
// // //
// // //   // Check if logged in
// // //   isLoggedIn: () => {
// // //     return !!localStorage.getItem('token');
// // //   },
// // //
// // //   // Get auth token
// // //   getToken: () => {
// // //     return localStorage.getItem('token');
// // //   },
// // //
// // //   // Check user role (with hierarchy)
// // //   hasRole: (requiredRole) => {
// // //     const user = authService.getCurrentUser();
// // //     if (!user) return false;
// // //
// // //     const rolesHierarchy = ['Associate', 'Analyst', 'Manager', 'Admin'];
// // //     const userIndex = rolesHierarchy.indexOf(user.role);
// // //     const requiredIndex = rolesHierarchy.indexOf(requiredRole);
// // //     return userIndex >= requiredIndex;
// // //   }
// // // };
// // //
// // // export default authService;
// //
// //
// // const API_URL = 'http://localhost:8081/api/auth';
// //
// // const authService = {
// //   // Login user and store JWT token
// //   login: async (credentials) => {
// //     const response = await fetch(`${API_URL}/login`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(credentials)
// //     });
// //
// //     if (!response.ok) {
// //       const errMsg = await response.text();
// //       throw new Error('Login failed: ' + errMsg);
// //     }
// //
// //     const data = await response.json(); // { token, userId, name, role, storeId, phone_number, location }
// //     console.log("🔐 Login Response:", data);
// //
// //     const user = {
// //       userId: data.userId,
// //       username: credentials.username,
// //       name: data.name || credentials.username,
// //       role: (data.role || '').toUpperCase(),
// //       phone_number: data.phone_number || '',
// //       location: data.location || '',
// //       storeId: data.storeId || ''
// //     };
// //
// //     localStorage.setItem('token', data.token);
// //     localStorage.setItem('user', JSON.stringify(user));
// //
// //     return { token: data.token, user };
// //   },
// //
// //   // Logout and clear local storage
// //   logout: () => {
// //     localStorage.removeItem('token');
// //     localStorage.removeItem('user');
// //   },
// //
// //   // Get current user from localStorage
// //   getCurrentUser: () => {
// //     const userStr = localStorage.getItem('user');
// //     return userStr ? JSON.parse(userStr) : null;
// //   },
// //
// //   // Check if token exists
// //   isLoggedIn: () => {
// //     return !!localStorage.getItem('token');
// //   },
// //
// //   // Get token
// //   getToken: () => {
// //     return localStorage.getItem('token');
// //   },
// //
// //   // Check user role (based on hierarchy)
// //   hasRole: (requiredRole) => {
// //     const user = authService.getCurrentUser();
// //     if (!user) return false;
// //
// //     const roles = ['Associate', 'Analyst', 'Manager', 'Admin'];
// //     const userRank = roles.indexOf(user.role);
// //     const requiredRank = roles.indexOf(requiredRole);
// //
// //     return userRank >= requiredRank;
// //   },
// //
// //   // Forgot password: Send OTP to email
// //   forgotPassword: async (email) => {
// //     const response = await fetch(`${API_URL}/forgot-password`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ email })
// //     });
// //
// //     if (!response.ok) {
// //       const errMsg = await response.text();
// //       throw new Error('Failed to send OTP: ' + errMsg);
// //     }
// //
// //     return await response.json(); // { message: 'OTP sent to email' }
// //   },
// //
// //   // Verify OTP
// //   verifyOTP: async (email, otp) => {
// //     const response = await fetch(`${API_URL}/verify-otp`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ email, otp })
// //     });
// //
// //     if (!response.ok) {
// //       const errMsg = await response.text();
// //       throw new Error('OTP verification failed: ' + errMsg);
// //     }
// //
// //     return await response.json(); // { message: 'OTP verified' }
// //   },
// //
// //   // Reset password
// //   resetPassword: async (email, newPassword) => {
// //     const response = await fetch(`${API_URL}/reset-password`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ email, newPassword })
// //     });
// //
// //     if (!response.ok) {
// //       const errMsg = await response.text();
// //       throw new Error('Password reset failed: ' + errMsg);
// //     }
// //
// //     return await response.json(); // { message: 'Password updated' }
// //   }
// // };
// //
// // export default authService;
//
//
// const API_URL = 'http://localhost:8081/api/auth';
//
// const authService = {
//   // 🔐 Login
//   login: async (credentials) => {
//     const response = await fetch(`${API_URL}/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(credentials)
//     });
//
//     if (!response.ok) {
//       const errMsg = await response.text();
//       throw new Error('Login failed: ' + errMsg);
//     }
//
//     const data = await response.json();
//     console.log("🔐 Login Response:", data);
//
//     const user = {
//       userId: data.userId,
//       username: credentials.username,
//       name: data.name || credentials.username,
//       role: (data.role || '').toUpperCase(),
//       phone_number: data.phone_number || '',
//       location: data.location || '',
//       storeId: data.storeId || ''
//     };
//
//     localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify(user));
//
//     return { token: data.token, user };
//   },
//
//   // 🚪 Logout
//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   },
//
//   // 👤 Get user
//   getCurrentUser: () => {
//     const userStr = localStorage.getItem('user');
//     return userStr ? JSON.parse(userStr) : null;
//   },
//
//   // 🔒 Check login status
//   isLoggedIn: () => {
//     return !!localStorage.getItem('token');
//   },
//
//   // 🎟️ Get token
//   getToken: () => {
//     return localStorage.getItem('token');
//   },
//
//   // 🔍 Role check
//   hasRole: (requiredRole) => {
//     const user = authService.getCurrentUser();
//     if (!user) return false;
//
//     const roles = ['Associate', 'Analyst', 'Manager', 'Admin'];
//     const userRank = roles.indexOf(user.role);
//     const requiredRank = roles.indexOf(requiredRole);
//
//     return userRank >= requiredRank;
//   },
//
//   // 📧 Forgot password (send OTP)
//   forgotPassword: async (email) => {
//     const response = await fetch(`${API_URL}/forgot-password`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email })
//     });
//
//     if (!response.ok) {
//       const errMsg = await response.text();
//       throw new Error('Failed to send OTP: ' + errMsg);
//     }
//
//     const contentType = response.headers.get('content-type');
//     if (contentType && contentType.includes('application/json')) {
//       return await response.json();
//     } else {
//       const text = await response.text();
//       return { message: text };
//     }
//   },
//
//   // ✅ Verify OTP
//   // verifyOTP: async (email, otp) => {
//   //   const response = await fetch(`${API_URL}/verify-otp`, {
//   //     method: 'POST',
//   //     headers: { 'Content-Type': 'application/json' },
//   //     body: JSON.stringify({ email, otp })
//   //   });
//   //
//   //   if (!response.ok) {
//   //     const errMsg = await response.text();
//   //     throw new Error('OTP verification failed: ' + errMsg);
//   //   }
//   //
//   //   const contentType = response.headers.get('content-type');
//   //   if (contentType && contentType.includes('application/json')) {
//   //     return await response.json();
//   //   } else {
//   //     const text = await response.text();
//   //     return { message: text };
//   //   }
//   // },
//
//   verifyOTP: async (email, otp) => {
//     const response = await fetch(`${API_URL}/verify-otp`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, otp })
//     });
//
//     const result = await response.json();
//
//     if (!response.ok) {
//       throw new Error(result.message || 'OTP verification failed');
//     }
//
//     return result; // Expected: { valid: true/false, message: "..." }
//   },
//
//
//   // 🔁 Reset Password
//   resetPassword: async (email, newPassword) => {
//     const response = await fetch(`${API_URL}/reset-password`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, newPassword })
//     });
//
//     if (!response.ok) {
//       const errMsg = await response.text();
//       throw new Error('Password reset failed: ' + errMsg);
//     }
//
//     const contentType = response.headers.get('content-type');
//     if (contentType && contentType.includes('application/json')) {
//       return await response.json();
//     } else {
//       const text = await response.text();
//       return { message: text };
//     }
//   }
// };
//
// export default authService;


const API_URL = 'http://localhost:8081/api/auth';

const authService = {
  // 🔐 Login user and store JWT
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error('Login failed: ' + errMsg);
    }

    const data = await response.json();
    console.log("🔐 Login Response:", data);

    const user = {
      userId: data.userId,
      username: credentials.username,
      name: data.name || credentials.username,
      role: (data.role || '').toUpperCase(),
      phone_number: data.phone_number || '',
      location: data.location || '',
      storeId: data.storeId || ''
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token: data.token, user };
  },

  // 🚪 Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 👤 Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 🔒 Check login status
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // 🎟️ Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
  getRole: () => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return user.role;
  },

  // 🔍 Role check with hierarchy
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    if (!user) return false;

    const roles = ['Associate', 'Analyst', 'Manager', 'Admin'];
    const userRank = roles.indexOf(user.role);
    const requiredRank = roles.indexOf(requiredRole);

    return userRank >= requiredRank;
  },

  // 📧 Forgot password: send OTP to email
  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error('Failed to send OTP: ' + errMsg);
    }

    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
        ? await response.json()
        : { message: await response.text() };
  },

  // ✅ Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'OTP verification failed');
    }

    return result; // { valid: true/false, message: "..." }
  },

  // 🔁 Reset Password
  resetPassword: async (email, newPassword) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error('Password reset failed: ' + errMsg);
    }

    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
        ? await response.json()
        : { message: await response.text() };
  }
};

export default authService;
