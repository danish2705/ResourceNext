"use client";
import PermissionGate from "@/components/PermissionGate";
import Mydashboard from "@/pages/Mydashboard";
export default function MyDashboardPage() {
  return (
    <PermissionGate permission="view_dashboard">
      <Mydashboard />
    </PermissionGate>
  );
}
