import { useAuth } from "./useAuth";
import { hasPermission, type Permission } from "./rbac";

export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role, permission);
}

export function usePermissions(
  ...permissions: Permission[]
): Record<Permission, boolean> {
  const { user } = useAuth();
  const result = {} as Record<Permission, boolean>;
  for (const p of permissions) {
    result[p] = user ? hasPermission(user.role, p) : false;
  }
  return result;
}
