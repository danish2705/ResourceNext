"use client";
import PermissionGate from "@/components/PermissionGate";
import ResourceAllocation from "@/pages/Allocation";
export default function AllocationPage() {
  return (
    <PermissionGate permission="view_allocation">
      <ResourceAllocation />
    </PermissionGate>
  );
}
