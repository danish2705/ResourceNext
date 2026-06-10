import type {
  Demand,
  Allocation,
  ResourceProfile,
  Forecast,
  WorklistItem,
  AuditEntry,
  LifecycleState,
} from "@/types";

// ─── Seed lookup arrays ───────────────────────────────────────────────────────

export const pillars = [
  "Hi-tech",
  "Retail",
  "Banking",
  "Healthcare",
  "Life Sciences",
];

export const projects = [
  "Data Modernization - ASPAC",
  "QE Automation",
  "Cloud Enablement",
  "Application Support",
];

export const roles = [
  "Business Analyst",
  "Technical Lead",
  "QA Engineer",
  "Project Manager",
  "DevOps Engineer",
];

export const budgetCodes = [
  "DM-ASPAC-01",
  "QE-AUTO-02",
  "CLD-ENB-03",
  "APP-SUP-04",
  "GEN-OPS-05",
];

export const vendors = [
  "UX Reactor",
  "Hyqoo",
  "Collabera",
  "Ascendion Global",
  "Moodys NWC",
];

export const resourceNames = [
  "Grishma Gangar",
  "Anurag Vaishy",
  "Karthik Dontula",
  "Adnan Siddiqui",
  "Ian Lee",
  "Rich Bowers",
  "Matthew Truelove",
  "Jamison Ducey",
  "Lindsey Lord",
  "Kristie Shirkavand",
];

export const locations = ["Sydney", "Germany", "Australia", "Poland"];

// ─── Internal seed helpers ────────────────────────────────────────────────────

const statuses: Demand["status"][] = [
  "Pending",
  "Approved",
  "Rejected",
  "Awaiting Approval",
];

const sources: Demand["source"][] = [
  "Manual",
  "Jira",
  "Planisware",
  "Smartsheets",
  "Monday.com",
  "Connected Source",
];

const lifecycle: LifecycleState[] = [
  "Demand",
  "Intake",
  "Active Allocation",
  "Offboarding",
];

const skillsPool = [
  "React",
  "Node.js",
  "AWS",
  "Python",
  "Java",
  "Selenium",
  "Salesforce",
  "Snowflake",
  "Kubernetes",
  "Power BI",
];

const slugify = (n: string) =>
  n
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");

// ─── Mock Resources ───────────────────────────────────────────────────────────

export const mockResources: ResourceProfile[] = resourceNames.map((name, i) => {
  const primary = skillsPool[i % skillsPool.length];
  const all = [
    primary,
    skillsPool[(i + 1) % skillsPool.length],
    skillsPool[(i + 3) % skillsPool.length],
  ];
  return {
    id: `res-${i}`,
    name,
    resId: String(100000 + i * 12345),
    email: `${slugify(name)}@ascendion.com`,
    type: i % 3 === 0 ? "External" : "Internal",
    vendor: i % 3 === 0 ? vendors[i % vendors.length] : "N/A",
    location: locations[i % locations.length],
    level: ["External", "M1", "M2", "D1", "D2", "VP"][i % 6],
    status: i % 7 === 0 ? "Inactive" : "Active",
    primarySkill: primary,
    allSkills: all,
    yearsExperience: 3 + (i % 12),
    costPerHour: 75 + i * 8,
    history: [],
  };
});

// ─── Mock Demands ─────────────────────────────────────────────────────────────

export const mockDemands: Demand[] = Array.from({ length: 47 }, (_, i) => ({
  id: `dem-${i + 1}`,
  portfolio: pillars[i % pillars.length],
  program: "Enterprise",
  projectName: projects[i % projects.length],
  projectRole: roles[i % roles.length],
  budgetCode: budgetCodes[i % budgetCodes.length],
  pillar: pillars[i % pillars.length],
  allocationPercent: Math.floor(Math.random() * 15),
  resourceCount: Math.floor(Math.random() * 8) + 1,
  status: statuses[i % statuses.length],
  comments: "",
  identified: i % 2 === 0,
  estimatedRate: 110 + i * 10,
  currentYearForecast: 100000 + i * 10000,
  resourceName: i % 2 === 0 ? resourceNames[i % resourceNames.length] : "",
  workstream: "WS-" + ((i % 3) + 1),
  subTeam: "ST-" + ((i % 4) + 1),
  startDate: "2027-01-01",
  endDate: "2028-12-31",
  type: i % 3 === 0 ? "External" : "Internal",
  vendorName: i % 3 === 0 ? vendors[i % vendors.length] : "",
  country: locations[i % locations.length],
  allocation: { current: 0.8, y2027: 0.8, y2028: 0, y2029: 0, y2030: 0 },
  forecast: {
    current: 50000 + i * 5000,
    y2027: 70000 + i * 3000,
    y2028: i < 5 ? 90000 + i * 2000 : 0,
    y2029: 0,
    y2030: 0,
  },
  createdBy: "james.carter@ascendion.com",
  createdDate: "01/15/2027",
  updatedBy: "james.carter@ascendion.com",
  updatedDate: "01/15/2027",
  history: [],
  source: sources[i % sources.length],
  isEdited: i % 7 === 0,
}));

// ─── Mock Allocations ─────────────────────────────────────────────────────────

export const mockAllocations: Allocation[] = Array.from(
  { length: 17 },
  (_, i) => ({
    id: `alloc-${i + 1}`,
    portfolio: pillars[i % pillars.length],
    pillar: pillars[i % pillars.length],
    budgetCode: budgetCodes[i % budgetCodes.length],
    project: projects[i % projects.length],
    projectRole: roles[i % roles.length],
    resourceName: resourceNames[i % resourceNames.length],
    resId: String(100000 + Math.floor(Math.random() * 900000)),
    level: ["External", "M1", "M2", "D1", "D2", "VP"][i % 6],
    status: ["On-Boarded", "Cancelled", "-- Select --"][i % 3],
    chargeType: ["Backfill Charge", "Direct HC Charge", "-- Select --"][i % 3],
    externalPO: i % 3 === 0 ? budgetCodes[i % budgetCodes.length] : "N/A",
    hourlyRate: i % 3 === 0 ? 121 + i : 0,
    poTitle: i % 3 === 0 ? "PMO" : "N/A",
    poApproval: i % 3 === 0 ? "Approved" : "N/A",
    startDate: "2027-01-01",
    endDate: ["2027-06-30", "2027-12-31", "2028-06-30", "2028-12-31"][i % 4],
    allocationPercent: [25, 50, 75, 100][i % 4],
    lifecycle: lifecycle[i % lifecycle.length],
    history: [],
  }),
);

// ─── Mock Worklist ────────────────────────────────────────────────────────────

export const mockWorklist: WorklistItem[] = [
  {
    id: "wl-1",
    activityType: "Review Demand Approval",
    summary: "Demand For Technical Lead Created By Anurag Vaishy",
    project: "Data Modernization - ASPAC",
    status: "Open",
    dueBy: "02/14/2027",
    demandId: "dem-2",
  },
  {
    id: "wl-2",
    activityType: "Review Demand Approval",
    summary: "Demand For QA Engineer Created By Karthik Dontula",
    project: "QE Automation",
    status: "Open",
    dueBy: "02/15/2027",
    demandId: "dem-5",
  },
  {
    id: "wl-3",
    activityType: "Review Resource Allocation",
    summary: "Resource Allocation For Cloud Enablement Submitted",
    project: "Cloud Enablement",
    status: "Open",
    dueBy: "02/16/2027",
    demandId: "dem-10",
  },
];

// ─── Mock Forecasts ───────────────────────────────────────────────────────────

export const mockForecasts: Forecast[] = Array.from({ length: 6 }, (_, i) => ({
  id: `fc-${i + 1}`,
  portfolio: pillars[i % pillars.length],
  program: ["Enterprise", "EMEA", "AMER", "APAC"][i % 4],
  projectName: projects[i % projects.length],
  requiredRole: roles[i % roles.length],
  headcount: 1 + (i % 5),
  startDate: "2027-04-01",
  endDate: "2028-03-31",
  estimatedCost: 80000 + i * 25000,
  pillar: pillars[i % pillars.length],
  status: (["Draft", "Approved", "Flagged", "Draft"] as Forecast["status"][])[
    i % 4
  ],
  createdBy: "olivia.bennett@ascendion.com",
  createdDate: "02/01/2027",
  history: [],
}));

// ─── Seed Audit Log ───────────────────────────────────────────────────────────

export const seedAuditLog: AuditEntry[] = [
  {
    id: "audit-seed-1",
    timestamp: "01/15/2027, 09:12:00",
    user: "james.carter@ascendion.com",
    entity: "Demand",
    entityId: "dem-1",
    entityLabel: "Data Modernization - ASPAC",
    action: "Created",
    field: "",
    oldValue: "",
    newValue: "status: Pending",
  },
  {
    id: "audit-seed-2",
    timestamp: "01/16/2027, 10:45:00",
    user: "james.carter@ascendion.com",
    entity: "Demand",
    entityId: "dem-2",
    entityLabel: "QE Automation",
    action: "Status Changed",
    field: "status",
    oldValue: "Pending",
    newValue: "Approved",
  },
  {
    id: "audit-seed-3",
    timestamp: "01/17/2027, 14:30:00",
    user: "olivia.bennett@ascendion.com",
    entity: "Demand",
    entityId: "dem-bulk-01",
    entityLabel: "Cloud Enablement",
    action: "Bulk Import",
    field: "",
    oldValue: "",
    newValue: "status: Pending",
  },
  {
    id: "audit-seed-4",
    timestamp: "01/18/2027, 11:00:00",
    user: "sarah.mitchell@ascendion.com",
    entity: "Resource",
    entityId: "res-0",
    entityLabel: "James Carter",
    action: "Field Updated",
    field: "primarySkill",
    oldValue: "React",
    newValue: "Node.js",
  },
  {
    id: "audit-seed-5",
    timestamp: "01/19/2027, 16:20:00",
    user: "james.carter@ascendion.com",
    entity: "Demand",
    entityId: "dem-3",
    entityLabel: "Cloud Enablement",
    action: "Field Updated",
    field: "estimatedRate",
    oldValue: "130",
    newValue: "150",
  },
  {
    id: "audit-seed-6",
    timestamp: "01/20/2027, 08:55:00",
    user: "sarah.mitchell@ascendion.com",
    entity: "Resource",
    entityId: "res-0",
    entityLabel: "James Carter",
    action: "Field Updated",
    field: "primarySkill",
    oldValue: "React",
    newValue: "Kubernetes",
  },
  {
    id: "audit-seed-7",
    timestamp: "01/21/2027, 13:10:00",
    user: "james.carter@ascendion.com",
    entity: "Demand",
    entityId: "dem-9",
    entityLabel: "QE Automation",
    action: "Deleted",
    field: "",
    oldValue: "status: Rejected",
    newValue: "",
  },
  {
    id: "audit-seed-8",
    timestamp: "01/22/2027, 15:45:00",
    user: "sarah.mitchell@ascendion.com",
    entity: "Demand",
    entityId: "dem-4",
    entityLabel: "Application Support",
    action: "Deleted",
    field: "",
    oldValue: "status: Rejected",
    newValue: "",
  },
];
