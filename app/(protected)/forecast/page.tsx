"use client";
import PermissionGate from "@/components/PermissionGate";
import ResourceForecast from "@/pages/ResourceForecast";
export default function ForecastPage() {
  return (
    <PermissionGate permission="view_resource_info">
      <ResourceForecast />
    </PermissionGate>
  );
}
