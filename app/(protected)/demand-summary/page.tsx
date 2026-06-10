"use client";
import PermissionGate from "@/components/PermissionGate";
import DemandSummary from "@/pages/DemandSummary";
export default function DemandPage() {
  return (
    <PermissionGate permission="view_dashboard">
      <DemandSummary />
    </PermissionGate>
  );
}
