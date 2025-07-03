import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from localStorage on initial render
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError('');
      const response = await authService.login({
        ...credentials,
        role: credentials.role ? credentials.role.toUpperCase() : undefined
      });
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!currentUser || !currentUser.role) return false;
    const rolesHierarchy = ['ASSOCIATE', 'ANALYST', 'MANAGER', 'ADMIN'];
    const userIndex = rolesHierarchy.indexOf(currentUser.role.toUpperCase());
    const requiredIndex = rolesHierarchy.indexOf(role.toUpperCase());
    return userIndex >= requiredIndex;
  };

  // Value object that will be passed to consumers
  const value = {
    currentUser,
    login,
    logout,
    hasRole,
    error,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;