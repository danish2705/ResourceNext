"use client";
import PermissionGate from "@/components/PermissionGate";
import ResourceInformation from "@/pages/Resource";
export default function ResourcesPage() {
  return (
    <PermissionGate permission="view_resource_info">
      <ResourceInformation />
    </PermissionGate>
  );
}
