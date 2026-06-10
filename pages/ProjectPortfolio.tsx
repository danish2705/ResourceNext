import { useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useActiveValues } from "@/store/useMasterData";

import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  AlertTriangle,
  Layers,
  DollarSign,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus =
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Proposed"
  | "Approved - Backlog";

interface ResourcePlanEntry {
  role: string;
  required: number;
  allocated: number;
  gap: number;
  startDate: string;
  endDate: string;
}

interface PortfolioRow {
  id: string;
  projectId: string;
  project: string;
  portfolio?: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  type: string;
  status: ApprovalStatus;
  fromDate: string;
  toDate: string;
  budget: number;
  cost: number;
  variance: number;
  projectedBenefits: number;
  resourcePlan?: ResourcePlanEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

// Parse DD-MM-YYYY to a comparable Date
const parseDate = (ddmmyyyy: string): Date | null => {
  const parts = ddmmyyyy.split("-");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return new Date(`${y}-${m}-${d}`);
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_ROWS: PortfolioRow[] = [
  {
    id: "1",
    projectId: "P-001",
    project: "Enterprise Mobility v4.2",
    priority: "Critical",
    owner: "Ohlen, Hampus",
    type: "Strategic",
    status: "Active",
    fromDate: "01-06-2020",
    toDate: "25-01-2021",
    budget: 1000000,
    cost: 374971.08,
    variance: 625028.92,
    projectedBenefits: 269250,
    resourcePlan: [
      {
        role: "Solution Architect",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-06-2020",
        endDate: "25-01-2021",
      },
      {
        role: "Backend Developer",
        required: 4,
        allocated: 3,
        gap: 1,
        startDate: "01-07-2020",
        endDate: "25-01-2021",
      },
      {
        role: "QA Engineer",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-09-2020",
        endDate: "25-01-2021",
      },
      {
        role: "Project Manager",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-06-2020",
        endDate: "25-01-2021",
      },
    ],
  },
  {
    id: "2",
    projectId: "P-002",
    project: "Mobile Marketplace Upgrade",
    priority: "Critical",
    owner: "Kukreja, Samir",
    type: "Strategic",
    status: "Active",
    fromDate: "01-01-2020",
    toDate: "19-08-2020",
    budget: 125000,
    cost: 166401.76,
    variance: -41401.76,
    projectedBenefits: 122000,
    resourcePlan: [
      {
        role: "Mobile Developer",
        required: 3,
        allocated: 3,
        gap: 0,
        startDate: "01-01-2020",
        endDate: "19-08-2020",
      },
      {
        role: "UI/UX Designer",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-01-2020",
        endDate: "30-03-2020",
      },
      {
        role: "Business Analyst",
        required: 1,
        allocated: 0,
        gap: 1,
        startDate: "01-02-2020",
        endDate: "19-08-2020",
      },
    ],
  },
  {
    id: "3",
    projectId: "P-003",
    project: "BDH Research Project",
    priority: "High",
    owner: "Hood, Ben",
    type: "Strategic",
    status: "Proposed",
    fromDate: "01-03-2020",
    toDate: "08-02-2021",
    budget: 50000,
    cost: 306096.0,
    variance: -256096.0,
    projectedBenefits: 760000,
    resourcePlan: [
      {
        role: "Research Lead",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-03-2020",
        endDate: "08-02-2021",
      },
      {
        role: "Data Scientist",
        required: 2,
        allocated: 1,
        gap: 1,
        startDate: "01-04-2020",
        endDate: "08-02-2021",
      },
      {
        role: "Research Analyst",
        required: 3,
        allocated: 2,
        gap: 1,
        startDate: "01-05-2020",
        endDate: "31-12-2020",
      },
    ],
  },
  {
    id: "4",
    projectId: "P-004",
    project: "Analytics Platform",
    priority: "Medium",
    owner: "Hill, Stephen",
    type: "Compliance",
    status: "Approved - Backlog",
    fromDate: "01-02-2020",
    toDate: "20-08-2020",
    budget: 450000,
    cost: 388804.46,
    variance: 61195.54,
    projectedBenefits: 520000,
    resourcePlan: [
      {
        role: "Data Engineer",
        required: 3,
        allocated: 3,
        gap: 0,
        startDate: "01-02-2020",
        endDate: "20-08-2020",
      },
      {
        role: "BI Developer",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-03-2020",
        endDate: "20-08-2020",
      },
      {
        role: "Cloud Architect",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-02-2020",
        endDate: "20-08-2020",
      },
      {
        role: "Scrum Master",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-02-2020",
        endDate: "20-08-2020",
      },
    ],
  },
  {
    id: "5",
    projectId: "P-005",
    project: "AI Interface Rollout",
    priority: "Medium",
    owner: "Packebush, Sherrill",
    type: "Strategic",
    status: "Active",
    fromDate: "01-01-2020",
    toDate: "21-10-2020",
    budget: 1260000,
    cost: 433463.29,
    variance: 826536.71,
    projectedBenefits: 280000,
    resourcePlan: [
      {
        role: "AI/ML Engineer",
        required: 4,
        allocated: 3,
        gap: 1,
        startDate: "01-01-2020",
        endDate: "21-10-2020",
      },
      {
        role: "Frontend Developer",
        required: 3,
        allocated: 3,
        gap: 0,
        startDate: "01-03-2020",
        endDate: "21-10-2020",
      },
      {
        role: "Product Owner",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-01-2020",
        endDate: "21-10-2020",
      },
      {
        role: "DevOps Engineer",
        required: 2,
        allocated: 1,
        gap: 1,
        startDate: "01-04-2020",
        endDate: "21-10-2020",
      },
    ],
  },
  {
    id: "6",
    projectId: "P-006",
    project: "CRM Implementation v3",
    priority: "Medium",
    owner: "Kukreja, Samir",
    type: "Compliance",
    status: "Proposed",
    fromDate: "01-04-2020",
    toDate: "23-12-2020",
    budget: 100000,
    cost: 196161.58,
    variance: -96161.58,
    projectedBenefits: 37861,
    resourcePlan: [
      {
        role: "CRM Consultant",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-04-2020",
        endDate: "23-12-2020",
      },
      {
        role: "Integration Developer",
        required: 2,
        allocated: 1,
        gap: 1,
        startDate: "01-05-2020",
        endDate: "23-12-2020",
      },
      {
        role: "Business Analyst",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-04-2020",
        endDate: "30-09-2020",
      },
    ],
  },
  {
    id: "7",
    projectId: "P-007",
    project: "Mobile Application Project",
    priority: "Medium",
    owner: "Hill, Stephen",
    type: "Financial",
    status: "Active",
    fromDate: "01-05-2020",
    toDate: "30-04-2021",
    budget: 50000,
    cost: 623626.68,
    variance: -573626.68,
    projectedBenefits: 72750,
    resourcePlan: [
      {
        role: "iOS Developer",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-05-2020",
        endDate: "30-04-2021",
      },
      {
        role: "Android Developer",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-05-2020",
        endDate: "30-04-2021",
      },
      {
        role: "QA Engineer",
        required: 1,
        allocated: 0,
        gap: 1,
        startDate: "01-08-2020",
        endDate: "30-04-2021",
      },
    ],
  },
  {
    id: "8",
    projectId: "P-008",
    project: "Increase Machine Inspections",
    priority: "Low",
    owner: "Chrobok, Sabrina",
    type: "Strategic",
    status: "Active",
    fromDate: "01-01-2020",
    toDate: "21-08-2020",
    budget: 120000,
    cost: 386401.4,
    variance: -266401.4,
    projectedBenefits: 93083.33,
    resourcePlan: [
      {
        role: "Field Engineer",
        required: 5,
        allocated: 4,
        gap: 1,
        startDate: "01-01-2020",
        endDate: "21-08-2020",
      },
      {
        role: "Operations Manager",
        required: 1,
        allocated: 1,
        gap: 0,
        startDate: "01-01-2020",
        endDate: "21-08-2020",
      },
      {
        role: "Technical Analyst",
        required: 2,
        allocated: 2,
        gap: 0,
        startDate: "01-03-2020",
        endDate: "21-08-2020",
      },
    ],
  },
];

// ─── Badge styles ─────────────────────────────────────────────────────────────

const priorityStyle = (p: PortfolioRow["priority"]) => {
  if (p === "Critical")
    return "bg-red-500 text-white border-0 text-xs font-semibold";
  if (p === "High")
    return "bg-red-200 text-red-700 dark:bg-red-500/30 dark:text-red-300 border-0 text-xs font-semibold";
  if (p === "Medium")
    return "bg-orange-100 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300 border-0 text-xs font-semibold";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-0 text-xs font-semibold";
};

const statusStyle = (s: ApprovalStatus) => {
  if (s === "Active")
    return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-0 text-xs font-medium";
  if (s === "Approved")
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-0 text-xs font-medium";
  if (s === "Proposed")
    return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-0 text-xs font-medium";
  if (s === "Rejected")
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-0 text-xs font-medium";
  if (s === "Approved - Backlog")
    return "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-0 text-xs font-medium";
  return "bg-muted/60 text-muted-foreground border-0 text-xs font-medium";
};

// ─── Filter State Type ────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  priorities: Set<string>;
  statuses: Set<string>;
  types: Set<string>;
  owners: Set<string>;
  startDateFrom: string;
  endDateFrom: string;
  varianceFilter: "all" | "over" | "under";
}

const defaultFilters = (): FilterState => ({
  search: "",
  priorities: new Set(),
  statuses: new Set(),
  types: new Set(),
  owners: new Set(),
  startDateFrom: "",
  endDateFrom: "",
  varianceFilter: "all",
});

// ─── Multi-select Dropdown ────────────────────────────────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useMemo(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    const next = new Set(selected);
    next.has(val) ? next.delete(val) : next.add(val);
    onChange(next);
  };

  const count = selected.size;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap
          ${
            count > 0
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
          }`}
      >
        {label}
        {count > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-[180px] bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-1">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(opt)}
                  onChange={() => toggle(opt)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                <span className="text-xs text-foreground">{opt}</span>
              </label>
            ))}
          </div>
          {count > 0 && (
            <div className="border-t border-border px-3 py-2">
              <button
                onClick={() => onChange(new Set())}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Project Detail Modal ─────────────────────────────────────────────────────

function ProjectDetailModal({
  row,
  onClose,
}: {
  row: PortfolioRow;
  onClose: () => void;
}) {
  const budgetPct = Math.min(100, Math.round((row.cost / row.budget) * 100));
  const isOver = row.cost > row.budget;
  const [activeTab, setActiveTab] = useState<"overview" | "resource-plan">(
    "overview",
  );

  const totalRequired =
    row.resourcePlan?.reduce((s, r) => s + r.required, 0) ?? 0;
  const totalAllocated =
    row.resourcePlan?.reduce((s, r) => s + r.allocated, 0) ?? 0;
  const totalGap = totalRequired - totalAllocated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono text-muted-foreground">
                {row.projectId}
              </span>
              <Badge className={priorityStyle(row.priority)}>
                {row.priority}
              </Badge>
              <Badge className={statusStyle(row.status)}>{row.status}</Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">{row.project}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.owner} · {row.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border px-6 gap-1 bg-card">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("resource-plan")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${activeTab === "resource-plan" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Resource Plan
            {totalGap > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {totalGap}
              </span>
            )}
          </button>
        </div>

        <div className="p-6 space-y-5">
          {activeTab === "overview" ? (
            <>
              <div className="bg-muted/40 border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Budget vs. Target
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {budgetPct}% used
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground mb-3">
                  {fmtShort(row.budget)}
                </p>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-orange-400"}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                    Cost · {fmtShort(row.cost)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    Budget · {fmtShort(row.budget)}
                  </span>
                  <span
                    className={`ml-auto font-medium ${row.variance < 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    Variance ·{" "}
                    {row.variance < 0
                      ? `-${fmtShort(Math.abs(row.variance))}`
                      : fmtShort(row.variance)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Projected Benefits
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {fmtShort(row.projectedBenefits)}
                  </p>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Actual Cost
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtShort(row.cost)}
                  </p>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Variance</p>
                  <p
                    className={`text-2xl font-bold ${row.variance < 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    {row.variance < 0
                      ? `-${fmtShort(Math.abs(row.variance))}`
                      : fmtShort(row.variance)}
                  </p>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtShort(row.budget)}
                  </p>
                </div>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Actuals
                </p>
                <p className="text-2xl font-bold text-foreground mb-3">
                  {fmtShort(row.cost)}
                </p>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((row.cost / (row.budget * 1.2)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                    Unselected Actuals · {fmtShort(row.cost * 0.32)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    Selected Actuals · {fmtShort(row.cost * 0.68)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Project Owner", value: row.owner },
                  { label: "Type", value: row.type },
                  { label: "Priority", value: row.priority },
                  { label: "Start Date", value: row.fromDate },
                  { label: "End Date", value: row.toDate },
                  { label: "Status", value: row.status },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-muted/40 border border-border rounded-xl p-3"
                  >
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                    Total Required
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalRequired}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    resources
                  </p>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                    Allocated
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {totalAllocated}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    resources
                  </p>
                </div>
                <div
                  className={`border rounded-xl p-4 text-center ${totalGap > 0 ? "bg-red-500/10 border-red-500/30" : "bg-muted/40 border-border"}`}
                >
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                    Gap
                  </p>
                  <p
                    className={`text-3xl font-bold ${totalGap > 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    {totalGap}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalGap > 0 ? "unfilled" : "fully staffed"}
                  </p>
                </div>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Staffing Coverage
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalRequired > 0
                      ? Math.round((totalAllocated / totalRequired) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${totalGap > 0 ? "bg-amber-400" : "bg-green-500"}`}
                    style={{
                      width: `${totalRequired > 0 ? Math.round((totalAllocated / totalRequired) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              {row.resourcePlan && row.resourcePlan.length > 0 ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Role
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Required
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Allocated
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Gap
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Period
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.resourcePlan.map((entry, idx) => (
                        <tr
                          key={idx}
                          className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {entry.role}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {entry.required}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-sm">
                              {entry.allocated}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {entry.gap > 0 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
                                -{entry.gap}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-500 font-bold text-sm">
                                ✓
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {entry.startDate} → {entry.endDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 p-8 text-center text-muted-foreground text-sm">
                  No resource plan defined for this project.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Demand Dialog ─────────────────────────────────────────────────────

function CreateDemandDialog({
  rows,
  onClose,
  onSubmit,
}: {
  rows: PortfolioRow[];
  onClose: () => void;
  onSubmit: (selected: PortfolioRow[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const handleSubmit = () => {
    onSubmit(rows.filter((r) => selected.has(r.id)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Create Demand</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select one or more projects to create demand for
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-border flex items-center gap-3 bg-muted/30 shrink-0">
          <input
            ref={selectAllRef}
            type="checkbox"
            id="selectAll"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 cursor-pointer accent-primary"
          />
          <label
            htmlFor="selectAll"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            Select all
          </label>
          <span className="ml-auto text-xs bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">
            {selected.size} selected
          </span>
        </div>
        <div className="overflow-y-auto flex-1">
          {rows.map((row) => {
            const isChecked = selected.has(row.id);
            return (
              <div
                key={row.id}
                onClick={() => toggle(row.id)}
                className={`flex items-center gap-3 px-6 py-3 border-b border-border cursor-pointer hover:bg-muted/40 transition-colors last:border-b-0 ${isChecked ? "bg-primary/5" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(row.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-primary flex-shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {row.project}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.projectId} · {row.owner} · {row.type}
                  </p>
                </div>
                <Badge className={priorityStyle(row.priority)}>
                  {row.priority}
                </Badge>
                <Badge className={statusStyle(row.status)}>{row.status}</Badge>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 rounded-b-2xl shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={selected.size === 0}
            onClick={handleSubmit}
            className="gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Submit Demand
            {selected.size > 0 && (
              <span className="ml-1 bg-white/20 rounded px-1.5 py-0.5 text-xs">
                {selected.size}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectPortfolio() {
  const location = useLocation();
  const navigate = useNavigate();
  const { portfolioProjects, addDemands, demands } = useStore();
  const masterPortfolios = useActiveValues("portfolios");

  const sendForApproval = location.state?.sendForApproval ?? false;
  const [viewRow, setViewRow] = useState<PortfolioRow | null>(null);
  const [showDemandDialog, setShowDemandDialog] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters());

  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ApprovalStatus>
  >({});
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  // Derive all rows from store + seed
  const rows = useMemo<PortfolioRow[]>(() => {
    const approvedStatuses = new Set([
      "Approved",
      "PMO Approved",
      "RM Approved",
    ]);
    const allocatedByRole: Record<string, Record<string, number>> = {};
    const allocatedTotal: Record<string, number> = {};

    for (const d of demands ?? []) {
      if (!approvedStatuses.has(d.status)) continue;
      const proj = d.projectName?.trim().toLowerCase();
      if (!proj) continue;
      allocatedTotal[proj] = (allocatedTotal[proj] ?? 0) + 1;
      const role = d.projectRole?.trim().toLowerCase();
      if (role && role !== "tbd") {
        if (!allocatedByRole[proj]) allocatedByRole[proj] = {};
        allocatedByRole[proj][role] = (allocatedByRole[proj][role] ?? 0) + 1;
      }
    }

    const storeRows: PortfolioRow[] = (portfolioProjects ?? []).map((p) => {
      const projKey = p.project?.trim().toLowerCase();
      let remainingUnmatched = allocatedTotal[projKey] ?? 0;
      return {
        id: p.id,
        projectId: p.projectId,
        project: p.project,
        portfolio: p.portfolio,
        priority: p.priority,
        owner: p.owner,
        type: p.type,
        status: statusOverrides[p.id] ?? p.status,
        fromDate: p.fromDate,
        toDate: p.toDate,
        budget: p.budget,
        cost: p.cost,
        variance: p.variance,
        projectedBenefits: p.projectedBenefits,
        resourcePlan: p.resourcePlan?.map((r) => {
          const roleKey = r.role?.trim().toLowerCase();
          const roleMatch = allocatedByRole[projKey]?.[roleKey] ?? 0;
          const fallback =
            roleMatch === 0 ? Math.min(remainingUnmatched, r.noOfResources) : 0;
          if (fallback > 0) remainingUnmatched -= fallback;
          const allocated = roleMatch + fallback;
          const required = r.noOfResources;
          return {
            role: r.role,
            required,
            allocated,
            gap: Math.max(0, required - allocated),
            startDate: r.fromDate
              ? r.fromDate.split("-").reverse().join("-")
              : "",
            endDate: r.toDate ? r.toDate.split("-").reverse().join("-") : "",
          };
        }),
      };
    });

    const seedRows: PortfolioRow[] = SEED_ROWS.map((r) => ({
      ...r,
      status: statusOverrides[r.id] ?? r.status,
    }));
    return [...storeRows, ...seedRows];
  }, [portfolioProjects, statusOverrides, demands]);

  // Derive filter option lists from all rows
  const priorityOptions = useMemo(
    () => [...new Set(rows.map((r) => r.priority))],
    [rows],
  );
  const statusOptions = useMemo(
    () => [...new Set(rows.map((r) => r.status))],
    [rows],
  );
  const typeOptions = useMemo(
    () => [...new Set(rows.map((r) => r.type))],
    [rows],
  );
  const ownerOptions = useMemo(
    () => [...new Set(rows.map((r) => r.owner))].sort(),
    [rows],
  );

  // Apply filters
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Text search: project name or project ID
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !row.project.toLowerCase().includes(q) &&
          !row.projectId.toLowerCase().includes(q)
        )
          return false;
      }
      // Priority
      if (filters.priorities.size > 0 && !filters.priorities.has(row.priority))
        return false;
      // Status
      if (filters.statuses.size > 0 && !filters.statuses.has(row.status))
        return false;
      // Type
      if (filters.types.size > 0 && !filters.types.has(row.type)) return false;
      // Owner
      if (filters.owners.size > 0 && !filters.owners.has(row.owner))
        return false;
      // Variance filter
      if (filters.varianceFilter === "over" && row.variance >= 0) return false;
      if (filters.varianceFilter === "under" && row.variance < 0) return false;
      // Start date filter
      if (filters.startDateFrom) {
        const rowDate = parseDate(row.fromDate);
        if (rowDate && rowDate < new Date(filters.startDateFrom)) return false;
      }
      // End date filter
      if (filters.endDateFrom) {
        const rowDate = parseDate(row.toDate);
        if (rowDate && rowDate < new Date(filters.endDateFrom)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.priorities.size) n++;
    if (filters.statuses.size) n++;
    if (filters.types.size) n++;
    if (filters.owners.size) n++;
    if (filters.varianceFilter !== "all") n++;
    if (filters.startDateFrom) n++;
    if (filters.endDateFrom) n++;
    return n;
  }, [filters]);

  const resetFilters = () => setFilters(defaultFilters());

  const setFilter = <K extends keyof FilterState>(
    key: K,
    val: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [key]: val }));

  const pendingRows = sendForApproval
    ? rows.filter((r) => !approvedIds.has(r.id) && !rejectedIds.has(r.id))
    : [];

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => new Set([...prev, id]));
    setStatusOverrides((prev) => ({ ...prev, [id]: "Approved" }));
  };

  const handleReject = (id: string) => {
    setRejectedIds((prev) => new Set([...prev, id]));
    setStatusOverrides((prev) => ({ ...prev, [id]: "Rejected" }));
  };

  const handleDemandSubmit = (selected: PortfolioRow[]) => {
    const toIso = (ddmmyyyy: string) => {
      const [d, m, y] = ddmmyyyy.split("-");
      return y && m && d ? `${y}-${m}-${d}` : ddmmyyyy;
    };
    const typeToPortfolio: Record<string, string> = {
      Strategic: "Global",
      Compliance: "Hi-tech",
      Financial: "Retail",
    };
    const getPortfolio = (type: string) => {
      const mapped = typeToPortfolio[type];
      if (mapped && masterPortfolios.includes(mapped)) return mapped;
      return masterPortfolios[0] || "";
    };
    const newDemands = selected.map((row) => ({
      portfolio:
        row.portfolio && masterPortfolios.includes(row.portfolio)
          ? row.portfolio
          : getPortfolio(row.type),
      program: "",
      projectName: row.project,
      projectRole: "",
      budgetCode: row.projectId,
      pillar: "",
      allocationPercent: 0,
      status: "Pending" as const,
      comments: "",
      identified: false,
      estimatedRate: 0,
      currentYearForecast: 0,
      resourceName: "",
      workstream: "",
      subTeam: "",
      startDate: toIso(row.fromDate),
      endDate: toIso(row.toDate),
      type: "Internal" as const,
      vendorName: "",
      country: "",
      resourceCount: row.resourcePlan?.reduce((s, r) => s + r.required, 0) ?? 0,
      allocation: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
      forecast: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
    }));
    addDemands(newDemands);
    navigate("/demand", {
      state: {
        fromPortfolio: true,
        projectNames: selected.map((r) => r.project),
      },
    });
  };

  // KPI values based on ALL rows (unfiltered)
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalBenefits = rows.reduce((s, r) => s + r.projectedBenefits, 0);
  const overBudgetCount = rows.filter((r) => r.variance < 0).length;
  const approvedCount = rows.filter(
    (r) => r.status === "Approved" || r.status === "Active",
  ).length;
  const canCreateDemand = approvedCount > 0;

  const kpiCards = [
    {
      label: "Total Budget",
      value: fmtShort(totalBudget),
      sub: "Across all projects",
      pct: Math.min(100, Math.round((totalCost / totalBudget) * 100)),
      barColor: "bg-blue-500",
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
      iconBg: "bg-blue-500/15",
    },
    {
      label: "Total Cost",
      value: fmtShort(totalCost),
      sub: `${Math.round((totalCost / totalBudget) * 100)}% of budget used`,
      pct: Math.min(100, Math.round((totalCost / totalBudget) * 100)),
      barColor: totalCost > totalBudget ? "bg-red-500" : "bg-amber-500",
      icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
      iconBg: "bg-amber-500/15",
    },
    {
      label: "Projected Benefits",
      value: fmtShort(totalBenefits),
      sub: "Expected return",
      pct: Math.min(100, Math.round((totalBenefits / (totalBudget * 2)) * 100)),
      barColor: "bg-green-500",
      icon: <BarChart3 className="w-4 h-4 text-green-500" />,
      iconBg: "bg-green-500/15",
    },
    {
      label: "Over Budget",
      value: String(overBudgetCount),
      sub: "Projects with negative variance",
      pct: Math.round((overBudgetCount / rows.length) * 100),
      barColor: "bg-red-500",
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      iconBg: "bg-red-500/15",
    },
  ];

  return (
    <div className="space-y-6">
      {viewRow && (
        <ProjectDetailModal row={viewRow} onClose={() => setViewRow(null)} />
      )}
      {showDemandDialog && (
        <CreateDemandDialog
          rows={rows}
          onClose={() => setShowDemandDialog(false)}
          onSubmit={handleDemandSubmit}
        />
      )}

      {/* Heder */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Project Portfolio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track budgets, costs, and approvals across all projects
            </p>
          </div>
          {sendForApproval && (
            <Badge className="bg-warning/15 text-warning border-0 ml-2">
              <Clock className="h-3 w-3 mr-1" />
              Pending Approval
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          className="gap-2"
          disabled={!canCreateDemand}
          onClick={() => setShowDemandDialog(true)}
          title={
            !canCreateDemand
              ? "At least one project must be approved to create demand"
              : undefined
          }
        >
          <PlusCircle className="h-4 w-4" />
          Create Demand
        </Button>
      </div>

      {sendForApproval && pendingRows.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-foreground">
            <strong>{pendingRows.length}</strong> scenario(s) submitted for
            approval. Review each item below and approve or reject.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                  {k.label}
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {k.value}
                </p>
              </div>
              <div
                className={`w-7 h-7 rounded-lg ${k.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                {k.icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${k.barColor} rounded-full transition-all`}
                  style={{ width: `${k.pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                {k.pct}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-3">
        {/* Row 1: Search + dropdowns + variance toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search project name or ID…"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => setFilter("search", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="w-px h-5 bg-border" />

          {/* Multi-select dropdowns */}
          <MultiSelectDropdown
            label="Priority"
            options={priorityOptions}
            selected={filters.priorities}
            onChange={(v) => setFilter("priorities", v)}
          />
          <MultiSelectDropdown
            label="Status"
            options={statusOptions}
            selected={filters.statuses}
            onChange={(v) => setFilter("statuses", v)}
          />
          <MultiSelectDropdown
            label="Type"
            options={typeOptions}
            selected={filters.types}
            onChange={(v) => setFilter("types", v)}
          />
          <MultiSelectDropdown
            label="Owner"
            options={ownerOptions}
            selected={filters.owners}
            onChange={(v) => setFilter("owners", v)}
          />

          <div className="w-px h-5 bg-border" />

          {/* Variance quick filter */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            {(["all", "over", "under"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setFilter("varianceFilter", val)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                  ${
                    filters.varianceFilter === val
                      ? val === "over"
                        ? "bg-red-500 text-white"
                        : val === "under"
                          ? "bg-green-500 text-white"
                          : "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {val === "all"
                  ? "All Variance"
                  : val === "over"
                    ? "Over Budget"
                    : "Under Budget"}
              </button>
            ))}
          </div>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border/80 transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>

        {/* Row 2: Date range filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              Start Date:
            </span>
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => setFilter("startDateFrom", e.target.value)}
              className="px-2 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
            {filters.startDateFrom && (
              <button
                onClick={() => setFilter("startDateFrom", "")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="w-px h-4 bg-border" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              End Date:
            </span>
            <input
              type="date"
              value={filters.endDateFrom}
              onChange={(e) => setFilter("endDateFrom", e.target.value)}
              className="px-2 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
            {filters.endDateFrom && (
              <button
                onClick={() => setFilter("endDateFrom", "")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Result count */}
          <span className="ml-auto text-xs text-muted-foreground">
            Showing{" "}
            <strong className="text-foreground">{filteredRows.length}</strong>{" "}
            of <strong className="text-foreground">{rows.length}</strong>{" "}
            projects
          </span>
        </div>
      </div>

      {/* Table */}
      <Card>
  <CardContent className="p-0">
    <div className="border rounded-md max-h-[500px] overflow-auto">
      <Table className="min-w-[1400px]">
        <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[90px]">Project ID</TableHead>
                  <TableHead className="w-[180px]">Project</TableHead>
                  <TableHead className="w-[90px]">Priority</TableHead>
                  <TableHead>Project Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-center">Budget</TableHead>
                  <TableHead className="text-right">Plan Cost</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">
                    Projected Benefits
                  </TableHead>
                  <TableHead>Status</TableHead>
                  {sendForApproval && (
                    <TableHead className="text-center w-[130px]">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
             
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={sendForApproval ? 13 : 12}
                      className="py-12 text-center text-muted-foreground text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 text-muted-foreground/40" />
                        <p>No projects match the current filters.</p>
                        <button
                          onClick={resetFilters}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const isApproved = approvedIds.has(row.id);
                    const isRejected = rejectedIds.has(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        className={
                          isApproved
                            ? "bg-success/10"
                            : isRejected
                              ? "bg-destructive/10 opacity-60"
                              : ""
                        }
                      >
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {row.projectId}
                        </TableCell>
                        <TableCell
                          className="font-medium text-sm text-primary underline cursor-pointer hover:text-primary/80"
                          onClick={() => setViewRow(row)}
                        >
                          {row.project}
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityStyle(row.priority)}>
                            {row.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{row.owner}</TableCell>
                        <TableCell className="text-sm">{row.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.fromDate}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.toDate}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {fmt(row.budget)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {fmt(row.cost)}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-medium ${row.variance < 0 ? "text-red-400" : "text-green-400"}`}
                        >
                          {row.variance < 0
                            ? `-${fmt(Math.abs(row.variance))}`
                            : fmt(row.variance)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {fmt(row.projectedBenefits)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyle(row.status)}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        {sendForApproval && (
                          <TableCell className="text-center">
                            {isApproved ? (
                              <span className="flex items-center justify-center gap-1 text-green-400 text-xs font-medium">
                                <CheckCircle2 className="h-4 w-4" /> Approved
                              </span>
                            ) : isRejected ? (
                              <span className="flex items-center justify-center gap-1 text-red-400 text-xs font-medium">
                                <XCircle className="h-4 w-4" /> Rejected
                              </span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs text-green-400 border-success/30 hover:bg-success/10"
                                  onClick={() => handleApprove(row.id)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs text-red-400 border-destructive/30 hover:bg-destructive/10"
                                  onClick={() => handleReject(row.id)}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}