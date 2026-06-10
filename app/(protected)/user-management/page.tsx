"use client";
import PermissionGate from "@/components/PermissionGate";
import UserManagement from "@/pages/UserManagement";
export default function UserManagementPage() {
  return (
    <PermissionGate permission="manage_users">
      <UserManagement />
    </PermissionGate>
  );
}
