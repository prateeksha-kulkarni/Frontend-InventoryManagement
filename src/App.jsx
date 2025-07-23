// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Modal from 'react-modal';
Modal.setAppElement('#root');

// Global styles
import './assets/styles/global.css';
import './App.css';

// Pages
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard'
import Transfer from './pages/Transfer/Transfer';
import ChangeLog from './pages/ChangeLog/ChangeLog';
import RestockSuggestions from './pages/RestockSuggestions/RestockSuggestions';
import PurchaseOrder from './pages/PurchaseOrder/PurchaseOrder';
import UserRegistration from './pages/UserRegistration/UserRegistration';
import StoreSetup from './pages/StoreSetup/StoreSetup';
import InventoryDashboard from './pages/InventoryDashboard/InventoryDashboard';
import LowStockPage from './pages/LowStock/LowStock';

// Layout component
import Layout from './components/Layout/Layout';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes inside layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="transfer" element={
              <ProtectedRoute requiredRole="Manager">
                <Transfer />
              </ProtectedRoute>
            } />
            <Route
              path="change-log"
              element={
                <ProtectedRoute requiredRole="Associate">
                  <ChangeLog />
                </ProtectedRoute>
              }
            />

            <Route
              path="restock-suggestions"
              element={
                <ProtectedRoute requiredRole="Manager">
                  <RestockSuggestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="purchase-order"
              element={
                <ProtectedRoute requiredRole="Manager">
                  <PurchaseOrder />
                </ProtectedRoute>
              }
            />

            <Route path="analytics" element={
              <ProtectedRoute requiredRole="Analyst">
                <InventoryDashboard/>
              </ProtectedRoute>
            } />

            <Route
              path="user-registration"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <UserRegistration />
                </ProtectedRoute>
              }
            />

            <Route
              path="store-setup"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <StoreSetup />
                </ProtectedRoute>
              }
            />

            <Route
              path="low-stock-alerts"
              element={
                <ProtectedRoute>
                  <LowStockPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

