"use client";
import PermissionGate from "@/components/PermissionGate";
import Configuration from "@/pages/Configuration";
export default function ConfigurationPage() {
  return (
    <PermissionGate permission="manage_master_data">
      <Configuration />
    </PermissionGate>
  );
}
