"use client";
import PermissionGate from "@/components/PermissionGate";
import ProjectPortfolio from "@/pages/ProjectPortfolio";
export default function ProjectPortfolioPage() {
  return (
    <PermissionGate permission="view_reporting">
      <ProjectPortfolio />
    </PermissionGate>
  );
}
