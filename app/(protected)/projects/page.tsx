"use client";
import PermissionGate from "@/components/PermissionGate";
import ProjectsPage from "@/pages/Projects";
export default function ProjectsRoutePage() {
  return (
    <PermissionGate permission="view_projects">
      <ProjectsPage />
    </PermissionGate>
  );
}
