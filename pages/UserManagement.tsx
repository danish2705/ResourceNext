// src/pages/UserManagement.tsx
import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Shield,
  Users,
  UserCheck,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  resources as initialResources,
  type Resource,
} from "@/mocks/resources";
import { useAuth } from "@/auth/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLARS = ["Hi-tech", "Retail", "Banking", "Healthcare", "Life Sciences"];
const SYSTEM_ROLES = ["PMO", "Resource Manager", "Resource"] as const;
type SystemRole = (typeof SYSTEM_ROLES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "name" | "team" | "systemRole";
type SortDir = "asc" | "desc";

interface FormData {
  name: string;
  team: string[];
  systemRole: SystemRole;
  email: string;
  pageAccess: string[];
}

const PAGE_ACCESS = [
  "Dashboard",
  "Resource Information",
  "Create/Import Demand",
  "Demand Summary & Allocation",
  "Allocation Status",
  "Allocation Review & Approval",
  "Allocation Details",
  "Projects",
  "Reporting & Analytics",
  "Audit Log",
  "User Management",
] as const;

const EMPTY_FORM: FormData = {
  name: "",
  team: [],
  systemRole: "Resource",
  email: "",
  pageAccess: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInitials(n: string) {
  return n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
function nextId(list: Resource[]) {
  const max = list.reduce(
    (m, r) => Math.max(m, parseInt(r.id.replace("res-", ""), 10)),
    -1,
  );
  return `res-${max + 1}`;
}
function nextRid(list: Resource[]) {
  const max = list.reduce(
    (m, r) => Math.max(m, parseInt(r.resourceId.replace("RID-", ""), 10)),
    1000,
  );
  return `RID-${max + 1}`;
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground ` +
  `focus:outline-none focus:ring-2 focus:ring-ring transition-colors ` +
  (err ? "border-destructive" : "border-border hover:border-border/80");

const selectCls =
  `w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm ` +
  `focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:border-border/80`;

// ─── Badges ───────────────────────────────────────────────────────────────────

function SystemRoleBadge({ role }: { role: SystemRole }) {
  const cls: Record<SystemRole, string> = {
    PMO: "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300",
    "Resource Manager":
      "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300",
    Resource:
      "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls[role]}`}
    >
      {role}
    </span>
  );
}

function PillarBadge({ team }: { team: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
      {team}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-amber-500",
];
function Avatar({
  name,
  initials,
  index,
}: {
  name: string;
  initials: string;
  index: number;
}) {
  return (
    <div
      className={`h-8 w-8 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
      title={name}
    >
      {initials}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 mt-1">
      {children}
    </p>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: "add" | "edit";
  form: FormData;
  onChange: (f: FormData) => void;
  onSave: () => void;
  onClose: () => void;
  errors: Partial<Record<keyof FormData, string>>;
}

function UserModal({
  mode,
  form,
  onChange,
  onSave,
  onClose,
  errors,
}: ModalProps) {
  const togglePageAccess = (page: string) => {
  const exists = form.pageAccess.includes(page);

  onChange({
    ...form,
    pageAccess: exists
      ? form.pageAccess.filter((p) => p !== page)
      : [...form.pageAccess, page],
  });
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {mode === "add" ? "Add New User" : "Edit User"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "add"
                ? "Fill in the details to add a new user."
                : "Update the user information below."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              className={inputCls(errors.email)}
              placeholder="e.g. priya@company.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-0.5">{errors.email}</p>
            )}
          </div>
          {/* Name */}
          <div>
            <SectionLabel>Identity</SectionLabel>
            <label className="block text-xs font-medium text-foreground mb-1">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              className={inputCls(errors.name)}
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-0.5">{errors.name}</p>
            )}
          </div>

          {/* Pillar */}
          <div>
            <SectionLabel>Assignment</SectionLabel>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Pillar <span className="text-destructive">*</span>
                </label>
                <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
  <div className="space-y-2">
    {PILLARS.map((pillar) => (
      <label
        key={pillar}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          checked={form.team.includes(pillar)}
          onChange={() => {
            const exists = form.team.includes(pillar);

            onChange({
              ...form,
              team: exists
                ? form.team.filter((p) => p !== pillar)
                : [...form.team, pillar],
            });
          }}
        />
        <span>{pillar}</span>
      </label>
    ))}
  </div>
</div>
                {errors.team && (
                  <p className="text-xs text-destructive mt-0.5">
                    {errors.team}
                  </p>
                )}
              </div>

              {/* System Role */}
              <div>
  <SectionLabel>Page Access</SectionLabel>

  <div className="flex items-center justify-between mb-3">
    <button
      type="button"
      className="text-xs text-primary hover:underline"
      onClick={() =>
        onChange({
          ...form,
          pageAccess: [...PAGE_ACCESS],
        })
      }
    >
      Select All
    </button>

    <button
      type="button"
      className="text-xs text-muted-foreground hover:underline"
      onClick={() =>
        onChange({
          ...form,
          pageAccess: [],
        })
      }
    >
      Clear All
    </button>
  </div>

  <div className="grid grid-cols-1 gap-2 h-28 overflow-y-auto border border-border rounded-lg p-3">
    {PAGE_ACCESS.map((page) => (
      <label
        key={page}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          checked={form.pageAccess.includes(page)}
          onChange={() => togglePageAccess(page)}
          className="rounded border-border"
        />
        <span>{page}</span>
      </label>
    ))}
  </div>
</div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  System Role <span className="text-destructive">*</span>
                </label>
                <select
                  className={
                    selectCls + (errors.systemRole ? " border-destructive" : "")
                  }
                  value={form.systemRole}
                  onChange={(e) => set("systemRole", e.target.value)}
                >
                  {SYSTEM_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {errors.systemRole && (
                  <p className="text-xs text-destructive mt-0.5">
                    {errors.systemRole}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {mode === "add" ? "Add User" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  resource,
  onConfirm,
  onClose,
}: {
  resource: Resource;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Remove User
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">{resource.name}</span>{" "}
          ({resource.email}) from the system?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user } = useAuth();

  const [list, setList] = useState<Resource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [filterPillar, setFilterPillar] = useState("");
  const [filterSystemRole, setFilterSystemRole] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  if (user?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Shield className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground">Access Restricted</p>
        <p className="text-xs text-muted-foreground">
          This page is only accessible to Super Admins.
        </p>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let items = list;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.email ?? "").toLowerCase().includes(q) ||
          r.pillar.toLowerCase().includes(q) ||
          (r.systemRole ?? "").toLowerCase().includes(q),
      );
    }
    if (filterPillar) items = items.filter((r) => r.pillar === filterPillar);
    if (filterSystemRole)
      items = items.filter((r) => r.systemRole === filterSystemRole);
    return [...items].sort((a, b) => {
      const av = (a[sortKey] ?? "") as string;
      const bv = (b[sortKey] ?? "") as string;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [list, search, filterPillar, filterSystemRole, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 text-primary" />
    );
  }

  const validate = (f: FormData) => {
    const e: typeof errors = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (f.team.length === 0)
  e.team = "At least one pillar is required";
    if (!f.systemRole) e.systemRole = "System role is required";
    if (!f.email.trim()) e.email = "Email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModalMode("add");
  };
  const openEdit = (r: Resource) => {
    setEditTarget(r);
    setForm({
  name: r.name,
  team: [r.team],
  systemRole: (r.systemRole as SystemRole) ?? "Resource",
  email: r.email ?? "",
  pageAccess: [],
});
    setErrors({});
    setModalMode("edit");
  };

  const handleSave = () => {
    if (!validate(form)) return;
    if (modalMode === "add") {
      const newRes: Resource = {
        id: nextId(list),
        email: form.email.trim(),
        name: form.name.trim(),
        initials: makeInitials(form.name),
        role: "",
        level: "Mid",
        pillar: form.team[0] as Resource["pillar"],
team: form.team.join(", "),
        reportingManager: "—",
        employeeType: "Full Time",
        availableAfter: new Date().toISOString().slice(0, 10),
        skills: [],
        ratePerHr: 0,
        capacity: "40 hrs",
        location: "",
        status: "Available",
        utilization: 0,
        systemRole: form.systemRole,
      };
      setList((prev) => [...prev, newRes]);
    } else if (modalMode === "edit" && editTarget) {
      setList((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? {
                ...r,
                name: form.name.trim(),
                initials: makeInitials(form.name),
                team: form.team.join(", "),
                pillar: form.team[0] as Resource["pillar"],
                systemRole: form.systemRole,
              }
            : r,
        ),
      );
    }
    setModalMode(null);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setList((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col gap-4">
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              User Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage users — assign pillars and system roles.
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base">All Users</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {list.length} users shown
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0">
          {/* Filter bar */}
          <div className="shrink-0 flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <div className="flex items-center bg-card border border-border rounded-lg px-3 h-10 gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, pillar..."
                  className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className={`appearance-none h-10 pl-3 pr-8 rounded-lg border text-sm font-medium cursor-pointer transition-colors outline-none ${filterPillar ? "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
              >
                <option value="">All Pillars</option>
                {PILLARS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="relative">
              <select
                value={filterSystemRole}
                onChange={(e) => setFilterSystemRole(e.target.value)}
                className={`appearance-none h-10 pl-3 pr-8 rounded-lg border text-sm font-medium cursor-pointer transition-colors outline-none ${filterSystemRole ? "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
              >
                <option value="">All System Roles</option>
                {SYSTEM_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {(filterPillar || filterSystemRole || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterPillar("");
                  setFilterSystemRole("");
                }}
                className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 border border-border rounded-xl overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-card border-b border-border">
                  <tr className="text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    <th className="sticky top-0 z-20 bg-card px-4 py-3">Email</th>
                    <th className="sticky top-0 z-20 bg-card px-4 py-3">
                      <button
                        onClick={() => toggleSort("name")}
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Name <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="sticky top-0 z-20 bg-card px-4 py-3">
                      <button
                        onClick={() => toggleSort("team")}
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Pillar <SortIcon k="team" />
                      </button>
                    </th>
                    <th className="sticky top-0 z-20 bg-card px-4 py-3">
                      <button
                        onClick={() => toggleSort("systemRole")}
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        System Role <SortIcon k="systemRole" />
                      </button>
                    </th>
                    <th className="sticky top-0 z-20 bg-card px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-16 text-center text-sm text-muted-foreground"
                      >
                        <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs font-mono font-medium text-muted-foreground">
                          {r.email ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={r.name}
                              initials={r.initials}
                              index={i}
                            />
                            <span className="font-medium text-foreground">
                              {r.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <PillarBadge team={r.pillar} />
                        </td>
                        <td className="px-4 py-3">
                          <SystemRoleBadge
                            role={(r.systemRole as SystemRole) ?? "Resource"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(r)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/15 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalMode && (
        <UserModal
          mode={modalMode}
          form={form}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
          errors={errors}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          resource={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
