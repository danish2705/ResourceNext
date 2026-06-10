"use client";
import PermissionGate from "@/components/PermissionGate";
import ResourceReview from "@/pages/AllocationReviewApproval";
export default function ResourceReviewPage() {
  return (
    <PermissionGate permission="approve_demand">
      <ResourceReview />
    </PermissionGate>
  );
}
