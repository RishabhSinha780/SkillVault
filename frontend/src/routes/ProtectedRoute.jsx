import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = 'student' }) => {
  const { currentRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If a specific role is required and user does not match, redirect appropriately
  if (requiredRole && currentRole !== requiredRole) {
    if (currentRole === 'recruiter') {
      return <Navigate to="/recruiter" replace />;
    }
    if (currentRole === 'student') {
      return <Navigate to="/student" replace />;
    }
    if (currentRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
