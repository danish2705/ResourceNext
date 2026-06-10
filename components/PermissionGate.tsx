"use client";
import { useAuth } from "@/auth/useAuth";
import { hasPermission, type Permission } from "@/auth/rbac";
import AccessDenied from "@/components/AccessDenied";

interface Props {
  permission: Permission;
  excludeRoles?: string[];
  children: React.ReactNode;
}

export default function PermissionGate({
  permission,
  excludeRoles,
  children,
}: Props) {
  const { user } = useAuth();
  if (!user) return null;
  if (!hasPermission(user.role, permission)) return <AccessDenied />;
  if (excludeRoles?.includes(user.role)) return <AccessDenied />;
  return <>{children}</>;
}
