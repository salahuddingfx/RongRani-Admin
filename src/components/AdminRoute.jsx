import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin/super_admin, redirect to client dashboard
  if (role !== 'admin' && role !== 'super_admin') {
    const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
    window.location.href = `${clientUrl}/dashboard`;
    return null;
  }

  // If admin, show the admin route
  return children;
};

export default AdminRoute;