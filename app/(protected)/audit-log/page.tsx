"use client";
import PermissionGate from "@/components/PermissionGate";
import AuditLog from "@/pages/AuditLog";
export default function AuditLogPage() {
  return (
    <PermissionGate permission="view_audit_logs">
      <AuditLog />
    </PermissionGate>
  );
}
