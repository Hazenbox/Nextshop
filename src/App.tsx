import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { Inventory2Page } from './pages/Inventory2Page';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import UIDemo from './pages/UIDemo';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AuthCallback from './pages/auth/Callback';
import { SideSheetContext } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import CSS
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  // Side sheet states
  const [isInventorySideSheetOpen, setInventorySideSheetOpen] = useState(false);
  const [isTransactionSideSheetOpen, setTransactionSideSheetOpen] = useState(false);

  // Context value for the SideSheetContext
  const sideSheetContextValue = {
    isInventorySideSheetOpen,
    setInventorySideSheetOpen,
    isTransactionSideSheetOpen,
    setTransactionSideSheetOpen,
  };

  return (
    <SideSheetContext.Provider value={sideSheetContextValue}>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/inventory2" element={<ProtectedRoute><Inventory2Page /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/ui-demo" element={<ProtectedRoute><UIDemo /></ProtectedRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SideSheetContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;