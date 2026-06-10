"use client";
import PermissionGate from "@/components/PermissionGate";
import ScenarioPlanning from "@/pages/ScenarioPlanning";
export default function ScenarioPlanningPage() {
  return (
    <PermissionGate permission="view_reporting" excludeRoles={["resource"]}>
      <ScenarioPlanning />
    </PermissionGate>
  );
}
