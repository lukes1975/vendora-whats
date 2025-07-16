
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        console.warn('Auth loading timeout - redirecting to login');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // If we've timed out or auth is not loading but user is null, redirect to login
  if (loadingTimeout || (!loading && !user)) {
    return <Navigate to="/login" replace />;
  }

  // Still loading and within timeout period
  if (loading) {
    return <LoadingPage />;
  }

  // User is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
