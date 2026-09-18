import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isRouteAllowed, getDefaultRouteForRole } from '../../utils/rbac';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // Check if the current route is authorized for this role
  const isAllowed = isRouteAllowed(location.pathname, user.role, user.email);
  if (!isAllowed) {
    const fallback = getDefaultRouteForRole(user.role, user.email);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
