// src/pages/UserManagement.tsx  —  Lookup Management (v3)
// Manages every dropdown / option-set used across the app via useMasterData store
import { useState, useMemo } from "react";
import {
  Plus,
  Save,
  X,
  Shield,
  Settings2,
  ChevronDown,
  Trash2,
  Check,
  AlertTriangle,
  Pencil,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/auth/useAuth";
import { useMasterData, type MasterEntry } from "@/store/useMasterData";

// ─── Lookup type definitions ──────────────────────────────────────────────────
// Each entry maps to a key in useMasterData + metadata about where it's used

interface LookupTypeDef {
  key: string;
  label: string;
  usedIn: string; // which pages use this dropdown
  canAdd: boolean;
}

const LOOKUP_TYPES: LookupTypeDef[] = [
  { key: "pillars", label: "Pillars", usedIn: "All pages", canAdd: true },
  {
    key: "roles",
    label: "Roles / Designations",
    usedIn: "Resource Info, Demand, Forecast",
    canAdd: true,
  },
  {
    key: "portfolios",
    label: "Portfolios",
    usedIn: "Demand, Forecast",
    canAdd: true,
  },
  {
    key: "programs",
    label: "Programs",
    usedIn: "Demand, Forecast",
    canAdd: true,
  },
  {
    key: "projects",
    label: "Projects",
    usedIn: "Demand, Demand Summary, Forecast",
    canAdd: true,
  },
  {
    key: "countries",
    label: "Locations",
    usedIn: "Demand Summary",
    canAdd: true,
  },
  {
    key: "allocationType",
    label: "Allocation Type",
    usedIn: "Allocation",
    canAdd: true,
  },
];

// All seed data is managed directly in useMasterData initialObjects

// ─── helpers ──────────────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground ` +
  `focus:outline-none focus:ring-2 focus:ring-ring transition-colors ` +
  (err ? "border-destructive" : "border-border hover:border-border/80");

// ─── Add / Edit Entry Modal ───────────────────────────────────────────────────

function EntryModal({
  mode,
  initial,
  existingValues,
  onSave,
  onClose,
}: {
  mode: "add" | "edit";
  initial?: MasterEntry;
  existingValues: string[];
  onSave: (value: string, description: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial?.value ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [err, setErr] = useState("");

  const submit = () => {
    const t = value.trim();
    if (!t) {
      setErr("Value is required.");
      return;
    }
    const dupes = existingValues.map((v) => v.toLowerCase());
    if (mode === "add" && dupes.includes(t.toLowerCase())) {
      setErr("This value already exists.");
      return;
    }
    if (
      mode === "edit" &&
      initial &&
      dupes
        .filter((v) => v !== initial.value.toLowerCase())
        .includes(t.toLowerCase())
    ) {
      setErr("This value already exists.");
      return;
    }
    onSave(t, desc.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {mode === "add" ? "Add New Value" : "Edit Value"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "add"
                ? "This value will appear in the dropdown."
                : "Update this dropdown option."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Value <span className="text-destructive">*</span>
            </label>
            <input
              autoFocus
              className={inputCls(err)}
              placeholder="e.g. High, Strategic, Available..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {err && <p className="text-xs text-destructive mt-1">{err}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description
            </label>
            <input
              className={inputCls()}
              placeholder="Optional description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Check className="h-4 w-4" /> {mode === "add" ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user } = useAuth();
  const { objects, addEntry, updateEntry, deleteEntry, addObjectType } =
    useMasterData();

  const [selectedKey, setSelectedKey] = useState(LOOKUP_TYPES[0].key);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<MasterEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MasterEntry | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

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

  // Ensure every lookup type has a store object (seed extras if missing)
  const ensureObjects = () => {
    // All seed data lives in useMasterData initialObjects — nothing to do here
  };
  // Run once on mount pattern via useMemo side-effect check
  useMemo(() => {
    ensureObjects();
  }, []); // eslint-disable-line

  const currentDef = LOOKUP_TYPES.find((lt) => lt.key === selectedKey)!;
  const currentObj = objects.find((o) => o.key === selectedKey);
  const allEntries: MasterEntry[] = currentObj?.entries ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return allEntries;
    const q = search.toLowerCase();
    return allEntries.filter(
      (e) =>
        e.value.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [allEntries, search]);

  const activeCount = allEntries.filter((e) => e.status === "Active").length;
  const inactiveCount = allEntries.filter(
    (e) => e.status === "Inactive",
  ).length;

  const handleSave = (value: string, description: string) => {
    if (showModal === "add") {
      addEntry(selectedKey, { value, description });
    } else if (showModal === "edit" && editTarget) {
      updateEntry(selectedKey, editTarget.id, { value, description });
    }
    setShowModal(null);
    setEditTarget(null);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  const handleToggleStatus = (entry: MasterEntry) => {
    updateEntry(selectedKey, entry.id, {
      status: entry.status === "Active" ? "Inactive" : "Active",
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteEntry(selectedKey, deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col gap-4">
      {/* Page header */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Lookup Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage dropdown values used across all pages.
            </p>
          </div>
        </div>
        {savedBanner && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-700 dark:text-green-300 text-sm font-medium">
            <Check className="h-4 w-4" /> Saved successfully
          </div>
        )}
      </div>

      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {/* Top controls */}
          <div className="shrink-0 flex flex-wrap items-end gap-4 px-5 pt-5 pb-4 border-b border-border bg-muted/20">
            {/* Lookup Type dropdown */}
            <div className="flex flex-col gap-1 min-w-[260px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lookup Type
              </label>
              <div className="relative">
                <select
                  value={selectedKey}
                  onChange={(e) => {
                    setSelectedKey(e.target.value);
                    setSearch("");
                  }}
                  className="appearance-none w-full h-10 pl-3 pr-9 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  {LOOKUP_TYPES.map((lt) => (
                    <option key={lt.key} value={lt.key}>
                      {lt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Used in label */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Used In
              </label>
              <span className="h-10 flex items-center text-sm text-muted-foreground">
                {currentDef.usedIn}
              </span>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <div className="flex items-center bg-card border border-border rounded-lg px-3 h-10 gap-2 min-w-[180px]">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search values..."
                  className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Add New */}
              <button
                onClick={() => {
                  setEditTarget(null);
                  setShowModal("add");
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="shrink-0 flex items-center gap-6 px-5 py-2.5 border-b border-border/50 bg-muted/10">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {allEntries.length}
              </span>{" "}
              total values
            </span>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-green-600 dark:text-green-400">
                {activeCount}
              </span>{" "}
              active
            </span>
            {inactiveCount > 0 && (
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-muted-foreground">
                  {inactiveCount}
                </span>{" "}
                inactive
              </span>
            )}
            {search && (
              <span className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                results
              </span>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14 border-r border-border/50">
                    SR NO.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28 border-r border-border/50">
                    IS ACTIVE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/50">
                    VALUE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/50">
                    DESCRIPTION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36 border-r border-border/50">
                    CREATED DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36 border-r border-border/50">
                    UPDATED DATE
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Settings2 className="h-8 w-8 text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground">
                          {search
                            ? "No values match your search."
                            : 'No values yet. Click "Add New" to get started.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border/40 transition-colors ${
                        entry.status === "Active"
                          ? "hover:bg-accent/20"
                          : "opacity-50 bg-muted/10 hover:bg-muted/20"
                      }`}
                    >
                      {/* Sr No */}
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground border-r border-border/30">
                        {idx + 1}
                      </td>

                      {/* Is Active toggle */}
                      <td className="px-4 py-3 border-r border-border/30">
                        <button
                          onClick={() => handleToggleStatus(entry)}
                          title={
                            entry.status === "Active"
                              ? "Click to deactivate"
                              : "Click to activate"
                          }
                          className="flex items-center gap-2 group"
                        >
                          <span
                            className={`h-6 w-10 rounded-full transition-colors relative inline-block ${
                              entry.status === "Active"
                                ? "bg-primary"
                                : "bg-muted border border-border"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                entry.status === "Active"
                                  ? "left-[18px]"
                                  : "left-0.5"
                              }`}
                            />
                          </span>
                          <span
                            className={`text-xs ${entry.status === "Active" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                          >
                            {entry.status === "Active" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3 border-r border-border/30">
                        <span
                          className={`font-medium ${entry.status === "Active" ? "text-foreground" : "text-muted-foreground line-through"}`}
                        >
                          {entry.value}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 border-r border-border/30 text-sm text-muted-foreground">
                        {entry.description || (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 border-r border-border/30 text-xs text-muted-foreground">
                        {entry.createdDate}
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3 border-r border-border/30 text-xs text-muted-foreground">
                        {entry.updatedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditTarget(entry);
                              setShowModal("edit");
                            }}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(entry)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
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

          {/* Footer */}
          <div className="shrink-0 px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Changes are applied live to all dropdowns across the app.
            </p>
            <p className="text-xs text-muted-foreground">
              {activeCount} active value{activeCount !== 1 ? "s" : ""} will
              appear in dropdowns
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {showModal && (
        <EntryModal
          mode={showModal}
          initial={editTarget ?? undefined}
          existingValues={allEntries.map((e) => e.value)}
          onSave={handleSave}
          onClose={() => {
            setShowModal(null);
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Delete Value
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This marks the value as Inactive.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Remove{" "}
              <span className="font-semibold text-foreground">
                "{deleteTarget.value}"
              </span>{" "}
              from the dropdown? Existing records using this value will not be
              affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
