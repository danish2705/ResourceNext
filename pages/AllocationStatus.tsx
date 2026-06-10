import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePillarFilter } from "@/hooks/usePillarFilter";
import { ResourceDialog } from "@/pages/Resource";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DemandStatusRecord,
  statusStyleMap,
  demandData,
} from "@/mocks/demandStatus";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/auth/useAuth";
import { Search, X, Pencil, Eye, ClipboardList } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AllocationBar({
  allocated,
  total,
}: {
  allocated: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.min((allocated / total) * 100, 100);

  const barColor =
    allocated === 0
      ? "bg-muted-foreground/30"
      : allocated < total
        ? "bg-yellow-500"
        : "bg-green-500";

  const textColor =
    allocated === 0
      ? "text-muted-foreground"
      : allocated < total
        ? "text-yellow-400"
        : "text-green-400";

  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <span className={`text-xs font-medium ${textColor}`}>
        {allocated}/{total}
      </span>
    </div>
  );
}

function ViewDetailsModal({
  demand,
  onClose,
}: {
  demand: DemandStatusRecord;
  onClose: () => void;
}) {
  const years = ["Current Year", "2027", "2028", "2029", "2030"];

  const allocationValues = demand.allocation
    ? [
        demand.allocation.currentYear,
        demand.allocation.y2027,
        demand.allocation.y2028,
        demand.allocation.y2029,
        demand.allocation.y2030,
      ]
    : [0, 0, 0, 0, 0];

  const forecastValues = demand.forecast
    ? [
        demand.forecast.currentYear,
        demand.forecast.y2027,
        demand.forecast.y2028,
        demand.forecast.y2029,
        demand.forecast.y2030,
      ]
    : [0, 0, 0, 0, 0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">
              {demand.projectId}
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-1">
              {demand.projectName}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyleMap[demand.status]}`}
            >
              {demand.status}
            </span>

            <button
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Project Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Portfolio" value={demand.portfolio || "Global"} />
              <Field label="Program" value={demand.program || "Enterprise"} />
              <Field label="Project Name" value={demand.projectName} />
              <Field label="Project Role" value={demand.projectRole || "—"} />
              <Field label="Pillar" value={demand.pillar} />
              <Field label="Budget Code" value={demand.budgetCode} />
              <Field label="Workstream" value={demand.workstream || "—"} />
              <Field label="Start Date" value={formatDate(demand.startDate)} />
              <Field label="End Date" value={formatDate(demand.endDate)} />
              <Field
                label="No. of Resources"
                value={String(demand.noOfResources ?? 0)}
              />
              <Field
                label="Allocated Resources"
                value={`${demand.allocatedResources ?? 0} / ${demand.noOfResources ?? 0}`}
              />
              {demand.resourceName && (
                <Field
                  label="Allocated Resource(s)"
                  value={demand.resourceName}
                />
              )}
            </div>

            <div className="mt-5">
              <p className="text-sm text-muted-foreground mb-2">
                Required Skills
              </p>

              <div className="flex flex-wrap gap-2">
                {demand.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {demand.comments && (
              <div className="mt-5">
                <p className="text-sm text-muted-foreground mb-2">Comments</p>

                <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
                  {demand.comments}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
              Allocation (%)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {years.map((yr, i) => (
                <YearField
                  key={yr}
                  label={yr}
                  value={allocationValues[i]}
                  suffix="%"
                  accent="text-sky-600 dark:text-sky-400"
                />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
              Forecast
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {years.map((yr, i) => (
                <YearField
                  key={yr}
                  label={yr}
                  value={forecastValues[i]}
                  prefix="$"
                  formatK
                  accent="text-rose-600 dark:text-rose-400"
                />
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-6 border-t border-border pt-4 text-sm text-muted-foreground">
            <span>
              Submitted by:{" "}
              <span className="font-medium text-foreground">
                {demand.submittedBy}
              </span>
            </span>

            <span>
              Delivery Manager:{" "}
              <span className="font-medium text-foreground">
                {demand.deliveryManager}
              </span>
            </span>

            <span>
              Est. Rate:{" "}
              <span className="font-medium text-foreground">
                ${demand.estimatedRate}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>

      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

function YearField({
  label,
  value,
  suffix,
  prefix,
  formatK,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  formatK?: boolean;
  accent: string;
}) {
  const display = formatK
    ? value === 0
      ? "0"
      : value >= 1000
        ? `${(value / 1000).toFixed(0)}K`
        : `${value}`
    : `${value}`;

  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>

      <div
        className={`rounded-lg border border-border bg-background px-3 py-3 text-sm font-semibold ${accent}`}
      >
        {prefix}
        {display}
        {suffix}
      </div>
    </div>
  );
}

export default function AllocationStatus() {
  const { filterByPillar } = usePillarFilter();
  const { demands, reviewRequests } = useStore();
  const { user } = useAuth();

  // Build a map: demandId → number of approved resources (PMO Approved or Approved)
  const approvedCountByDemand = useMemo(() => {
    const map: Record<string, number> = {};
    reviewRequests.forEach((r) => {
      if (r.status === "PMO Approved" || r.status === "Approved") {
        map[r.demandId] = (map[r.demandId] || 0) + (r.resourceCount || 1);
      }
    });
    return map;
  }, [reviewRequests]);

  // Convert live store demands to DemandStatusRecord shape
  const liveDemands: DemandStatusRecord[] = useMemo(() => {
    // For super_admin: show all their created demands
    // For pmo/resource_manager: show all demands they can see
    return demands.map((d) => ({
      id: d.id,
      projectId: d.id,
      projectName: d.projectName,
      requiredSkills: [d.projectRole].filter(Boolean),
      budgetCode: d.budgetCode,
      pillar: (d.pillar || "Hi-tech") as DemandStatusRecord["pillar"],
      noOfResources: d.resourceCount || 1,
      allocatedResources: approvedCountByDemand[d.id] || 0,
      estimatedRate: d.estimatedRate,
      currentYearForecast: d.currentYearForecast,
      status: (d.status === "Draft"
        ? "Draft"
        : d.status === "Pending"
          ? "Submitted"
          : d.status === "RM Approved"
            ? "RM Approved"
            : d.status === "RM Rejected"
              ? "RM Rejected"
              : d.status === "PMO Approved"
                ? "PMO Approved"
                : d.status === "PMO Rejected"
                  ? "PMO Rejected"
                  : d.status === "Approved"
                    ? "Approved"
                    : d.status === "Rejected"
                      ? "Rejected"
                      : "Submitted") as DemandStatusRecord["status"],
      submittedBy:
        d.createdBy === "super"
          ? "Super Admin"
          : d.createdBy === "pmo"
            ? "PMO"
            : d.createdBy === "resm"
              ? "Resource Manager"
              : d.createdBy === "reso"
                ? "Resource Owner"
                : d.createdBy,
      deliveryManager:
        d.updatedBy === "super"
          ? "Super Admin"
          : d.updatedBy === "pmo"
            ? "PMO"
            : d.updatedBy === "resm"
              ? "Resource Manager"
              : d.updatedBy === "reso"
                ? "Resource Owner"
                : d.updatedBy,
      portfolio: d.portfolio,
      program: d.program,
      projectRole: d.projectRole,
      resourceName: d.resourceName || "",
      workstream: d.workstream,
      startDate: d.startDate,
      endDate: d.endDate,
      comments: d.comments,
      allocation: {
        currentYear: d.allocation.current,
        y2027: d.allocation.y2027,
        y2028: d.allocation.y2028,
        y2029: d.allocation.y2029,
        y2030: d.allocation.y2030,
      },
      forecast: {
        currentYear: d.forecast.current,
        y2027: d.forecast.y2027,
        y2028: d.forecast.y2028,
        y2029: d.forecast.y2029,
        y2030: d.forecast.y2030,
      },
    }));
  }, [demands, approvedCountByDemand]);

  // Merge: live store demands take priority (by id), static mock fills the rest
  const allDemands: DemandStatusRecord[] = useMemo(() => {
    const liveIds = new Set(liveDemands.map((d) => d.id));
    const staticFiltered = demandData.filter((d) => !liveIds.has(d.id));
    return [...liveDemands, ...staticFiltered];
  }, [liveDemands]);

  const visibleDemands = filterByPillar(allDemands);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterAllocation, setFilterAllocation] = useState("all");

  const [selectedDemand, setSelectedDemand] =
    useState<DemandStatusRecord | null>(null);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return visibleDemands.filter((d) => {
      const matchSearch =
        !q ||
        d.projectId.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q) ||
        d.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
        d.submittedBy.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || d.status === filterStatus;
      const matchDomain = filterDomain === "all" || d.pillar === filterDomain;
      const matchAllocation =
        filterAllocation === "all" ||
        (filterAllocation === "full" &&
          d.allocatedResources === d.noOfResources) ||
        (filterAllocation === "partial" &&
          d.allocatedResources > 0 &&
          d.allocatedResources < d.noOfResources) ||
        (filterAllocation === "none" && d.allocatedResources === 0);

      return matchSearch && matchStatus && matchDomain && matchAllocation;
    });
  }, [visibleDemands, search, filterStatus, filterDomain, filterAllocation]);

  const hasActiveFilters =
    search ||
    filterStatus !== "all" ||
    filterDomain !== "all" ||
    filterAllocation !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterDomain("all");
    setFilterAllocation("all");
  };

  const domains = [...new Set(visibleDemands.map((d) => d.pillar))].sort();

  const [allocationDialog, setAllocationDialog] = useState<{
    open: boolean;
    demand: DemandStatusRecord | null;
  }>({
    open: false,
    demand: null,
  });

  const handleEditAllocation = (demand: DemandStatusRecord) => {
    setAllocationDialog({
      open: true,
      demand,
    });
  };

  return (
    <>
      {selectedDemand && (
        <ViewDetailsModal
          demand={selectedDemand}
          onClose={() => setSelectedDemand(null)}
        />
      )}

      <Card className="h-[calc(100vh-120px)] flex flex-col">
        <CardHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Allocation Status</CardTitle>
          </div>

          <p className="text-sm text-muted-foreground">
            {visibleDemands.length} demands · track allocation &amp; approval
            progress
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 flex items-center gap-2 flex-wrap mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search project, skill, submitted by…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="h-9 w-[145px] text-sm">
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>

                {domains.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterAllocation}
              onValueChange={setFilterAllocation}
            >
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="All Allocations" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Allocations</SelectItem>

                <SelectItem value="full">Fully Allocated</SelectItem>

                <SelectItem value="partial">Partially Allocated</SelectItem>

                <SelectItem value="none">Not Allocated</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground ml-1">
              {filteredData.length} result
              {filteredData.length !== 1 ? "s" : ""}
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

          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-muted">
                  <tr>
                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Project ID
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Project Name
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Required Skills
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      No. of Resources
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Estimated Rate/Hr
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Current Year Forecast
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Status
                    </th>

                    <th className="sticky top-0 z-20 bg-muted px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap border-b">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-10 text-center text-muted-foreground text-sm"
                      >
                        No demands match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((d) => (
                      <tr
                        key={d.id}
                        className="border-t hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {d.projectId}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium text-foreground leading-snug max-w-[180px]">
                            {d.projectName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {d.pillar}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {d.requiredSkills.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <AllocationBar
                            allocated={d.allocatedResources}
                            total={d.noOfResources}
                          />

                          <div className="text-xs text-muted-foreground mt-1">
                            {d.allocatedResources === d.noOfResources
                              ? "Fully allocated"
                              : d.allocatedResources === 0
                                ? "Not allocated"
                                : `${d.noOfResources - d.allocatedResources} pending`}
                          </div>
                        </td>

                        <td className="px-3 py-3 font-medium whitespace-nowrap text-center">
                          ${d.estimatedRate}
                        </td>
                        <td className="px-3 py-3 font-medium whitespace-nowrap">
                          ${d.currentYearForecast.toLocaleString()}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap w-fit ${statusStyleMap[d.status]}`}
                            >
                              {d.status}
                            </span>
                            {d.submittedBy && (
                              <div
                                className="text-xs text-muted-foreground truncate max-w-[140px]"
                                title={d.submittedBy}
                              >
                                {d.submittedBy}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                              onClick={() => setSelectedDemand(d)}
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={d.status === "Approved"}
                              onClick={() => handleEditAllocation(d)}
                              title={
                                d.status === "Approved"
                                  ? "Approved demand cannot be edited"
                                  : "Edit Allocation"
                              }
                            >
                              <Pencil className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="shrink-0 border-t pt-3 mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                Total forecast:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(
                    filteredData.reduce(
                      (sum, d) => sum + d.currentYearForecast,
                      0,
                    ),
                  )}
                </span>
              </span>

              <span>
                Approved:{" "}
                <span className="font-medium text-green-400">
                  {filteredData.filter((d) => d.status === "Approved").length}
                </span>
              </span>

              <span>
                Pending:{" "}
                <span className="font-medium text-yellow-400">
                  {
                    filteredData.filter(
                      (d) =>
                        d.status === "Submitted" || d.status === "Under Review",
                    ).length
                  }
                </span>
              </span>

              <span>
                Draft / Rejected:{" "}
                <span className="font-medium text-muted-foreground">
                  {
                    filteredData.filter(
                      (d) => d.status === "Draft" || d.status === "Rejected",
                    ).length
                  }
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResourceDialog
        open={allocationDialog.open}
        onOpenChange={(open) =>
          setAllocationDialog((prev) => ({
            ...prev,
            open,
          }))
        }
        demandId={allocationDialog.demand?.id || ""}
        projectName={allocationDialog.demand?.projectName || ""}
        projectSkills={allocationDialog.demand?.requiredSkills || []}
        initialResources={[]}
        userRole="Resource Manager"
      />
    </>
  );
}
