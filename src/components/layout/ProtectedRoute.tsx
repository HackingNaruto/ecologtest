import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user tries to access an unauthorized route, send them to their own dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'scraper') return <Navigate to="/dealer-dashboard" replace />;
    if (user.role === 'recycler') return <Navigate to="/recycler-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
