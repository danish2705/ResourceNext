// ─── Types ────────────────────────────────────────────────────────────────────

export type DemandStatusType =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "RM Approved"
  | "RM Rejected"
  | "PMO Approved"
  | "PMO Rejected";

export interface DemandStatusRecord {
  id: string;
  projectId: string;
  projectName: string;
  requiredSkills: string[];
  budgetCode: string;
  pillar: "Hi-tech" | "Retail" | "Banking" | "Healthcare" | "Life Sciences"; // renamed from domainPillar
  noOfResources: number;
  allocatedResources: number;
  estimatedRate: number;
  currentYearForecast: number;
  status: DemandStatusType;
  submittedBy: string;
  deliveryManager: string;
  portfolio?: string;
  program?: string;
  projectRole?: string;
  workstream?: string;
  startDate?: string;
  endDate?: string;
  comments?: string;
  resourceName?: string;
  allocation?: {
    currentYear: number;
    y2027: number;
    y2028: number;
    y2029: number;
    y2030: number;
  };
  forecast?: {
    currentYear: number;
    y2027: number;
    y2028: number;
    y2029: number;
    y2030: number;
  };
}

// ─── Status Style Map ─────────────────────────────────────────────────────────

export const statusStyleMap: Record<DemandStatusType, string> = {
  Draft: "bg-muted/60 text-muted-foreground border border-border",
  Submitted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "Under Review":
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
  "RM Approved": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "RM Rejected": "bg-red-500/20 text-red-400 border border-red-500/30",
  "PMO Approved": "bg-green-500/20 text-green-400 border border-green-500/30",
  "PMO Rejected": "bg-red-500/20 text-red-400 border border-red-500/30",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const demandData: DemandStatusRecord[] = [
  {
    id: "dem-001",
    projectId: "PRJ-1001",
    projectName: "Cloud Migration Phase 1",
    requiredSkills: ["AWS", "Terraform", "Kubernetes"],
    budgetCode: "BC-4421",
    pillar: "Hi-tech", // was "Cloud Eng"
    noOfResources: 4,
    allocatedResources: 3,
    estimatedRate: 85,
    currentYearForecast: 280000,
    status: "Approved",
    submittedBy: "Ananya Rao",
    deliveryManager: "Dev Krishnan",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Cloud Architect",
    workstream: "Infrastructure",
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    comments: "Phase 1 covers primary workloads migration to AWS.",
    allocation: { currentYear: 80, y2027: 60, y2028: 20, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 280000,
      y2027: 210000,
      y2028: 70000,
      y2029: 0,
      y2030: 0,
    },
  },
  {
    id: "dem-002",
    projectId: "PRJ-1002",
    projectName: "Data Lake Modernisation",
    requiredSkills: ["Python", "Spark", "SQL"],
    budgetCode: "BC-4422",
    pillar: "Banking", // was "Data Eng"
    noOfResources: 3,
    allocatedResources: 2,
    estimatedRate: 78,
    currentYearForecast: 195000,
    status: "Under Review",
    submittedBy: "Rohit Nair",
    deliveryManager: "Ananya Rao",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Data Engineer",
    workstream: "Analytics",
    startDate: "2026-02-01",
    endDate: "2026-11-30",
    comments: "Modernising legacy data pipelines to cloud-native architecture.",
    allocation: { currentYear: 70, y2027: 40, y2028: 0, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 195000,
      y2027: 112000,
      y2028: 0,
      y2029: 0,
      y2030: 0,
    },
  },
  {
    id: "dem-003",
    projectId: "PRJ-1003",
    projectName: "DevSecOps Pipeline Setup",
    requiredSkills: ["Docker", "CI/CD", "Security"],
    budgetCode: "BC-4423",
    pillar: "Hi-tech", // was "DevSecOps"
    noOfResources: 2,
    allocatedResources: 2,
    estimatedRate: 87,
    currentYearForecast: 144000,
    status: "Approved",
    submittedBy: "Dev Krishnan",
    deliveryManager: "Ananya Rao",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "DevSecOps Engineer",
    workstream: "Security",
    startDate: "2026-03-01",
    endDate: "2026-09-30",
    comments: "Establishing secure CI/CD pipelines across all product teams.",
    allocation: { currentYear: 100, y2027: 50, y2028: 25, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 144000,
      y2027: 72000,
      y2028: 36000,
      y2029: 0,
      y2030: 0,
    },
  },
  {
    id: "dem-004",
    projectId: "PRJ-1004",
    projectName: "Customer Portal Rebuild",
    requiredSkills: ["React", "Node.js", "APIs"],
    budgetCode: "BC-4424",
    pillar: "Retail", // was "Cloud Eng"
    noOfResources: 5,
    allocatedResources: 1,
    estimatedRate: 72,
    currentYearForecast: 300000,
    status: "Draft",
    submittedBy: "Kiran Patel",
    deliveryManager: "Priya Sharma",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Full Stack Developer",
    workstream: "Digital",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
    comments: "Full rebuild of customer-facing portal with modern tech stack.",
    allocation: { currentYear: 20, y2027: 80, y2028: 40, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 300000,
      y2027: 240000,
      y2028: 120000,
      y2029: 0,
      y2030: 0,
    },
  },
  {
    id: "dem-005",
    projectId: "PRJ-1005",
    projectName: "ML Model Deployment",
    requiredSkills: ["ML", "Python", "TensorFlow"],
    budgetCode: "BC-4425",
    pillar: "Life Sciences", // was "Data Eng"
    noOfResources: 3,
    allocatedResources: 3,
    estimatedRate: 80,
    currentYearForecast: 192000,
    status: "Submitted",
    submittedBy: "Lalitha Krishnan",
    deliveryManager: "Rohit Nair",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "ML Engineer",
    workstream: "AI/ML",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
    comments:
      "Production deployment of trained ML models with monitoring setup.",
    allocation: { currentYear: 100, y2027: 60, y2028: 30, y2029: 10, y2030: 0 },
    forecast: {
      currentYear: 192000,
      y2027: 115000,
      y2028: 57000,
      y2029: 19000,
      y2030: 0,
    },
  },
  {
    id: "dem-006",
    projectId: "PRJ-1006",
    projectName: "Azure Networking Overhaul",
    requiredSkills: ["Azure", "ARM Templates", "Networking"],
    budgetCode: "BC-4426",
    pillar: "Hi-tech", // was "Cloud Eng"
    noOfResources: 2,
    allocatedResources: 0,
    estimatedRate: 65,
    currentYearForecast: 104000,
    status: "Rejected",
    submittedBy: "Meera Joshi",
    deliveryManager: "Priya Sharma",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Network Engineer",
    workstream: "Infrastructure",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    comments:
      "Overhaul of Azure virtual network architecture for improved performance.",
    allocation: { currentYear: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
    forecast: { currentYear: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
  },
  {
    id: "dem-007",
    projectId: "PRJ-1007",
    projectName: "IAM & SIEM Integration",
    requiredSkills: ["Pen Testing", "SIEM", "IAM"],
    budgetCode: "BC-4427",
    pillar: "Healthcare", // was "DevSecOps"
    noOfResources: 2,
    allocatedResources: 1,
    estimatedRate: 90,
    currentYearForecast: 148000,
    status: "Under Review",
    submittedBy: "Dev Krishnan",
    deliveryManager: "Ananya Rao",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Security Engineer",
    workstream: "Security",
    startDate: "2026-03-15",
    endDate: "2026-10-31",
    comments:
      "Integration of IAM with SIEM for unified security event management.",
    allocation: { currentYear: 50, y2027: 30, y2028: 0, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 148000,
      y2027: 88000,
      y2028: 0,
      y2029: 0,
      y2030: 0,
    },
  },
  {
    id: "dem-008",
    projectId: "PRJ-1008",
    projectName: "Lambda Serverless Migration",
    requiredSkills: ["AWS", "CloudFormation", "Lambda"],
    budgetCode: "BC-4428",
    pillar: "Banking", // was "Cloud Eng"
    noOfResources: 3,
    allocatedResources: 2,
    estimatedRate: 75,
    currentYearForecast: 180000,
    status: "Submitted",
    submittedBy: "Vikram Singh",
    deliveryManager: "Priya Sharma",
    portfolio: "Global",
    program: "Enterprise",
    projectRole: "Cloud Developer",
    workstream: "Infrastructure",
    startDate: "2026-04-01",
    endDate: "2026-11-30",
    comments:
      "Migrating batch processing workloads to serverless Lambda functions.",
    allocation: { currentYear: 70, y2027: 50, y2028: 20, y2029: 0, y2030: 0 },
    forecast: {
      currentYear: 180000,
      y2027: 128000,
      y2028: 51000,
      y2029: 0,
      y2030: 0,
    },
  },
];
