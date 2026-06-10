export const C = {
  blue:       "#2563EB",
  blueSoft:   "#DBEAFE",
  teal:       "#0D9488",
  orange:     "#EA580C",
  orangeSoft: "#FFEDD5",
  red:        "#DC2626",
  redSoft:    "#FEE2E2",
  purple:     "#7C3AED",
  purpleSoft: "#EDE9FE",
  green:      "#16A34A",
  greenSoft:  "#DCFCE7",
  amber:      "#D97706",
  amberSoft:  "#FEF3C7",
  gray:       "#6B7280",
  indigo:     "#4F46E5",
  sky:        "#0284C7",
};

export const utilTrendData = [
  { month: "Dec '23", rate: 56 },
  { month: "Jan '24", rate: 58 },
  { month: "Feb '24", rate: 61 },
  { month: "Mar '24", rate: 65 },
  { month: "Apr '24", rate: 72 },
  { month: "May '24", rate: 83 },
];

export const allocationTrendData = [
  { month: "Dec'23", fte: 42 },
  { month: "Jan'24", fte: 48 },
  { month: "Feb'24", fte: 55 },
  { month: "Mar'24", fte: 61 },
  { month: "Apr'24", fte: 68 },
  { month: "May'24", fte: 71 },
];

export const capacityTrendData = [
  { month: "Jan", capacity: 72, allocated: 50, available: 22 },
  { month: "Feb", capacity: 75, allocated: 56, available: 19 },
  { month: "Mar", capacity: 80, allocated: 60, available: 20 },
  { month: "Apr", capacity: 78, allocated: 58, available: 20, forecast: 74 },
  { month: "May", capacity: 82, allocated: 64, available: 18, forecast: 79 },
  { month: "Jun", capacity: 85, allocated: 68, available: 17, forecast: 83 },
];

export const portfolioAlloc = [
  { name: "Digital Transformation", value: 33, pct: 33.0, color: C.blue },
  { name: "Product Engineering", value: 26, pct: 26.0, color: C.teal },
  { name: "Cloud Services", value: 18, pct: 18.0, color: C.orange },
  { name: "Data & Analytics", value: 14, pct: 14.0, color: C.purple },
  { name: "Business Applications", value: 9, pct: 9.0, color: C.green },
];

export const utilizationData = [
  { name: "Optimal", value: 54, color: C.blue },
  { name: "High", value: 22, color: C.orange },
  { name: "Underutilized", value: 16, color: C.green },
  { name: "Overallocated", value: 8, color: C.red },
];

export const riskData = [
  { name: "High Risk", value: 28, color: C.red },
  { name: "Medium Risk", value: 34, color: C.orange },
  { name: "Low Risk", value: 24, color: C.amber },
  { name: "Informational", value: 14, color: C.blue },
];

export const topRisks = [
  { text: "Critical skill shortage in Data Engineering", count: 5, color: C.red },
  { text: "Over allocation in Mobile Projects", count: 4, color: C.red },
  { text: "Open high priority demands", count: 4, color: C.orange },
  { text: "Key resource attrition risk", count: 3, color: C.green },
  { text: "Timesheets pending submission", count: 3, color: C.blue },
];

export const demandByPriority = [
  { label: "High", value: 42, color: C.red },
  { label: "Medium", value: 31, color: C.orange },
  { label: "Low", value: 19, color: C.green },
  { label: "Not Started", value: 8, color: C.gray },
];

export const utilByDept = [
  { dept: "Engineering", value: 89 },
  { dept: "Consulting", value: 85 },
  { dept: "Data & Analytics", value: 83 },
  { dept: "Cloud Services", value: 79 },
  { dept: "Product", value: 75 },
  { dept: "Business Ops", value: 60 },
];

export const allocationByFn = [
  { name: "Engineering", allocated: 78, available: 14, bench: 8 },
  { name: "Product", allocated: 74, available: 16, bench: 10 },
  { name: "Architecture", allocated: 81, available: 11, bench: 8 },
  { name: "Data", allocated: 72, available: 17, bench: 11 },
  { name: "QA", allocated: 76, available: 14, bench: 10 },
  { name: "Operations", allocated: 68, available: 17, bench: 15 },
  { name: "Shared Services", allocated: 63, available: 22, bench: 15 },
];

export const completeness = [
  { label: "Skills", value: 95 },
  { label: "Allocation Data", value: 93 },
  { label: "Manager Assignment", value: 91 },
  { label: "Timesheet Data", value: 89 },
  { label: "Certifications", value: 85 },
];

export const alertsData = [
  { label: "Overallocated Resources", count: 2, variant: "red" },
  { label: "Missing Timesheets", count: 1, variant: "orange" },
  { label: "Expiring Contracts", count: 1, variant: "amber" },
  { label: "Critical Skill Shortage", count: 1, variant: "red" },
];

export const staffingData = [
  { label: "High Priority", count: 48, color: C.red },
  { label: "Medium Priority", count: 34, color: C.orange },
  { label: "Low Priority", count: 18, color: C.green },
];

export const forecastVsActuals = [
  { month: "Jan", planned: 72, forecast: 65, actual: 60 },
  { month: "Feb", planned: 75, forecast: 68, actual: 63 },
  { month: "Mar", planned: 78, forecast: 71, actual: 66 },
  { month: "Apr", planned: 82, forecast: 74, actual: 70 },
  { month: "May", planned: 86, forecast: 79, actual: 73 },
  { month: "Jun", planned: 90, forecast: 83, actual: 76 },
];