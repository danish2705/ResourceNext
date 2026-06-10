// ─── Shared domain types ──────────────────────────────────────────────────────
// Extracted from useStore.ts so that mocks/store.ts can import them without
// creating a circular dependency (mocks/store → useStore → mocks/store).

export type LifecycleState =
  | "Demand"
  | "Intake"
  | "Active Allocation"
  | "Offboarding";

export interface YearMap {
  current: number;
  y2027: number;
  y2028: number;
  y2029: number;
  y2030: number;
}

export interface HistoryEntry {
  fieldName: string;
  from: string;
  to: string;
  updatedOn: string;
  updatedBy: string;
}

export interface Demand {
  id: string;
  portfolio: string;
  program: string;
  projectName: string;
  projectRole: string;
  budgetCode: string;
  pillar: string;
  allocationPercent: number;
  status:
    | "Draft"
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Awaiting Approval"
    | "RM Approved"
    | "RM Rejected"
    | "PMO Approved"
    | "PMO Rejected";
  comments: string;
  identified: boolean;
  estimatedRate: number;
  currentYearForecast: number;
  resourceName: string;
  workstream: string;
  subTeam: string;
  startDate: string;
  endDate: string;
  type: "Internal" | "External";
  vendorName: string;
  country: string;
  allocation: YearMap;
  forecast: YearMap;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  history: HistoryEntry[];
  forecastSourceId?: string;
  resourceCount: number;
  source?:
    | "Manual"
    | "Jira"
    | "Planisware"
    | "Smartsheets"
    | "Monday.com"
    | "Connected Source";
  isEdited?: boolean;
}

export interface Allocation {
  id: string;
  portfolio: string;
  pillar: string;
  budgetCode: string;
  project: string;
  projectRole: string;
  resourceName: string;
  resId: string;
  level: string;
  status: string;
  chargeType: string;
  externalPO: string;
  hourlyRate: number;
  poTitle: string;
  poApproval: string;
  startDate: string;
  endDate: string;
  allocationPercent: number;
  lifecycle: LifecycleState;
  history: HistoryEntry[];
}

export interface ResourceProfile {
  id: string;
  name: string;
  resId: string;
  email: string;
  type: "Internal" | "External";
  vendor: string;
  location: string;
  level: string;
  status: "Active" | "Inactive";
  primarySkill: string;
  allSkills: string[];
  yearsExperience: number;
  costPerHour: number;
  history: HistoryEntry[];
}

export interface TaskAssignment {
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  taskType: string;
  assignedTo: string;
  status: "Awaiting Approval";
  comments?: string;
  submittedAt: string;
}

export interface Forecast {
  id: string;
  portfolio: string;
  program: string;
  projectName: string;
  requiredRole: string;
  headcount: number;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  pillar: string;
  status: "Draft" | "Approved" | "Flagged" | "Converted";
  createdBy: string;
  createdDate: string;
  history: HistoryEntry[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  entity: "Demand" | "Allocation" | "Resource" | "Forecast";
  entityId: string;
  entityLabel: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface WorklistItem {
  id: string;
  activityType: string;
  summary: string;
  project: string;
  status: "Open" | "Approved" | "Rejected";
  dueBy: string;
  demandId: string;
}
