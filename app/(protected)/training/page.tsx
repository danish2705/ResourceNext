"use client";
import PermissionGate from "@/components/PermissionGate";
import Training from "@/pages/Training";
export default function TrainingPage() {
  return (
    <PermissionGate permission="view_dashboard">
      <Training />
    </PermissionGate>
  );
}
