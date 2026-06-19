import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import StaffInventory from './pages/StaffInventory';
import StaffOrders from './pages/StaffOrders';

// RBAC Protected Route Gate
const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    // If staff tries to access admin pages, send them to staff workspace
    return <Navigate to="/workspace" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public Auth Endpoint */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/" replace /> : <Login />} 
      />

      {/* Admin Specific Workspaces */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredRole="admin">
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute requiredRole="admin">
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute requiredRole="admin">
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* Staff / Operator Specific Workspaces */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-order"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffOrders />
          </ProtectedRoute>
        }
      />

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
