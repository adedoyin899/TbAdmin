import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
