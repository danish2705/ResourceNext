"use client";
import PermissionGate from "@/components/PermissionGate";
import ForecastActual from "@/pages/ForecastActual";
export default function ForecastActualPage() {
  return (
    <PermissionGate permission="view_resource_info">
      <ForecastActual />
    </PermissionGate>
  );
}
