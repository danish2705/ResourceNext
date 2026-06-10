// ─── Roles ───────────────────────────────────────────────────────────────────
export type Role = "super_admin" | "pmo" | "resource_manager" | "resource";

// ─── Permissions ─────────────────────────────────────────────────────────────
export type Permission =
  | "view_dashboard"
  | "view_demand"
  | "create_demand"
  | "edit_demand"
  | "delete_demand"
  | "approve_demand"
  | "view_allocation"
  | "view_resource_info"
  | "view_projects"
  | "view_reporting"
  | "view_audit_logs"
  | "manage_users"
  | "manage_master_data";

// ─── Permission Matrix ────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "view_dashboard",
    "view_demand",
    "create_demand",
    "edit_demand",
    "delete_demand",
    "approve_demand",
    "view_allocation",
    "view_resource_info",
    "view_projects",
    "view_reporting",
    "view_audit_logs",
    "manage_users",
    "manage_master_data",
  ],
  pmo: [
    "view_dashboard",
    "view_demand",
    "create_demand",
    "approve_demand",
    "view_allocation",
    "view_resource_info",
    "view_projects",
    "view_reporting",
  ],
  resource_manager: [
    "view_dashboard",
    "view_demand",
    "create_demand",
    "approve_demand",
    "view_allocation",
    "view_resource_info",
    "view_projects",
    "view_reporting",
  ],
  resource: [
    "view_dashboard",
    "view_allocation",
    "view_resource_info",
    "view_projects"
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  pmo: "PMO",
  resource_manager: "Resource Manager",
  resource: "Resource",
};