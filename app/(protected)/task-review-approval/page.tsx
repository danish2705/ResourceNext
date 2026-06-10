"use client";
import PermissionGate from "@/components/PermissionGate";
import TaskReviewApproval from "@/pages/TaskReviewApproval";
export default function TaskReviewApprovalPage() {
  return (
    <PermissionGate permission="view_projects">
      <TaskReviewApproval />
    </PermissionGate>
  );
}
