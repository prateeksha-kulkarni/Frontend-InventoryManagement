import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Modal from 'react-modal';
Modal.setAppElement('#root');


// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import StockAdjustment from './pages/StockAdjustment/StockAdjustment';
import Transfer from './pages/Transfer/Transfer';
import ChangeLog from './pages/ChangeLog/ChangeLog';
import RestockSuggestions from './pages/RestockSuggestions/RestockSuggestions';
import PurchaseOrder from './pages/PurchaseOrder/PurchaseOrder';
import Analytics from './pages/Analytics/Analytics';
import UserRegistration from './pages/UserRegistration/UserRegistration';
import StoreSetup from './pages/StoreSetup/StoreSetup';

// Layout components
import Layout from './components/Layout/Layout';
import LowStockPage from './pages/LowStock/LowStock';
// Import global styles
import './assets/styles/global.css';

// Protected Route component for role-based access control
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />

            <Route path="stock-adjustment" element={
              <ProtectedRoute requiredRole="Manager">
                <StockAdjustment />
              </ProtectedRoute>
            } />

            <Route path="transfer" element={
              <ProtectedRoute requiredRole="Manager">
                <Transfer />
              </ProtectedRoute>
            } />

            <Route path="change-log" element={
              <ProtectedRoute requiredRole="Associate">
                <ChangeLog />
              </ProtectedRoute>
            } />

            <Route path="restock-suggestions" element={
              <ProtectedRoute requiredRole="Manager">
                <RestockSuggestions />
              </ProtectedRoute>
            } />

            <Route path="purchase-order" element={
              <ProtectedRoute requiredRole="Manager">
                <PurchaseOrder />
              </ProtectedRoute>
            } />

            <Route path="analytics" element={
              <ProtectedRoute requiredRole="Analyst">
                <Analytics />
              </ProtectedRoute>
            } />

            <Route path="user-registration" element={
              <ProtectedRoute requiredRole="Admin">
                <UserRegistration />
              </ProtectedRoute>
            } />

            <Route path="store-setup" element={
              <ProtectedRoute requiredRole="Admin">
                <StoreSetup />
              </ProtectedRoute>
            } />
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
