"use client";
import PermissionGate from "@/components/PermissionGate";
import Dashboard from "@/pages/Dashboard";

export default function DashboardPage() {
  return (
    <PermissionGate permission="view_dashboard">
      <Dashboard />
    </PermissionGate>
  );
}
