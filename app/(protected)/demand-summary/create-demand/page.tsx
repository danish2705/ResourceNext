"use client";
import PermissionGate from "@/components/PermissionGate";
import CreateDemand from "@/pages/CreateDemand";

export default function CreateDemandPage() {
  return (
    <PermissionGate permission="create_demand">
      <CreateDemand />
    </PermissionGate>
  );
}
