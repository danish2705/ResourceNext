import { useMemo, useState } from "react";
import { useStore, type AuditEntry } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, ShieldCheck, Download, ArrowUpDown } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";

// ── Helpers ───────────────────────────────────────────────────────────────────

const entityColors: Record<AuditEntry["entity"], string> = {
  Demand:
    "bg-blue-500/15 text-blue-700 border border-blue-500/30 dark:text-blue-300",
  Allocation:
    "bg-purple-500/15 text-purple-700 border border-purple-500/30 dark:text-purple-300",
  Resource:
    "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300",
  Forecast:
    "bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300",
};

const actionColors: Record<string, string> = {
  Created:
    "bg-green-500/15 text-green-700 border border-green-500/30 dark:text-green-300",
  "Created (from Forecast)":
    "bg-green-500/15 text-green-700 border border-green-500/30 dark:text-green-300",
  "Bulk Import":
    "bg-teal-500/15 text-teal-700 border border-teal-500/30 dark:text-teal-300",
  Deleted:
    "bg-red-500/15 text-red-700 border border-red-500/30 dark:text-red-300",
  "Status Changed":
    "bg-orange-500/15 text-orange-700 border border-orange-500/30 dark:text-orange-300",
  "Field Updated":
    "bg-slate-500/15 text-slate-700 border border-slate-500/30 dark:text-slate-300",
  "Lifecycle Changed":
    "bg-violet-500/15 text-violet-700 border border-violet-500/30 dark:text-violet-300",
  "Converted to Demand":
    "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30 dark:text-indigo-300",
};

function actionBadge(action: string) {
  const cls =
    actionColors[action] ??
    "bg-muted text-muted-foreground border border-border";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {action}
    </span>
  );
}

function ValueCell({ val, empty }: { val: string; empty?: boolean }) {
  if (!val)
    return <span className="text-muted-foreground/50 italic text-xs">—</span>;
  return (
    <span
      className={`text-xs font-mono px-1.5 py-0.5 rounded ${
        empty
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-muted text-foreground"
      }`}
    >
      {val}
    </span>
  );
}

// ── Columns ───────────────────────────────────────────────────────────────────

const columns: Column<AuditEntry>[] = [
  {
  key: "timestamp",
  header: "Timestamp",
  render: (r) => {
    const date = new Date(r.timestamp);

    const formattedDateTime = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )} ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

    return (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formattedDateTime}
      </span>
    );
  },
},
  {
    key: "entityId",
    header: "Resource ID",
    render: (r) => {
      const num = String(r.entityId)
        .replace(/\D/g, "") // remove d,e,m,r,e,s,-
        .slice(-3)
        .padStart(3, "0");

      return <span className="font-mono text-xs">RES-{num}</span>;
    },
  },
  {
    key: "user",
    header: "User",
    render: (r) => {
      const initials = r.user
        .split("@")[0]
        .split(/[.\-_]/)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-semibold shrink-0">
            {initials}
          </div>
          <span className="text-xs">{r.user}</span>
        </div>
      );
    },
  },
  {
    key: "entity",
    header: "Entity",
    render: (r) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${entityColors[r.entity]}`}
      >
        {r.entity}
      </span>
    ),
  },

  {
    key: "action",
    header: "Action",
    render: (r) => actionBadge(r.action),
  },
  {
    key: "field",
    header: "Field",
    render: (r) =>
      r.field ? (
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
          {r.field}
        </span>
      ) : (
        <span className="text-muted-foreground/50 italic text-xs">—</span>
      ),
  },
  {
    key: "oldValue",
    header: "Old Value",
    render: (r) => <ValueCell val={r.oldValue} empty={!r.oldValue} />,
  },
  {
    key: "newValue",
    header: "New Value",
    render: (r) => <ValueCell val={r.newValue} />,
  },
];

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLog() {
  const { auditLog } = useStore();

  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Derive unique users and actions from live log
  const uniqueUsers = useMemo(
    () => [...new Set(auditLog.map((e) => e.user))].sort(),
    [auditLog],
  );
  const uniqueActions = useMemo(
    () => [...new Set(auditLog.map((e) => e.action))].sort(),
    [auditLog],
  );

  // KPI counts
  const kpis = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return {
      total: auditLog.length,
      today: auditLog.filter((e) => e.timestamp.startsWith(today)).length,
      deletions: auditLog.filter((e) => e.action === "Deleted").length,
      statusChanges: auditLog.filter((e) => e.action === "Status Changed")
        .length,
    };
  }, [auditLog]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    let list = auditLog.filter((e) => {
      const matchSearch =
        !q ||
        e.user.toLowerCase().includes(q) ||
        e.entityLabel.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.field.toLowerCase().includes(q) ||
        e.oldValue.toLowerCase().includes(q) ||
        e.newValue.toLowerCase().includes(q);

      const matchEntity = filterEntity === "all" || e.entity === filterEntity;
      const matchAction = filterAction === "all" || e.action === filterAction;
      const matchUser = filterUser === "all" || e.user === filterUser;

      return matchSearch && matchEntity && matchAction && matchUser;
    });

    list = [...list].sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [auditLog, search, filterEntity, filterAction, filterUser, sortOrder]);

  const hasFilters =
    search ||
    filterEntity !== "all" ||
    filterAction !== "all" ||
    filterUser !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterEntity("all");
    setFilterAction("all");
    setFilterUser("all");
  };

  // CSV export
  const handleExport = () => {
    const headers = [
      "Timestamp",
      "Resource ID",
      "User",
      "Entity",
      "Entity ID",
      "Name",
      "Action",
      "Field",
      "Old Value",
      "New Value",
    ];
    const rows = filteredData.map((e) =>
      [
        e.timestamp,
        e.user,
        e.entity,
        e.entityId,
        e.entityLabel,
        e.action,
        e.field,
        e.oldValue,
        e.newValue,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col gap-4 overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Audit Log</h1>
            <p className="text-xs text-muted-foreground">
              Enterprise-wide change history across all entities
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* ── KPI Row ── */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Total Entries"
          value={kpis.total}
          sub="all time"
          color="text-foreground"
        />
        <KpiCard
          label="Today"
          value={kpis.today}
          sub="changes today"
          color="text-blue-500"
        />
        <KpiCard
          label="Status Changes"
          value={kpis.statusChanges}
          sub="approval actions"
          color="text-orange-500"
        />
        <KpiCard
          label="Deletions"
          value={kpis.deletions}
          sub="records removed"
          color="text-red-500"
        />
      </div>

      {/* ── Table Card ── */}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base">Change History</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} entr
            {filteredData.length !== 1 ? "ies" : "y"} shown
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* ── Filter bar ── */}
          <div className="shrink-0 flex flex-wrap items-center gap-2 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search user, entity, field, value…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Entity */}
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="h-9 w-[140px] text-sm">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="Demand">Demand</SelectItem>
                <SelectItem value="Allocation">Allocation</SelectItem>
                <SelectItem value="Resource">Resource</SelectItem>
                <SelectItem value="Forecast">Forecast</SelectItem>
              </SelectContent>
            </Select>

            {/* Action */}
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User */}
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="h-9 w-[180px] text-sm">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-sm"
              onClick={() =>
                setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))
              }
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </Button>

            {/* Clear */}
            {hasFilters && (
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

          {/* ── Entity legend ── */}
          <div className="shrink-0 flex flex-wrap gap-2 mb-4">
            {(
              [
                "Demand",
                "Allocation",
                "Resource",
                "Forecast",
              ] as AuditEntry["entity"][]
            ).map((e) => (
              <button
                key={e}
                onClick={() =>
                  setFilterEntity((prev) => (prev === e ? "all" : e))
                }
                className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-opacity ${
                  entityColors[e]
                } ${filterEntity !== "all" && filterEntity !== e ? "opacity-40" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            <DataTable data={filteredData} columns={columns} pageSize={15} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
