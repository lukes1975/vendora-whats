import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
