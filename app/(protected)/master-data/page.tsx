"use client";
import PermissionGate from "@/components/PermissionGate";
import MasterDataManagement from "@/pages/MasterDataManagement";
export default function MasterDataPage() {
  return (
    <PermissionGate permission="manage_master_data">
      <MasterDataManagement />
    </PermissionGate>
  );
}
