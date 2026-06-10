export interface AllocationRow {
  resourceId: string;
  projectId: string;
  resource: string;
  project: string;
  role: string;
  pillar: "Hi-tech" | "Retail" | "Banking" | "Healthcare" | "Life Sciences"; // ADD THIS
  allocationType: "Project" | "Base Business";
  allocationPercentage: number;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  utilizationStatus: "low" | "medium" | "high";
}

export const allocations: AllocationRow[] = [
  {
    resourceId: "RID-1001",
    role: "Lead Architect",
    projectId: "PID-501",
    resource: "Priya Sharma",
    project: "Cloud Migration Phase 1",
    pillar: "Hi-tech", // Cloud project → Hi-tech
    allocationType: "Project",
    allocationPercentage: 80,
    hoursPerWeek: 32,
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1004",
    projectId: "PID-501",
    resource: "Kiran Patel",
    role: "Frontend Developer",
    project: "Cloud Migration Phase 1",
    pillar: "Hi-tech",
    allocationType: "Project",
    allocationPercentage: 100,
    hoursPerWeek: 40,
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1002",
    projectId: "PID-502",
    resource: "Arjun Mehta",
    role: "Data Engineer",
    project: "Data Platform Modernisation",
    pillar: "Banking", // Data/Finance project → Banking
    allocationType: "Project",
    allocationPercentage: 100,
    hoursPerWeek: 40,
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1003",
    projectId: "PID-503",
    resource: "Sneha Iyer",
    role: "DevSecOps Lead",
    project: "DevSecOps Pipeline Setup",
    pillar: "Hi-tech", // DevSecOps → Hi-techs
    allocationType: "Base Business",
    allocationPercentage: 80,
    hoursPerWeek: 32,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1005",
    projectId: "PID-501",
    resource: "Ananya Rao",
    role: "Dilivery Manager",
    project: "Cloud Migration Phase 1",
    pillar: "Hi-tech",
    allocationType: "Project",
    allocationPercentage: 60,
    hoursPerWeek: 24,
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    utilizationStatus: "medium",
  },
  {
    resourceId: "RID-1007",
    projectId: "PID-504",
    resource: "Meera Joshi",
    role: "Cloud Engineer",
    project: "Identity & Access Management",
    pillar: "Healthcare", // IAM for HealthGroup → Healthcare
    allocationType: "Project",
    allocationPercentage: 100,
    hoursPerWeek: 40,
    startDate: "2026-02-15",
    endDate: "2026-08-15",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1004",
    projectId: "PID-505",
    resource: "Kiran Patel",
    role: "UI Developer",
    project: "Analytics Dashboard Suite",
    pillar: "Retail", // RetailCo client → Retail
    allocationType: "Base Business",
    allocationPercentage: 20,
    hoursPerWeek: 8,
    startDate: "2026-01-20",
    endDate: "2026-04-30",
    utilizationStatus: "low",
  },
  {
    resourceId: "RID-1008",
    projectId: "PID-503",
    resource: "Dev Krishnan",
    role: "Security Reviewer",
    project: "DevSecOps Pipeline Setup",
    pillar: "Hi-tech",
    allocationType: "Base Business",
    allocationPercentage: 50,
    hoursPerWeek: 10,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    utilizationStatus: "medium",
  },
  {
    resourceId: "RID-1009",
    projectId: "PID-501",
    resource: "Vikram Singh",
    role: "Cloud Engineer",
    project: "Cloud Migration Phase 1",
    pillar: "Hi-tech",
    allocationType: "Project",
    allocationPercentage: 100,
    hoursPerWeek: 40,
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    utilizationStatus: "high",
  },
  {
    resourceId: "RID-1006",
    projectId: "PID-506",
    resource: "Rohit Nair",
    role: "ML Engineer",
    project: "ML Forecasting Engine",
    pillar: "Life Sciences", // ML/Research → Life Sciences
    allocationType: "Project",
    allocationPercentage: 80,
    hoursPerWeek: 32,
    startDate: "2026-05-01",
    endDate: "2026-09-30",
    utilizationStatus: "high",
  },
];
