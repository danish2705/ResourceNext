"use client";
import PermissionGate from "@/components/PermissionGate";
import DemandStatus from "@/pages/AllocationStatus";
export default function DemandStatusPage() {
  return (
    <PermissionGate permission="view_dashboard">
      <DemandStatus />
    </PermissionGate>
  );
}
