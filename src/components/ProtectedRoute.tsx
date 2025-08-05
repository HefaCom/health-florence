
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { userService, User as UserData } from "@/services/user.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"user" | "admin" | "expert">;
}

export const ProtectedRoute = ({ children, allowedRoles = ["user", "admin", "expert"] }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active
  if (!user.isActive) {
    return <Navigate to="/login" state={{ from: location, message: "Account is inactive" }} replace />;
  }

  // Check role-based access
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const userData: UserData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      loginCount: 0,
      subscriptionTier: 'basic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const dashboardRoute = userService.getUserDashboardRoute(userData);
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};
