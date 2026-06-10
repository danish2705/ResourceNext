export interface ProjectResource {
  resourceId: string;
  resourceName: string;
  designation: string;
  allocationStart: string;
  allocationEnd: string;
}

export interface Project {
  id: string;
  project: string;
  client: string;
  pillar: "Hi-tech" | "Retail" | "Banking" | "Healthcare" | "Life Sciences"; // ADD THIS
  status: "Active" | "Planning";
  priority: "High" | "Medium" | "Low";
  budget: string;
  budgetHrs: string;
  start: string;
  end: string;
  teamSize: string;
  progress: number;
  resources: ProjectResource[];
}

export const PROGRESS_RANGES = [
  { label: "All Progress", value: "all" },
  { label: "Not started (0%)", value: "0" },
  { label: "Early stage (1–30%)", value: "1-30" },
  { label: "In progress (31–70%)", value: "31-70" },
  { label: "Near complete (71–99%)", value: "71-99" },
  { label: "Complete (100%)", value: "100" },
];

export const projectData: Project[] = [
  {
    id: "P-001",
    project: "Cloud Migration Phase 2",
    client: "TechCorp AU",
    pillar: "Hi-tech",
    status: "Active",
    priority: "High",
    budget: "$250,000",
    budgetHrs: "2,800",
    start: "2025-01-15",
    end: "2026-06-30",
    teamSize: "4 resources",
    progress: 42,
    resources: [
      {
        resourceId: "RID-1001",
        resourceName: "Tracey Warren",
        designation: "Cloud Architect",
        allocationStart: "2025-01-15",
        allocationEnd: "2025-12-31",
      },
      {
        resourceId: "RID-1004",
        resourceName: "Kiran Patel",
        designation: "Frontend Developer",
        allocationStart: "2025-02-01",
        allocationEnd: "2026-03-31",
      },
      {
        resourceId: "RID-1005",
        resourceName: "Miranda Ford",
        designation: "Delivery Manager",
        allocationStart: "2025-01-15",
        allocationEnd: "2026-06-30",
      },
      {
        resourceId: "RID-1009",
        resourceName: "Seth Green",
        designation: "Cloud Engineer",
        allocationStart: "2025-07-01",
        allocationEnd: "2026-05-31",
      },
    ],
  },

  {
    id: "P-002",
    project: "Data Platform Modernisation",
    client: "FinServe Ltd",
    pillar: "Banking",
    status: "Active",
    priority: "High",
    budget: "$180,000",
    budgetHrs: "2,000",
    start: "2026-02-01",
    end: "2026-07-31",
    teamSize: "1 resource",
    progress: 28,
    resources: [
      {
        resourceId: "RID-1002",
        resourceName: "Arjun Mehta",
        designation: "Data Engineer",
        allocationStart: "2026-02-01",
        allocationEnd: "2026-07-31",
      },
    ],
  },

  {
    id: "P-003",
    project: "DevSecOps Pipeline Setup",
    client: "GovDept NSW",
    pillar: "Hi-tech",
    status: "Active",
    priority: "Medium",
    budget: "$95,000",
    budgetHrs: "1,100",
    start: "2025-03-01",
    end: "2027-05-31",
    teamSize: "2 resources",
    progress: 65,
    resources: [
      {
        resourceId: "RID-1003",
        resourceName: "Sneha Iyer",
        designation: "DevSecOps Lead",
        allocationStart: "2025-03-01",
        allocationEnd: "2026-12-31",
      },
      {
        resourceId: "RID-1008",
        resourceName: "Dev Krishnan",
        designation: "Security Reviewer",
        allocationStart: "2025-06-01",
        allocationEnd: "2027-05-31",
      },
    ],
  },

  {
    id: "P-004",
    project: "Analytics Dashboard Suite",
    client: "RetailCo",
    pillar: "Retail",
    status: "Active",
    priority: "Medium",
    budget: "$70,000",
    budgetHrs: "800",
    start: "2026-01-20",
    end: "2026-04-30",
    teamSize: "1 resource",
    progress: 88,
    resources: [
      {
        resourceId: "RID-1004",
        resourceName: "Kiran Patel",
        designation: "UI Developer",
        allocationStart: "2026-01-20",
        allocationEnd: "2026-04-15",
      },
    ],
  },

  {
    id: "P-005",
    project: "API Integration Gateway",
    client: "InsureTech",
    pillar: "Banking",
    status: "Planning",
    priority: "Low",
    budget: "$50,000",
    budgetHrs: "600",
    start: "2026-04-01",
    end: "2026-06-15",
    teamSize: "0 resources",
    progress: 0,
    resources: [],
  },

  {
    id: "P-006",
    project: "Identity & Access Management",
    client: "HealthGroup",
    pillar: "Healthcare",
    status: "Active",
    priority: "High",
    budget: "$120,000",
    budgetHrs: "1,400",
    start: "2025-12-15",
    end: "2026-08-15",
    teamSize: "1 resource",
    progress: 35,
    resources: [
      {
        resourceId: "RID-1007",
        resourceName: "Meera Joshi",
        designation: "Cloud Engineer",
        allocationStart: "2025-12-15",
        allocationEnd: "2026-08-15",
      },
    ],
  },

  {
    id: "P-007",
    project: "ML Forecasting Engine",
    client: "RetailCo",
    pillar: "Life Sciences",
    status: "Planning",
    priority: "Medium",
    budget: "$90,000",
    budgetHrs: "1,000",
    start: "2026-05-01",
    end: "2027-09-30",
    teamSize: "1 resource",
    progress: 0,
    resources: [
      {
        resourceId: "RID-1006",
        resourceName: "Rohit Nair",
        designation: "ML Engineer",
        allocationStart: "2026-05-01",
        allocationEnd: "2027-03-31",
      },
    ],
  },
];