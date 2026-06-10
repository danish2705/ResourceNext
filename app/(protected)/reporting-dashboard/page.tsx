"use client";
import PermissionGate from "@/components/PermissionGate";
import ReportingDashboard from "@/pages/ReportingAnalytics";
export default function ReportsPage() {
  return (
    <PermissionGate permission="view_reporting">
      <ReportingDashboard />
    </PermissionGate>
  );
}
