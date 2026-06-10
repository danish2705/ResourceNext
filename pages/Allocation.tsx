import { useState, useMemo, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { Search, Layers } from "lucide-react";

import DataTable, { type Column } from "@/components/DataTable";

import { allocations, type AllocationRow } from "@/mocks/allocation";

// ─── helpers ────────────────────────────────────────────────────────────────

/** All rows that share the same resourceId */
function getAllProjectsForResource(resourceId: string): AllocationRow[] {
  return allocations.filter((r) => r.resourceId === resourceId);
}

/** Whether a resource is allocated to 2 or more projects */
function isMultiProject(resourceId: string): boolean {
  return getAllProjectsForResource(resourceId).length >= 2;
}

/** Realistic utilization derived from total allocation % across all projects */
function getUtilizationStatus(resourceId: string): "low" | "medium" | "high" {
  const rows = getAllProjectsForResource(resourceId);
  const total = rows.reduce((sum, r) => sum + r.allocationPercentage, 0);
  if (total >= 90) return "high";
  if (total >= 60) return "medium";
  return "low";
}

// ─── Alloc % cell ────────────────────────────────────────────────────────────

interface AllocCellProps {
  row: AllocationRow;
  onClick: (row: AllocationRow) => void;
}

/** Color based on TOTAL allocation % — used in table and dialog */
function getAllocColor(totalPct: number): string {
  if (totalPct >= 100) return "text-red-400"; // 100% or over → red
  if (totalPct >= 80) return "text-green-400"; // 80–99% → green
  if (totalPct >= 60) return "text-yellow-400"; // 60–79% → yellow
  return "text-cyan-400"; // below 60% → cyan
}

function AllocCell({ row, onClick }: AllocCellProps) {
  const multi = isMultiProject(row.resourceId);

  // For multi-project people color is based on their TOTAL across all projects
  // For single-project people it's just their own row %
  const totalPct = multi
    ? getAllProjectsForResource(row.resourceId).reduce(
        (sum, r) => sum + r.allocationPercentage,
        0,
      )
    : row.allocationPercentage;

  const color = getAllocColor(totalPct);

  if (!multi) {
    return (
      <div className="flex justify-center items-center w-full">
        <span className={`font-semibold ${color}`}>
          {row.allocationPercentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      <button
        onClick={() => onClick(row)}
        className={`font-semibold ${color} underline decoration-dotted underline-offset-2 cursor-pointer hover:opacity-75 transition-opacity flex items-center gap-1`}
        title="Click to see all project allocations"
      >
        {totalPct}%
        <Layers className="h-3 w-3 opacity-60" />
      </button>
    </div>
  );
}

// ─── Project cell ─────────────────────────────────────────────────────────────

interface ProjectCellProps {
  row: AllocationRow;
  onShowAll: (row: AllocationRow) => void;
}

function ProjectCell({ row, onShowAll }: ProjectCellProps) {
  const allRows = getAllProjectsForResource(row.resourceId);
  const extraCount = allRows.length - 1;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-muted-foreground">{row.project}</span>
      {extraCount > 0 && (
        <button
          onClick={() => onShowAll(row)}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer whitespace-nowrap"
          title={`Also on ${extraCount} more project${extraCount > 1 ? "s" : ""}`}
        >
          +{extraCount}
        </button>
      )}
    </div>
  );
}

// ─── Allocation Dialog ────────────────────────────────────────────────────────

interface AllocationDialogProps {
  row: AllocationRow | null;
  open: boolean;
  onClose: () => void;
}

function AllocationDialog({ row, open, onClose }: AllocationDialogProps) {
  if (!row) return null;

  const allRows = getAllProjectsForResource(row.resourceId);
  const totalAlloc = allRows.reduce((s, r) => s + r.allocationPercentage, 0);
  const utilizationStatus = getUtilizationStatus(row.resourceId);

  const utilizationColor =
    utilizationStatus === "high"
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : utilizationStatus === "medium"
        ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  const utilizationLabel =
    utilizationStatus === "high"
      ? "High — near or over capacity"
      : utilizationStatus === "medium"
        ? "Medium — moderately loaded"
        : "Low — has availability";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-indigo-400" />
            {row.resource} — Project Allocations
          </DialogTitle>
          <p className="text-xs text-muted-foreground pt-0.5">
            {row.role} · {row.resourceId}
          </p>
        </DialogHeader>

        {/* Project breakdown */}
        <div className="space-y-2 mt-1">
          {allRows.map((r) => {
            const barColor =
              r.allocationPercentage >= 100
                ? "bg-red-500"
                : r.allocationPercentage >= 80
                  ? "bg-green-500"
                  : r.allocationPercentage >= 60
                    ? "bg-yellow-500"
                    : "bg-cyan-500";

            const typeColor =
              r.allocationType === "Project"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-purple-500/20 text-purple-400 border border-purple-500/30";

            return (
              <div
                key={r.projectId}
                className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {r.project}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.projectId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor}`}
                    >
                      {r.allocationType}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {r.allocationPercentage}%
                    </span>
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${r.allocationPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.hoursPerWeek} hrs/wk</span>
                  <span>
                    {r.startDate} → {r.endDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Total allocation: </span>
            <span
              className={`font-semibold ${
                totalAlloc > 100
                  ? "text-red-400"
                  : totalAlloc === 100
                    ? "text-blue-400"
                    : "text-emerald-400"
              }`}
            >
              {totalAlloc}%
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${utilizationColor}`}
          >
            {utilizationLabel}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResourceAllocation() {
  const [search, setSearch] = useState("");
  const { filterByPillar } = usePillarFilter();
  const visibleAllocations = filterByPillar(allocations);

  // All project IDs for the dropdown (from full list, before dedup)
  const allProjects = useMemo(
    () => Array.from(new Set(visibleAllocations.map((r) => r.projectId))),
    [visibleAllocations],
  );

  const [allocationTypeFilter, setAllocationTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [utilizationFilter, setUtilizationFilter] = useState("all");

  // Dialog state
  const [dialogRow, setDialogRow] = useState<AllocationRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Stable click handler — won't cause columns to re-create on every render
  const handleAllocClick = useCallback((row: AllocationRow) => {
    setDialogRow(row);
    setDialogOpen(true);
  }, []);

  // Deduplicate: one row per resource (guards against same person having
  // multiple rows — e.g. Kiran Patel on PID-501 and PID-505)
  const deduplicatedAllocations = useMemo(() => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    return visibleAllocations.filter((r) => {
      if (seenIds.has(r.resourceId) || seenNames.has(r.resource)) return false;
      seenIds.add(r.resourceId);
      seenNames.add(r.resource);
      return true;
    });
  }, [visibleAllocations]);

  // Columns — stable reference, only recreated if handleAllocClick changes
  const columns = useMemo<Column<AllocationRow>[]>(
    () => [
      {
        key: "projectId",
        header: "Project ID",
        render: (r) => (
          <span className="text-xs font-medium">{r.projectId}</span>
        ),
      },
      {
        key: "project",
        header: "Project",
        render: (r) => <ProjectCell row={r} onShowAll={handleAllocClick} />,
      },
      {
        key: "resourceId",
        header: "Resource ID",
        render: (r) => (
          <span className="text-xs font-medium">{r.resourceId}</span>
        ),
      },
      {
        key: "resource",
        header: "Resource",
        render: (r) => (
          <span className="font-semibold text-foreground">{r.resource}</span>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (r) => (
          <span className="text-sm text-muted-foreground">{r.role}</span>
        ),
      },
      {
        key: "allocationType",
        header: "Allocation Type",
        render: (r) => {
          const color =
            r.allocationType === "Project"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-purple-500/20 text-purple-400 border border-purple-500/30";
          return (
            <div className="flex justify-center items-center w-full">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
              >
                {r.allocationType}
              </span>
            </div>
          );
        },
      },
      {
        key: "allocationPercentage",
        header: "Alloc %",
        render: (r) => <AllocCell row={r} onClick={handleAllocClick} />,
      },
      {
        key: "hoursPerWeek",
        header: "Hrs/Wk",
        render: (r) => (
          <div className="flex justify-center items-center w-full">
            <span className="text-sm">{r.hoursPerWeek}</span>
          </div>
        ),
      },
      {
        key: "startDate",
        header: "Start",
        render: (r) => (
          <span className="text-sm text-muted-foreground">{r.startDate}</span>
        ),
      },
      {
        key: "endDate",
        header: "End",
        render: (r) => (
          <span className="text-sm text-muted-foreground">{r.endDate}</span>
        ),
      },
    ],
    [handleAllocClick],
  );

  // Filter runs on the deduplicated list — no duplicate rows ever reach the table
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return deduplicatedAllocations.filter((r) => {
      const matchSearch =
        !q ||
        r.resource.toLowerCase().includes(q) ||
        r.resourceId.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.projectId.toLowerCase().includes(q);

      const matchType =
        allocationTypeFilter === "all" ||
        r.allocationType === allocationTypeFilter;

      const matchProject =
        projectFilter === "all" || r.projectId === projectFilter;

      // Derived from total allocation across all projects — not the stored field
      const utilStatus = getUtilizationStatus(r.resourceId);
      const matchUtilization =
        utilizationFilter === "all" || utilStatus === utilizationFilter;

      return matchSearch && matchType && matchProject && matchUtilization;
    });
  }, [
    search,
    allocationTypeFilter,
    projectFilter,
    utilizationFilter,
    deduplicatedAllocations,
  ]);

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col">
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-base">Allocation Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} allocation
            {filteredData.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0">
          {/* Filters */}
          <div className="shrink-0 flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search resource, project, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {allProjects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={allocationTypeFilter}
              onValueChange={setAllocationTypeFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Allocation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Base Business">Base Business</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={utilizationFilter}
              onValueChange={setUtilizationFilter}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Utilization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Utilization</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
                <SelectItem value="medium">Medium (60–89%)</SelectItem>
                <SelectItem value="high">High (≥90%)</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredData.length} results
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0">
            <DataTable data={filteredData} columns={columns} pageSize={50} />
          </div>
        </CardContent>
      </Card>

      {/* Allocation detail dialog */}
      <AllocationDialog
        row={dialogRow}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
