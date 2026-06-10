import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { useStore } from "@/store/useStore";
import { projectData } from "@/mocks/projects";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Scale,
  CheckCircle2,
  X,
  ChevronDown,
  DollarSign,
  Users,
  Sparkles,
  Info,
  Save,
  SendHorizonal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ScenarioType = "worst" | "baseline" | "best";

interface RoleRow {
  id: string;
  role: string;
  noOfResources: number;
  fromDate: string;
  toDate: string;
  billRate: number;
}

// ─── Options ─────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  "Cloud Architect",
  "Data Engineer",
  "DevSecOps Engineer",
  "Full Stack Developer",
  "Delivery Manager",
  "Data Scientist",
  "Cloud Engineer",
  "Security Engineer",
  "ML Engineer",
  "Business Analyst",
  "Technical Lead",
  "QA Engineer",
  "Project Manager",
  "DevOps Engineer",
  "UI/UX Designer",
  "Mobile Developer",
  "Solution Architect",
  "Scrum Master",
];

const PRIORITY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const PORTFOLIO_OPTIONS = [
  "Strategic Program",
  "Product",
  "Operations",
  "Innovation",
  "Infrastructure",
  "Customer Experience",
];

const STATUS_OPTIONS = [
  "Active",
  "Proposed",
  "Approved",
  "Approved - Backlog",
  "On Hold",
  "Cancelled",
  "Completed",
];

const TYPE_OPTIONS = [
  "Strategic",
  "Compliance",
  "Maintenance",
  "Financial",
  "Improvement",
  "New Product",
];

// ─── Scenario visual config ───────────────────────────────────────────────────

const SCENARIO_META: Record<
  ScenarioType,
  {
    label: string;
    description: string;
    headerBg: string;
    badgeClass: string;
    icon: React.ReactNode;
  }
> = {
  worst: {
    label: "Worst Case",
    description: "High cost, longer timeline",
    headerBg: "bg-destructive/10 border-destructive/30",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
  },
  baseline: {
    label: "Baseline",
    description: "Balanced timeline and cost",
    headerBg: "bg-primary/10 border-primary/30",
    badgeClass: "bg-primary/15 text-primary border-primary/30",
    icon: <Scale className="h-4 w-4 text-primary" />,
  },
  best: {
    label: "Best Case",
    description: "Low cost, shorter timeline",
    headerBg: "bg-green-500/10 border-green-500/30",
    badgeClass:
      "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    icon: (
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    ),
  },
};

const SCENARIO_TYPES: ScenarioType[] = ["worst", "baseline", "best"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRow(): RoleRow {
  return {
    id: crypto.randomUUID(),
    role: "",
    noOfResources: 1,
    fromDate: "",
    toDate: "",
    billRate: 0,
  };
}

function workingDaysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  let count = 0;
  const cur = new Date(from);
  const end = new Date(to);
  cur.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  while (cur < end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function addWorkingDays(from: string, days: number): string {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString().split("T")[0];
}

function calcRowCost(row: RoleRow): number {
  return (
    row.noOfResources *
    workingDaysBetween(row.fromDate, row.toDate) *
    8 *
    row.billRate
  );
}

function calcTotal(rows: RoleRow[]): number {
  return rows.reduce((s, r) => s + calcRowCost(r), 0);
}

function usd(n: number) {
  return (
    "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })
  );
}

// ─── Scenario generation ──────────────────────────────────────────────────────

interface GeneratedScenario {
  rows: RoleRow[];
  totalBudget: number;
  rationale: string[];
}

function generateScenarios(
  baseRows: RoleRow[],
  baseBudget: number,
): Record<ScenarioType, GeneratedScenario> {
  const filled = baseRows.filter(
    (r) => r.role && r.fromDate && r.toDate && r.billRate > 0,
  );

  function buildRows(
    resourceMult: number,
    wdMult: number,
    rateMult: number,
  ): RoleRow[] {
    return filled.map((r) => {
      const baseWd = workingDaysBetween(r.fromDate, r.toDate);
      const newWd = Math.max(1, Math.round(baseWd * wdMult));
      const newRes = Math.max(1, Math.round(r.noOfResources * resourceMult));
      const newRate = Math.round(r.billRate * rateMult);
      const newTo = addWorkingDays(r.fromDate, newWd);
      return {
        ...r,
        id: crypto.randomUUID(),
        noOfResources: newRes,
        toDate: newTo,
        billRate: newRate,
      };
    });
  }

  const worstRows = buildRows(1.3, 1.4, 1.2);
  const baselineRows = buildRows(1.1, 1.15, 1.05);
  const bestRows = buildRows(0.8, 0.75, 0.9);

  const worstCost = calcTotal(worstRows);
  const baselineCost = calcTotal(baselineRows);
  const bestCost = calcTotal(bestRows);

  const worstBudget =
    baseBudget > 0 ? baseBudget : Math.round(worstCost * 1.15);
  const baselineBudget =
    baseBudget > 0 ? baseBudget : Math.round(baselineCost * 1.1);
  const bestBudget = baseBudget > 0 ? baseBudget : Math.round(bestCost * 1.05);

  return {
    worst: {
      rows: worstRows,
      totalBudget: worstBudget,
      rationale: [
        `Team of ${worstRows.reduce((s, r) => s + r.noOfResources, 0)} across ${worstRows.length} role(s) — risk-buffered`,
        `Timeline extended by +40% working days to absorb delays`,
        `Bill rates increased by +20% (overtime/premium resourcing)`,
        ...worstRows.map(
          (r) =>
            `${r.role}: ${r.noOfResources} person${r.noOfResources > 1 ? "s" : ""}, ${workingDaysBetween(r.fromDate, r.toDate)} days @ $${r.billRate}/hr → ${usd(calcRowCost(r))}`,
        ),
      ],
    },
    baseline: {
      rows: baselineRows,
      totalBudget: baselineBudget,
      rationale: [
        `Team of ${baselineRows.reduce((s, r) => s + r.noOfResources, 0)} across ${baselineRows.length} role(s) — realistic estimate`,
        `+10% headcount buffer, +15% timeline, +5% rate for minor contingency`,
        ...baselineRows.map(
          (r) =>
            `${r.role}: ${r.noOfResources} person${r.noOfResources > 1 ? "s" : ""}, ${workingDaysBetween(r.fromDate, r.toDate)} days @ $${r.billRate}/hr → ${usd(calcRowCost(r))}`,
        ),
      ],
    },
    best: {
      rows: bestRows,
      totalBudget: bestBudget,
      rationale: [
        `Lean team of ${bestRows.reduce((s, r) => s + r.noOfResources, 0)} across ${bestRows.length} role(s) — optimistic`,
        `−25% working days (focused delivery), −20% headcount, −10% negotiated rates`,
        ...bestRows.map(
          (r) =>
            `${r.role}: ${r.noOfResources} person${r.noOfResources > 1 ? "s" : ""}, ${workingDaysBetween(r.fromDate, r.toDate)} days @ $${r.billRate}/hr → ${usd(calcRowCost(r))}`,
        ),
      ],
    },
  };
}

// ─── Scenario Detail Modal ────────────────────────────────────────────────────

function ScenarioModal({
  type,
  rows,
  totalBudget,
  rationale,
  onClose,
}: {
  type: ScenarioType;
  rows: RoleRow[];
  totalBudget: number;
  rationale: string[];
  onClose: () => void;
}) {
  const meta = SCENARIO_META[type];
  const cost = calcTotal(rows);
  const diff = cost - totalBudget;
  const pct =
    totalBudget > 0 ? Math.abs((diff / totalBudget) * 100).toFixed(1) : "0.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-t-xl border-b border-border ${meta.headerBg}`}
        >
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-lg border ${meta.badgeClass}`}>
              {meta.icon}
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {meta.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {meta.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
              <p className="text-xl font-bold text-foreground">{usd(cost)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-calculated
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Suggested Budget
              </p>
              <p className="text-xl font-bold text-foreground">
                {usd(totalBudget)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                With buffer
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground mb-1">Variance</p>
              <p
                className={`text-xl font-bold ${diff > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
              >
                {diff > 0 ? "+" : "−"}
                {usd(diff)}
              </p>
              <p
                className={`text-xs mt-0.5 ${diff > 0 ? "text-destructive/70" : "text-green-600/70 dark:text-green-400/70"}`}
              >
                {diff > 0 ? `${pct}% over` : `${pct}% under`} budget
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                How this was calculated
              </span>
            </div>
            <ul className="space-y-1">
              {rationale.map((r, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary inline-block shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {rows.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs uppercase">
                    <th className="px-3 py-2.5 text-left">#</th>
                    <th className="px-3 py-2.5 text-left">Role</th>
                    <th className="px-3 py-2.5 text-center">Resources</th>
                    <th className="px-3 py-2.5 text-center">Days</th>
                    <th className="px-3 py-2.5 text-right">$/Hr</th>
                    <th className="px-3 py-2.5 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {row.role}
                      </td>
                      <td className="px-3 py-2.5 text-center text-foreground">
                        {row.noOfResources}
                      </td>
                      <td className="px-3 py-2.5 text-center text-foreground">
                        {workingDaysBetween(row.fromDate, row.toDate)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-foreground">
                        ${row.billRate}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                        {usd(calcRowCost(row))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground text-sm">
              No roles to show — fill in the table and click Generate Scenarios.
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono">
            Cost = Σ (Resources × Working Days (Mon–Fri) × 8hrs × Bill Rate/hr)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScenarioPlanning() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPortfolioProject } = useStore();
  const isReadOnly = user?.role === "resource";

  // ── Project-level selectors ──
  // ── Project-level selectors ──
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  // ── Resource plan rows ──
  const [rows, setRows] = useState<RoleRow[]>([makeRow(), makeRow()]);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // ── Projected benefits (project-level, numeric input) ──
  const [projectedBenefits, setProjectedBenefits] = useState<string>("");

  // ── Scenario generation ──
  const [generated, setGenerated] = useState<Record<
    ScenarioType,
    GeneratedScenario
  > | null>(null);
  const [openModal, setOpenModal] = useState<ScenarioType | null>(null);
  const [rowErrors, setRowErrors] = useState<Set<string>>(new Set());

  const liveCost = useMemo(() => calcTotal(rows), [rows]);
  const liveDiff = liveCost - totalBudget;
  const livePct =
    totalBudget > 0
      ? Math.abs((liveDiff / totalBudget) * 100).toFixed(1)
      : "0.0";

  function updateRow(id: string, patch: Partial<RoleRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const canGenerate = rows.some(
    (r) => r.role && r.fromDate && r.toDate && r.billRate > 0,
  );

  function handleGenerate() {
    setGenerated(generateScenarios(rows, totalBudget));
  }

  function handleSave(sendForApproval: boolean) {
    // Validate: every row must have a role selected
    const missingRole = new Set(rows.filter((r) => !r.role).map((r) => r.id));
    if (missingRole.size > 0) {
      setRowErrors(missingRole);
      return;
    }
    setRowErrors(new Set());
    // Find the selected project's name from projectData
    const projectMeta = projectData.find((p) => p.id === selectedProject);
    const projectName =
      projectMeta?.project ?? selectedProject ?? "Unnamed Project";

    // Derive earliest start / latest end from resource rows
    const filledRows = rows.filter((r) => r.fromDate && r.toDate);
    const fromDate = filledRows.length
      ? filledRows.reduce(
          (min, r) => (r.fromDate < min ? r.fromDate : min),
          filledRows[0].fromDate,
        )
      : new Date().toISOString().split("T")[0];
    const toDate = filledRows.length
      ? filledRows.reduce(
          (max, r) => (r.toDate > max ? r.toDate : max),
          filledRows[0].toDate,
        )
      : new Date().toISOString().split("T")[0];

    // Map priority select value → PortfolioRow priority label
    const priorityMap: Record<string, "Immediate" | "High" | "Medium" | "Low"> =
      {
        immediate: "Immediate",
        high: "High",
        medium: "Medium",
        low: "Low",
      };

    addPortfolioProject({
      project: projectName,
      portfolio: selectedPortfolio,
      priority: priorityMap[selectedPriority] ?? "Medium",
      owner: user?.username ?? "—",
      type: selectedType || "Strategic",
      status: sendForApproval
        ? "Pending Approval"
        : (selectedStatus as any) || "Proposed",
      fromDate: fromDate.split("-").reverse().join("-"),
      toDate: toDate.split("-").reverse().join("-"),
      budget: totalBudget,
      cost: liveCost,
      variance: totalBudget - liveCost,
      projectedBenefits: parseFloat(projectedBenefits) || 0,
      resourcePlan: rows
        .filter((r) => r.role)
        .map((r) => ({
          role: r.role,
          noOfResources: r.noOfResources,
          fromDate: r.fromDate,
          toDate: r.toDate,
          billRate: r.billRate,
        })),
    });

    navigate("/project-portfolio", {
      state: { sendForApproval, projectId: selectedProject },
    });
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Scenario Planning
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select a project, configure your resource plan, then generate Worst,
            Baseline, and Best Case scenarios automatically.
          </p>
        </div>
      </div>

      {/* ── Project-level selectors + Projected Benefits ── */}
      {/* ── Project-level selectors + Projected Benefits ── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-4">
          Project Details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Portfolio */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Portfolio
            </label>
            <div className="relative">
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-lg text-foreground pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Portfolio</option>
                {PORTFOLIO_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Project
            </label>
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-lg text-foreground pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Project</option>
                {projectData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Priority
            </label>
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-lg text-foreground pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Priority</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Status
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-lg text-foreground pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Type
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-lg text-foreground pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          {/* Projected Benefits */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Projected Benefits
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                inputMode="numeric"
                value={projectedBenefits}
                onChange={(e) =>
                  setProjectedBenefits(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0"
                className="w-full bg-background border border-input rounded-lg text-foreground pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Owner badge */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Owner</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold text-xs">
            {user?.username ?? "—"}
          </span>
        </div>
      </div>

      {/* ── Resource Plan Table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-muted/50 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Resource Plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in roles, headcount, dates, and bill rates. Then click Generate
            Scenarios.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left w-8">Sr</th>
                <th className="px-4 py-3 text-left min-w-[160px]">Role</th>
                <th className="px-4 py-3 text-center w-36">No. of Resources</th>
                <th className="px-4 py-3 text-left min-w-[140px]">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left min-w-[140px]">End Date</th>
                <th className="px-4 py-3 text-left min-w-[130px]">
                  Bill Rate ($/Hr)
                </th>
                <th className="px-4 py-3 text-right min-w-[130px]">
                  Cost / Role
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, idx) => {
                const cost = calcRowCost(row);
                const days = workingDaysBetween(row.fromDate, row.toDate);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {idx + 1}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={row.role}
                          onChange={(e) => {
                            updateRow(row.id, { role: e.target.value });
                            if (e.target.value) {
                              setRowErrors((prev) => {
                                const next = new Set(prev);
                                next.delete(row.id);
                                return next;
                              });
                            }
                          }}
                          className={`w-full appearance-none bg-background border rounded-lg text-foreground pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring text-sm ${
                            rowErrors.has(row.id)
                              ? "border-red-500 focus:ring-red-500"
                              : "border-input"
                          }`}
                        >
                          <option value="">Select Role</option>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                      </div>
                      {rowErrors.has(row.id) && (
                        <p className="text-xs text-red-500 mt-1">
                          Role is required
                        </p>
                      )}
                    </td>

                    {/* Counter */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateRow(row.id, {
                              noOfResources: Math.max(1, row.noOfResources - 1),
                            })
                          }
                          className="w-7 h-7 rounded-md border border-input bg-background hover:bg-muted text-foreground font-bold transition-colors flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold text-foreground">
                          {row.noOfResources}
                        </span>
                        <button
                          onClick={() =>
                            updateRow(row.id, {
                              noOfResources: row.noOfResources + 1,
                            })
                          }
                          className="w-7 h-7 rounded-md border border-input bg-background hover:bg-muted text-foreground font-bold transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* From Date */}
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={row.fromDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          updateRow(row.id, {
                            fromDate: e.target.value,
                            ...(row.toDate && e.target.value > row.toDate
                              ? { toDate: "" }
                              : {}),
                          })
                        }
                        className="w-full bg-background border border-input rounded-lg text-foreground px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>

                    {/* To Date */}
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={row.toDate}
                        min={
                          row.fromDate || new Date().toISOString().split("T")[0]
                        }
                        disabled={!row.fromDate}
                        onChange={(e) =>
                          updateRow(row.id, { toDate: e.target.value })
                        }
                        title={
                          !row.fromDate ? "Select a From Date first" : undefined
                        }
                        className="w-full bg-background border border-input rounded-lg text-foreground px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                      />
                    </td>

                    {/* Bill Rate */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          min={0}
                          value={row.billRate || ""}
                          onChange={(e) =>
                            updateRow(row.id, {
                              billRate: Number(e.target.value),
                            })
                          }
                          placeholder="0"
                          disabled={isReadOnly}
                          title={
                            isReadOnly
                              ? "Bill rate is restricted to your role"
                              : undefined
                          }
                          className="w-full bg-background border border-input rounded-lg text-foreground pl-7 pr-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                        />
                      </div>
                    </td>

                    {/* Live row cost */}
                    <td className="px-4 py-3 text-right">
                      {cost > 0 ? (
                        <span className="font-semibold text-foreground">
                          {usd(cost)}
                        </span>
                      ) : days > 0 && row.billRate === 0 ? (
                        <span className="text-warning text-xs">
                          Add bill rate
                        </span>
                      ) : row.fromDate && !row.toDate ? (
                        <span className="text-muted-foreground text-xs">
                          Add end date
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-2 py-3">
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => setRows((prev) => [...prev, makeRow()])}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Row
          </button>
        </div>
      </div>

      {/* ── Totals + Budget + Generate ── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          {/* Live Total Cost */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Total Cost
            </p>
            <p className="text-2xl font-bold text-foreground">
              {usd(liveCost)}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Σ (Resources × Working Days × 8 × $/Hr)
            </p>
          </div>

          {/* Budget input */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Total Budget
            </p>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                min={0}
                value={totalBudget || ""}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                placeholder="Enter budget"
                disabled={isReadOnly}
                title={
                  isReadOnly ? "Budget is restricted to your role" : undefined
                }
                className="w-full bg-background border border-input rounded-lg text-foreground pl-9 pr-3 py-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>
            {totalBudget > 0 &&
              (() => {
                const pctUsed = liveCost / totalBudget;
                const barPct = Math.min(pctUsed * 100, 100);
                const isOver = pctUsed > 1;
                const isAmber = !isOver && pctUsed >= 0.9;
                const barColor = isOver
                  ? "#ef4444"
                  : isAmber
                    ? "#f59e0b"
                    : "#22c55e";
                const label = isOver
                  ? `${((pctUsed - 1) * 100).toFixed(1)}% over`
                  : `${(pctUsed * 100).toFixed(1)}% used`;
                return (
                  <div className="pt-1 space-y-1">
                    <div
                      className="h-2 w-full rounded-full overflow-hidden"
                      style={{ background: "hsl(var(--muted))" }}
                    >
                      <div
                        style={{
                          width: `${barPct}%`,
                          background: barColor,
                          height: "100%",
                          borderRadius: "9999px",
                          transition: "width 0.3s ease, background 0.3s ease",
                        }}
                      />
                    </div>
                    <p
                      className="text-[11px] font-medium"
                      style={{ color: barColor }}
                    >
                      {label}
                    </p>
                  </div>
                );
              })()}
            {isReadOnly && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                🔒 Budget editing is restricted
              </p>
            )}
          </div>

          {/* Variance */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Variance
            </p>
            <p
              className={`text-2xl font-bold ${liveDiff > 0 ? "text-destructive" : liveDiff < 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
            >
              {liveDiff !== 0 ? (liveDiff > 0 ? "+" : "−") : ""}
              {usd(liveDiff)}
            </p>
            <p
              className={`text-xs ${liveDiff > 0 ? "text-destructive/70" : liveDiff < 0 ? "text-green-600/70 dark:text-green-400/70" : "text-muted-foreground"}`}
            >
              {liveDiff > 0
                ? `${livePct}% over budget`
                : liveDiff < 0
                  ? `${livePct}% under budget`
                  : "Enter a budget to compare"}
            </p>
          </div>

          {/* Generate button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Generate Scenarios
            </button>
            {!canGenerate && (
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                Fill at least one complete row first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Generated Scenario Cards ── */}
      {generated ? (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Generated Scenarios
            </p>
            <span className="text-xs text-muted-foreground">
              — click any card to see the full breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIO_TYPES.map((type) => {
              const meta = SCENARIO_META[type];
              const gen = generated[type];
              const cost = calcTotal(gen.rows);
              const diff = cost - gen.totalBudget;
              const pct =
                gen.totalBudget > 0
                  ? Math.abs((diff / gen.totalBudget) * 100).toFixed(1)
                  : "0.0";

              return (
                <button
                  key={type}
                  onClick={() => setOpenModal(type)}
                  className="text-left rounded-xl border border-border bg-card p-5 hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`p-1.5 rounded-md border ${meta.badgeClass}`}
                    >
                      {meta.icon}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {meta.description}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-semibold text-foreground">
                        {usd(cost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Suggested Budget
                      </span>
                      <span className="font-semibold text-foreground">
                        {usd(gen.totalBudget)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-border">
                      <span className="text-muted-foreground">Variance</span>
                      <span
                        className={`font-bold ${diff > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
                      >
                        {diff > 0 ? "+" : "−"}
                        {usd(diff)} ({pct}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {gen.rationale.slice(0, 3).map((r, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    ↗ Click for full breakdown
                  </p>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            No scenarios generated yet
          </p>
          <p className="text-xs text-muted-foreground">
            Fill in your resource plan above, then click{" "}
            <strong>Generate Scenarios</strong> to see Worst, Baseline, and Best
            Case automatically.
          </p>
        </div>
      )}

      {/* ── Save Actions — bottom right ── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <button
          onClick={() => handleSave(false)}
          className="flex items-center gap-2 rounded-lg border border-input bg-background hover:bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors"
        >
          <Save className="h-4 w-4" />
          Save
        </button>

        <button
          onClick={() => handleSave(true)}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors shadow-sm"
        >
          <SendHorizonal className="h-4 w-4" />
          Save &amp; Send for Approval
        </button>
      </div>

      {/* ── Modal ── */}
      {openModal && generated && (
        <ScenarioModal
          type={openModal}
          rows={generated[openModal].rows}
          totalBudget={generated[openModal].totalBudget}
          rationale={generated[openModal].rationale}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
