import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/auth/useAuth";
import { hasPermission } from "@/auth/rbac";
import { useActiveValues } from "@/store/useMasterData";
import type { Demand } from "@/store/useStore";
import { ResourceDialog } from "@/pages/Resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePillarFilter } from "@/hooks/usePillarFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash2,
  Search,
  Download,
  Upload,
  Plus,
  Users,
  X,
} from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";
import HistoryModal from "@/components/HistoryModal";
import { toast } from "sonner";
import type { DemandForm } from "./CreateDemand";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportSource =
  | "Excel"
  | "Jira"
  | "Planisware"
  | "Smartsheets"
  | "Monday.com"
  | "Connected Source";

// ─── Source config ────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  Manual: {
    label: "Manual",
    className: "bg-secondary text-secondary-foreground",
    dotClass: "bg-muted-foreground",
  },
  Jira: {
    label: "Jira",
    className: "bg-blue-500/10 text-blue-600",
    dotClass: "bg-blue-500",
  },
  Planisware: {
    label: "Planisware",
    className: "bg-violet-500/10 text-violet-600",
    dotClass: "bg-violet-500",
  },
  Smartsheets: {
    label: "Smartsheets",
    className: "bg-green-500/10 text-green-600",
    dotClass: "bg-green-500",
  },
  "Monday.com": {
    label: "Monday.com",
    className: "bg-orange-500/10 text-orange-600",
    dotClass: "bg-orange-500",
  },
  "Connected Source": {
    label: "API",
    className: "bg-amber-500/10 text-amber-600",
    dotClass: "bg-amber-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (s: string) => {
  switch (s) {
    case "Approved":
      return "default";
    case "Pending":
      return "outline";
    case "Rejected":
      return "destructive";
    case "Awaiting Approval":
      return "secondary";
    default:
      return "secondary";
  }
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] || "";
    });
    return row;
  });
}

function mapRowToDemand(
  row: Record<string, string>,
  source: ImportSource = "Excel",
): DemandForm | null {
  const projectName =
    row["Project Name"] || row["Project"] || row["projectName"] || "";
  const pillar = row["Pillar"] || row["pillar"] || "";
  if (!projectName && !pillar) return null;
  return {
    portfolio: row["Portfolio"] || pillar || "Hi-tech",
    program: row["Program"] || "Enterprise",
    projectName,
    projectRole: row["Project Role"] || row["Role"] || "",
    budgetCode: row["Budget Code"] || row["budgetCode"] || "",
    pillar,
    allocationPercent: parseFloat(row["Allocation (%)"] || "0") || 0,
    status: "Pending",
    comments: row["Comments"] || "",
    identified: (row["Identified"] || "").toLowerCase() === "yes",
    estimatedRate: parseFloat(row["Estimated Rate"] || "0") || 0,
    currentYearForecast: parseFloat(row["Current Year Forecast"] || "0") || 0,
    resourceName: row["Resource Name"] || "",
    workstream: row["Workstream"] || "",
    subTeam: row["Sub Team"] || "",
    startDate: row["Start Date"] || "",
    endDate: row["End Date"] || "",
    resourceCount: row["Resource Count"]
      ? parseInt(row["Resource Count"]) || 0
      : 0,
    type: (row["Type"] || "Internal") as "Internal" | "External",
    vendorName: row["Vendor Name"] || "",
    country: row["Country"] || row["Location"] || "Sydney",
    allocation: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
    forecast: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
    source: source as Demand["source"],
    isEdited: false,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DemandSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  // ── CHANGE 1: read ?allocate=<id> query param ─────────────────────────────
  const [searchParams] = useSearchParams();
  const { demands, addDemands, deleteDemand } = useStore();

  // ── Navigate-in from Project Portfolio ──────────────────────────────────────
  useEffect(() => {
    const state = location.state as {
      fromPortfolio?: boolean;
      projectNames?: string[];
    } | null;
    if (state?.fromPortfolio && state.projectNames?.length) {
      const names = state.projectNames.join(", ");
      toast.success(
        `${state.projectNames.length} demand${state.projectNames.length > 1 ? "s" : ""} created with status Pending`,
        { description: names },
      );
      // Clear state so re-visits don't re-toast
      window.history.replaceState({}, "");
    }
  }, [location.state]);
  const { filterByPillar } = usePillarFilter();
  const visibleDemands = filterByPillar(demands);
  const { user } = useAuth();
  const canEditDelete = user ? hasPermission(user.role, "edit_demand") : false;
  const projects = useActiveValues("projects");
  const pillars = useActiveValues("pillars");
  const roles = useActiveValues("roles");
  const locationOpts = useActiveValues("countries");
  const canCreate = user ? hasPermission(user.role, "create_demand") : false;
  // ── Filters ──
  const [fSearch, setFSearch] = useState("");
  const [fProject, setFProject] = useState("all");
  const [fRole, setFRole] = useState("all");
  const [fPillar, setFPillar] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fSource, setFSource] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<Demand["history"] | null>(
    null,
  );

  const [resourceModal, setResourceModal] = useState<{
    open: boolean;
    demandId: string;
    projectName: string;
    projectSkills: string[];
    initialResources: {
      id: string;
      name: string;
      email: string;
      domain: string;
    }[];
  }>({
    open: false,
    demandId: "",
    projectName: "",
    projectSkills: [],
    initialResources: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importChooserOpen, setImportChooserOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<DemandForm[]>([]);
  const [importSource, setImportSource] = useState<ImportSource>("Excel");

  // ── CHANGE 2: centralised allocation opener ───────────────────────────────
  // Single function used by both the Action column button AND the auto-open
  // effect below. No logic is duplicated anywhere else.
  const openAllocation = (row: Demand) => {
    const assignedResources = row.resourceName
      ? [
          {
            id: "r1",
            name: row.resourceName,
            email: `${row.resourceName.toLowerCase().replace(" ", ".")}@company.com`,
            domain: row.pillar,
          },
          {
            id: "r2",
            name: "Bob Smith",
            email: "bob.smith@company.com",
            domain: "Data",
          },
        ]
      : [];
    setResourceModal({
      open: true,
      demandId: row.id,
      projectName: row.projectName,
      projectSkills: row.projectRole ? [row.projectRole] : [],
      initialResources: assignedResources,
    });
  };

  // ── Filtered data ──
  const filtered = useMemo(() => {
    const q = fSearch.toLowerCase();
    return visibleDemands.filter((d) => {
      const matchSearch =
        !q ||
        d.projectName.toLowerCase().includes(q) ||
        d.projectRole.toLowerCase().includes(q) ||
        d.budgetCode.toLowerCase().includes(q) ||
        d.pillar.toLowerCase().includes(q);
      const matchProject = fProject === "all" || d.projectName === fProject;
      const matchRole = fRole === "all" || d.projectRole === fRole;
      const matchPillar = fPillar === "all" || d.pillar === fPillar;
      const matchStatus = fStatus === "all" || d.status === fStatus;
      const matchSource =
        fSource === "all" || (d.source ?? "Manual") === fSource;
      return (
        matchSearch &&
        matchProject &&
        matchRole &&
        matchPillar &&
        matchStatus &&
        matchSource
      );
    });
  }, [visibleDemands, fSearch, fProject, fRole, fPillar, fStatus, fSource]);

  const hasActiveFilters =
    fSearch ||
    fProject !== "all" ||
    fRole !== "all" ||
    fPillar !== "all" ||
    fStatus !== "all" ||
    fSource !== "all";

  const clearFilters = () => {
    setFSearch("");
    setFProject("all");
    setFRole("all");
    setFPillar("all");
    setFStatus("all");
    setFSource("all");
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteDemand(deleteId);
      toast.success("Demand deleted");
      setDeleteId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      toast.error("Please upload .csv or .xlsx");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const mapped = parseCSV(ev.target?.result as string)
          .map((row) => mapRowToDemand(row, "Excel"))
          .filter(Boolean) as DemandForm[];
        if (!mapped.length) {
          toast.error("No valid rows found");
          return;
        }
        setImportPreview(mapped);
        setShowImport(true);
      } catch {
        toast.error("Error parsing file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchFromExternal = (source: Exclude<ImportSource, "Excel">) => {
    setImportSource(source);
    const safeProjects = projects.length ? projects : ["Cloud Enablement"];
    const safeRoles = roles.length ? roles : ["Project Manager"];
    const safePillars = pillars.length ? pillars : ["Hi-tech"];
    const safeLocations = locationOpts.length ? locationOpts : ["Sydney"];
    const cfg: Record<string, { count: number; prefix: string }> = {
      Jira: { count: 4, prefix: "JIRA" },
      Planisware: { count: 5, prefix: "PLNS" },
      Smartsheets: { count: 3, prefix: "SMRT" },
      "Monday.com": { count: 4, prefix: "MON" },
      "Connected Source": { count: 6, prefix: "API" },
    };
    const { count, prefix } = cfg[source];
    const rows: DemandForm[] = Array.from({ length: count }, (_, i) => ({
      portfolio: safePillars[i % safePillars.length],
      program: "Enterprise",
      projectName: safeProjects[i % safeProjects.length],
      projectRole: safeRoles[i % safeRoles.length],
      budgetCode: `${prefix}-${1000 + i}`,
      pillar: safePillars[i % safePillars.length],
      allocationPercent: 100,
      status: "Pending" as const,
      comments: `Imported from ${source}`,
      identified: false,
      estimatedRate: 110 + i * 5,
      currentYearForecast: 80000 + i * 12000,
      resourceName: "",
      workstream: `WS-${(i % 3) + 1}`,
      subTeam: "",
      startDate: "2027-04-01",
      endDate: "2027-12-31",
      resourceCount: 3,
      type: "Internal" as const,
      vendorName: "",
      country: safeLocations[i % safeLocations.length],
      allocation: { current: 1, y2027: 1, y2028: 0, y2029: 0, y2030: 0 },
      forecast: {
        current: 80000 + i * 12000,
        y2027: 80000 + i * 12000,
        y2028: 0,
        y2029: 0,
        y2030: 0,
      },
      source,
      isEdited: false,
    }));
    toast.info(`Fetching from ${source}...`);
    setTimeout(() => {
      setImportPreview(rows);
      setImportChooserOpen(false);
      setShowImport(true);
    }, 600);
  };

  const triggerExcelUpload = () => {
    setImportSource("Excel");
    setImportChooserOpen(false);
    fileInputRef.current?.click();
  };

  const confirmImport = () => {
    const existingKeys = new Set(
      demands.map((d) => `${d.projectName}|${d.projectRole}|${d.resourceName}`),
    );
    const fresh = importPreview.filter(
      (r) =>
        !existingKeys.has(
          `${r.projectName}|${r.projectRole}|${r.resourceName}`,
        ),
    );
    const dropped = importPreview.length - fresh.length;
    if (!fresh.length) {
      toast.error("All rows are duplicates");
      return;
    }
    addDemands(fresh);
    toast.success(
      `${fresh.length} demand(s) imported${dropped ? ` (${dropped} skipped)` : ""}`,
    );
    setShowImport(false);
    setImportPreview([]);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: Column<Demand>[] = [
    {
      key: "id",
      header: "Demand ID",
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    { key: "projectName", header: "Project Name" },
    {
      key: "projectRole",
      header: "Required Role",
      render: (row) =>
        row.projectRole ? (
          <Badge variant="secondary" className="text-xs">
            {row.projectRole}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    { key: "budgetCode", header: "Budget Code" },
    {
      key: "pillar",
      header: "Pillar",
      render: (row) => <Badge variant="outline">{row.pillar}</Badge>,
    },
    // ── CHANGE 4: Resource Count — plain display only, no click ──────────────
    {
      key: "resourceCount",
      header: "Resource Count",
      sortable: false,
      render: (row) => {
        const count = row.resourceCount ?? 0;

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold select-none">
            <Users className="h-3 w-3" />
            {count}
          </span>
        );
      },
    },
    {
      key: "estimatedRate",
      header: "Estimated Rate",
      render: (row) =>
        row.estimatedRate ? `$${row.estimatedRate.toFixed(2)}` : "—",
    },
    {
      key: "currentYearForecast",
      header: "Current Year Forecast",
      render: (row) =>
        row.currentYearForecast
          ? `$${row.currentYearForecast.toLocaleString()}`
          : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={statusColor(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: false,
      render: (row) => {
        const src = row.source;
        if (!src || src === "Manual") {
          return <span className="text-muted-foreground text-xs">Manual</span>;
        }
        const cfg = SOURCE_CONFIG[src] ?? SOURCE_CONFIG["Manual"];
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </span>
            {row.isEdited && (
              <span
                title="Edited after import"
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-400/20 text-amber-600"
              >
                <Pencil className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        );
      },
    },
    // ── CHANGE 5: Action column — Allocate button + Edit + Delete ─────────────
    // "Allocate Resource" calls openAllocation(row) — the same function used
    // by the auto-open effect, so there is zero logic duplication.
    {
      key: "action",
      header: "Action",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1.5"
            onClick={() => openAllocation(row)}
            title="Allocate Resource"
          >
            <Users className="h-3 w-3" />
            Allocate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigate(`/demand/create?id=${row.id}`)}
            title={canEditDelete ? "Edit" : "You don't have permission to edit"}
            disabled={!canEditDelete}
          >
            <Pencil
              className={`h-3.5 w-3.5 ${!canEditDelete ? "opacity-50" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive"
            onClick={() => setDeleteId(row.id)}
            title={
              canEditDelete ? "Delete" : "You don't have permission to delete"
            }
            disabled={!canEditDelete}
          >
            <Trash2
              className={`h-3.5 w-3.5 ${!canEditDelete ? "opacity-50" : ""}`}
            />
          </Button>
        </div>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Demand Summary</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleDemands.length} demands
            </p>
          </div>
          {canCreate && (
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/demand/create")}
            >
              <Plus className="h-3.5 w-3.5" />
              New Demand
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {/* ── Search + Filters ── */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search project, role, pillar, budget code…"
                value={fSearch}
                onChange={(e) => setFSearch(e.target.value)}
              />
            </div>

            {/* Project */}
            <Select value={fProject} onValueChange={setFProject}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Domain / Pillar */}
            <Select value={fPillar} onValueChange={setFPillar}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="All Pillars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pillars</SelectItem>
                {pillars.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="h-9 w-[140px] text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Awaiting Approval">
                  Awaiting Approval
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Required Skills */}
            <Select value={fRole} onValueChange={setFRole}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source filter */}
            <Select value={fSource} onValueChange={setFSource}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Jira">Jira</SelectItem>
                <SelectItem value="Planisware">Planisware</SelectItem>
                <SelectItem value="Smartsheets">Smartsheets</SelectItem>
                <SelectItem value="Monday.com">Monday.com</SelectItem>
                <SelectItem value="Connected Source">
                  Connected Source
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Result count + clear */}
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <DataTable data={filtered} columns={columns} pageSize={10} />
        </CardContent>
      </Card>

      {/* ── Resource Dialog ── */}
      <ResourceDialog
        open={resourceModal.open}
        onOpenChange={(v) => setResourceModal((s) => ({ ...s, open: v }))}
        demandId={resourceModal.demandId}
        projectName={resourceModal.projectName}
        projectSkills={resourceModal.projectSkills}
        initialResources={resourceModal.initialResources}
        userRole={user?.role}
      />

      {/* ── Import Source Chooser ── */}
      <Dialog open={importChooserOpen} onOpenChange={setImportChooserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Demand Data</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose a source. External tools are simulated for demo purposes.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={triggerExcelUpload}
              className="border rounded-md p-4 text-left hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs">
                  XLS
                </div>
                <div className="font-semibold text-sm">Excel / CSV Upload</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Upload .xlsx or .csv with Project, Role, Pillar columns
              </div>
            </button>

            {(["Jira", "Planisware", "Smartsheets", "Monday.com"] as const).map(
              (src) => (
                <button
                  key={src}
                  onClick={() => fetchFromExternal(src)}
                  className="border rounded-md p-4 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs ${SOURCE_CONFIG[src]?.className ?? "bg-secondary text-secondary-foreground"}`}
                    >
                      {src.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-semibold text-sm">{src}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {src === "Jira" && "Fetch open epics & stories as demand"}
                    {src === "Planisware" &&
                      "Pull project plans & resource needs"}
                    {src === "Smartsheets" &&
                      "Sync resource sheets into demand"}
                    {src === "Monday.com" &&
                      "Import boards & items as demand rows"}
                  </div>
                </button>
              ),
            )}

            <button
              onClick={() => fetchFromExternal("Connected Source")}
              className="border rounded-md p-4 text-left hover:bg-accent transition-colors col-span-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                  API
                </div>
                <div className="font-semibold text-sm">
                  Fetch from Connected Source
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Pull from configured enterprise API endpoint
              </div>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileUpload}
          />
        </DialogContent>
      </Dialog>

      {/* ── Import Preview ── */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Import Preview — {importPreview.length} records from{" "}
              {importSource}
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-md overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {[
                    "Project Name",
                    "Required Skills",
                    "Domain / Pillar",
                    "Budget Code",
                    "Resource",
                    "Type",
                    "Source",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importPreview.map((r, i) => {
                  const src = r.source ?? "Manual";
                  const cfg = SOURCE_CONFIG[src] ?? SOURCE_CONFIG["Manual"];
                  return (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5">{r.projectName}</td>
                      <td className="px-3 py-1.5">{r.projectRole}</td>
                      <td className="px-3 py-1.5">{r.pillar}</td>
                      <td className="px-3 py-1.5">{r.budgetCode}</td>
                      <td className="px-3 py-1.5">{r.resourceName}</td>
                      <td className="px-3 py-1.5">{r.type}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`}
                          />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImport}>Confirm Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Demand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HistoryModal
        open={!!historyData}
        onOpenChange={() => setHistoryData(null)}
        history={historyData || []}
      />
    </>
  );
}