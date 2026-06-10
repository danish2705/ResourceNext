import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { hasPermission, type Permission } from "@/auth/rbac";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user must have this permission or sees a 403 screen */
  permission?: Permission;
  /** If provided, users with these roles see a 403 screen */
  excludeRoles?: string[];
}

export function ProtectedRoute({
  children,
  permission,
  excludeRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && user && !hasPermission(user.role, permission)) {
    return <AccessDenied />;
  }

  if (excludeRoles && user && excludeRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-24">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldX className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You don't have permission to view this page.
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        Go to Dashboard
      </Button>
    </div>
  );
}
