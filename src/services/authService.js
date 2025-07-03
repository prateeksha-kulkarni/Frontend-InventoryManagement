// // Authentication service for handling login, logout, and token management
//
// const API_URL = '/api';
//
// const authService = {
//   // Login user and store JWT token
//   login: async (credentials) => {
//     try {
//       // In a real app, this would be an actual API call
//       // const response = await axios.post(`${API_URL}/login`, credentials);
//
//       // For demo purposes, simulating a successful login response
//       const mockResponse = {
//         token: 'mock-jwt-token',
//         user: {
//           id: 1,
//           username: credentials.username,
//           role: credentials.role || 'Associate', // Default role if not provided
//           name: 'John Doe'
//         }
//       };
//
//       // Store token and user info in localStorage
//       localStorage.setItem('token', mockResponse.token);
//       localStorage.setItem('user', JSON.stringify(mockResponse.user));
//
//       return mockResponse;
//     } catch (error) {
//       throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
//     }
//   },
//
//   // Logout user and clear storage
//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   },
//
//   // Get current user information
//   getCurrentUser: () => {
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return null;
//     return JSON.parse(userStr);
//   },
//
//   // Check if user is logged in
//   isLoggedIn: () => {
//     return !!localStorage.getItem('token');
//   },
//
//   // Get authentication token
//   getToken: () => {
//     return localStorage.getItem('token');
//   },
//
//   // Check if user has required role
//   hasRole: (requiredRole) => {
//     const user = authService.getCurrentUser();
//     if (!user) return false;
//
//     // Role hierarchy: Manager > Analyst > Associate
//     if (requiredRole === 'Associate') {
//       return ['Associate', 'Analyst', 'Manager'].includes(user.role);
//     } else if (requiredRole === 'Analyst') {
//       return ['Analyst', 'Manager'].includes(user.role);
//     } else if (requiredRole === 'Manager') {
//       return user.role === 'Manager';
//     }
//
//     return false;
//   }
// };
//
// export default authService;


const API_URL = 'http://localhost:8081/api/auth';

const authService = {
  // Login user and store JWT token
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

    const data = await response.json(); // expects { token, role, storeId, location }
    const user = {
      username: credentials.username,
      name: data.name || credentials.username,
      role: (data.role || '').toUpperCase(),
      phone_number: data.phone_number || '',
      location: data.location || '',
      storeId: data.storeId || ''
    };

    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token: data.token, user };
  },

  // Logout user and clear storage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check user role (with hierarchy)
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    if (!user) return false;

    const rolesHierarchy = ['Associate', 'Analyst', 'Manager', 'Admin'];
    const userIndex = rolesHierarchy.indexOf(user.role);
    const requiredIndex = rolesHierarchy.indexOf(requiredRole);
    return userIndex >= requiredIndex;
  }
};

export default authService;
