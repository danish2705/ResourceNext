import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useActiveValues } from "@/store/useMasterData";
import type { Demand } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Loader2,
  CheckCircle2,
  Save,
  SendHorizonal,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DemandForm = {
  portfolio: string;
  program: string;
  projectName: string;
  projectRole: string;
  budgetCode: string;
  pillar: string;
  allocationPercent: number;
  status: Demand["status"];
  comments: string;
  identified: boolean;
  estimatedRate: number;
  currentYearForecast: number;
  resourceName: string;
  workstream: string;
  subTeam: string;
  startDate: string;
  endDate: string;
  resourceCount: number;
  type: Demand["type"];
  vendorName: string;
  country: string;
  allocation: {
    current: number;
    y2027: number;
    y2028: number;
    y2029: number;
    y2030: number;
  };
  forecast: {
    current: number;
    y2027: number;
    y2028: number;
    y2029: number;
    y2030: number;
  };
  source?:
    | "Manual"
    | "Jira"
    | "Planisware"
    | "Smartsheets"
    | "Monday.com"
    | "Connected Source";
  isEdited?: boolean;
};

// ── Per-form submission status ────────────────────────────────────────────────
export type FormStatus = "pending" | "draft" | "submitted";

export const emptyDemand: DemandForm = {
  portfolio: "",
  program: "",
  projectName: "",
  projectRole: "",
  budgetCode: "",
  pillar: "",
  allocationPercent: 0,
  status: "Pending",
  comments: "",
  identified: false,
  estimatedRate: 0,
  currentYearForecast: 0,
  resourceName: "",
  workstream: "",
  subTeam: "",
  startDate: "",
  endDate: "",
  type: "Internal",
  vendorName: "",
  country: "Sydney",
  resourceCount: 0,
  allocation: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
  forecast: { current: 0, y2027: 0, y2028: 0, y2029: 0, y2030: 0 },
};

const ALLOC_YEARS = ["current", "y2027", "y2028", "y2029", "y2030"] as const;
const yearLabel = (k: string) =>
  k === "current" ? "Current Year" : k.replace("y", "");

// ── Import types ──────────────────────────────────────────────────────────────

type ImportSourceId = "excel" | "jira" | "planisware" | "smartsheets" | "api";
type ImportStep = "choose" | "fetching" | "preview";

type ImportSource = {
  id: ImportSourceId;
  abbr: string;
  abbrColor: string;
  label: string;
  description: string;
};

type PreviewRecord = {
  projectName: string;
  projectRole: string;
  pillar: string;
  budgetCode: string;
  resource: string;
  type: string;
};

// ── Simulated preview data ────────────────────────────────────────────────────

const SIMULATED_PREVIEWS: Record<
  Exclude<ImportSourceId, "excel">,
  PreviewRecord[]
> = {
  planisware: [
    {
      projectName: "Data Modernization - ASPAC",
      projectRole: "Business Analyst",
      pillar: "Hi-tech",
      budgetCode: "PLNS-1000",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "QE Automation",
      projectRole: "Technical Lead",
      pillar: "Retail",
      budgetCode: "PLNS-1001",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Cloud Enablement",
      projectRole: "QA Engineer",
      pillar: "Banking",
      budgetCode: "PLNS-1002",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Application Support",
      projectRole: "Project Manager",
      pillar: "Healthcare",
      budgetCode: "PLNS-1003",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Data Modernization - ASPAC",
      projectRole: "DevOps Engineer",
      pillar: "Life Sciences",
      budgetCode: "PLNS-1004",
      resource: "",
      type: "Internal",
    },
  ],
  jira: [
    {
      projectName: "Platform Rewrite",
      projectRole: "Backend Engineer",
      pillar: "Fintech",
      budgetCode: "JIRA-2001",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Mobile App v3",
      projectRole: "iOS Developer",
      pillar: "Retail",
      budgetCode: "JIRA-2002",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Analytics Dashboard",
      projectRole: "Data Analyst",
      pillar: "Hi-tech",
      budgetCode: "JIRA-2003",
      resource: "",
      type: "External",
    },
  ],
  smartsheets: [
    {
      projectName: "Resource Planning H2",
      projectRole: "Scrum Master",
      pillar: "Banking",
      budgetCode: "SS-3001",
      resource: "Priya Sharma",
      type: "Internal",
    },
    {
      projectName: "Infrastructure Uplift",
      projectRole: "Cloud Architect",
      pillar: "Hi-tech",
      budgetCode: "SS-3002",
      resource: "Arjun Mehta",
      type: "Internal",
    },
    {
      projectName: "Compliance Audit 2025",
      projectRole: "Security Analyst",
      pillar: "Healthcare",
      budgetCode: "SS-3003",
      resource: "",
      type: "External",
    },
    {
      projectName: "Data Governance",
      projectRole: "Data Steward",
      pillar: "Life Sciences",
      budgetCode: "SS-3004",
      resource: "Sneha Iyer",
      type: "Internal",
    },
  ],
  api: [
    {
      projectName: "Enterprise Integration",
      projectRole: "Integration Lead",
      pillar: "Fintech",
      budgetCode: "API-4001",
      resource: "",
      type: "Internal",
    },
    {
      projectName: "Customer 360",
      projectRole: "CRM Developer",
      pillar: "Retail",
      budgetCode: "API-4002",
      resource: "",
      type: "External",
    },
  ],
};

const FETCH_LABELS: Record<ImportSourceId, string> = {
  excel: "Reading file…",
  jira: "Fetching from Jira…",
  planisware: "Fetching from Planisware…",
  smartsheets: "Fetching from Smartsheets…",
  api: "Fetching from connected source…",
};

const IMPORT_SOURCES: ImportSource[] = [
  {
    id: "excel",
    abbr: "XLS",
    abbrColor: "bg-green-100 text-green-700",
    label: "Excel / CSV Upload",
    description: "Upload .xlsx or .csv with Project, Role, Pillar columns",
  },
  {
    id: "jira",
    abbr: "JR",
    abbrColor: "bg-blue-100 text-blue-600",
    label: "Jira",
    description: "Fetch open epics & stories as demand",
  },
  {
    id: "planisware",
    abbr: "PL",
    abbrColor: "bg-orange-100 text-orange-500",
    label: "Planisware",
    description: "Pull project plans & resource needs",
  },
  {
    id: "smartsheets",
    abbr: "SS",
    abbrColor: "bg-purple-100 text-purple-600",
    label: "Smartsheets",
    description: "Sync resource sheets into demand",
  },
  {
    id: "api",
    abbr: "API",
    abbrColor: "bg-teal-100 text-teal-700",
    label: "Fetch from Connected Source",
    description: "Pull from configured enterprise API endpoint",
  },
];

// ── Status badge helper ───────────────────────────────────────────────────────

function FormStatusBadge({ status }: { status: FormStatus }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Submitted
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
        <Save className="h-3 w-3" /> Draft saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600">
      Pending
    </span>
  );
}

// ── ImportDemandModal ─────────────────────────────────────────────────────────

function ImportDemandModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (records: PreviewRecord[]) => void;
}) {
  const [step, setStep] = useState<ImportStep>("choose");
  const [activeSource, setActiveSource] = useState<ImportSource | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRecord[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("choose");
        setActiveSource(null);
        setPreviewRows([]);
        setSelectedRows(new Set());
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const simulateFetch = (source: ImportSource, rows: PreviewRecord[]) => {
    setActiveSource(source);
    setStep("fetching");
    setTimeout(() => {
      setPreviewRows(rows);
      setSelectedRows(new Set(rows.map((_, i) => i)));
      setStep("preview");
    }, 1800);
  };

  const handleSourceClick = (source: ImportSource) => {
    if (source.id === "excel") fileInputRef.current?.click();
    else simulateFetch(source, SIMULATED_PREVIEWS[source.id]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const source = IMPORT_SOURCES.find((s) => s.id === "excel")!;
    const mockRows: PreviewRecord[] = [
      {
        projectName: file.name.replace(/\.[^.]+$/, ""),
        projectRole: "Business Analyst",
        pillar: "Hi-tech",
        budgetCode: "XLS-0001",
        resource: "",
        type: "Internal",
      },
      {
        projectName: "Cloud Migration",
        projectRole: "Cloud Engineer",
        pillar: "Banking",
        budgetCode: "XLS-0002",
        resource: "",
        type: "External",
      },
      {
        projectName: "Data Pipeline",
        projectRole: "Data Engineer",
        pillar: "Retail",
        budgetCode: "XLS-0003",
        resource: "",
        type: "Internal",
      },
    ];
    simulateFetch(source, mockRows);
    e.target.value = "";
  };

  const toggleRow = (i: number) =>
    setSelectedRows((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const toggleAll = () =>
    setSelectedRows(
      selectedRows.size === previewRows.length
        ? new Set()
        : new Set(previewRows.map((_, i) => i)),
    );

  const handleConfirm = () => {
    onConfirm(previewRows.filter((_, i) => selectedRows.has(i)));
    onClose();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[640px]">
          {/* CHOOSE */}
          {step === "choose" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Import Demand Data
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a source.
                </p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {IMPORT_SOURCES.filter((s) => s.id !== "api").map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSourceClick(s)}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4 text-left hover:bg-accent hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${s.abbrColor}`}
                      >
                        {s.abbr}
                      </span>
                      <span className="font-medium text-sm">{s.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>
              {IMPORT_SOURCES.filter((s) => s.id === "api").map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSourceClick(s)}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 text-left hover:bg-accent hover:border-primary/30 transition-colors w-full mt-1"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${s.abbrColor}`}
                    >
                      {s.abbr}
                    </span>
                    <span className="font-medium text-sm">{s.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {s.description}
                  </p>
                </button>
              ))}
            </>
          )}

          {/* FETCHING */}
          {step === "fetching" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                {activeSource ? FETCH_LABELS[activeSource.id] : "Loading…"}
              </p>
            </div>
          )}

          {/* PREVIEW */}
          {step === "preview" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Import Preview — {previewRows.length} record
                  {previewRows.length !== 1 ? "s" : ""} from{" "}
                  {activeSource?.label}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground -mt-1">
                {selectedRows.size} of {previewRows.length} selected
                {selectedRows.size > 1 && (
                  <span className="ml-1 text-primary font-medium">
                    → {selectedRows.size} demand forms will be created
                  </span>
                )}
              </p>

              <div className="border rounded-lg overflow-hidden mt-1 max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 w-8">
                        <div
                          onClick={toggleAll}
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            selectedRows.size === previewRows.length
                              ? "bg-primary border-primary"
                              : selectedRows.size > 0
                                ? "bg-primary/40 border-primary"
                                : "border-border bg-background"
                          }`}
                        >
                          {selectedRows.size === previewRows.length && (
                            <svg
                              className="h-2.5 w-2.5 text-primary-foreground"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              <path
                                d="M1 4l3 3 5-6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          {selectedRows.size > 0 &&
                            selectedRows.size < previewRows.length && (
                              <div className="h-0.5 w-2 bg-primary-foreground rounded" />
                            )}
                        </div>
                      </th>
                      {[
                        "Project Name",
                        "Project Role",
                        "Pillar",
                        "Budget Code",
                        "Resource",
                        "Type",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => {
                      const isSelected = selectedRows.has(i);
                      return (
                        <tr
                          key={i}
                          onClick={() => toggleRow(i)}
                          className={`border-t cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                        >
                          <td className="px-3 py-2.5">
                            <div
                              className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"}`}
                            >
                              {isSelected && (
                                <svg
                                  className="h-2.5 w-2.5 text-primary-foreground"
                                  viewBox="0 0 10 8"
                                  fill="none"
                                >
                                  <path
                                    d="M1 4l3 3 5-6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-medium">
                            {row.projectName}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {row.projectRole}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {row.pillar}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                            {row.budgetCode}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {row.resource || "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                row.type === "Internal"
                                  ? "bg-blue-500/15 text-blue-500"
                                  : "bg-orange-500/15 text-orange-500"
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("choose")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedRows.size === 0}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Import
                  {selectedRows.size > 0 ? ` (${selectedRows.size})` : ""}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── LockedFormOverlay ─────────────────────────────────────────────────────────

function LockedFormOverlay({
  formStatus,
  projectName,
  onRevert,
}: {
  formStatus: FormStatus;
  projectName: string;
  onRevert: () => void;
}) {
  const isSubmitted = formStatus === "submitted";
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div
        className={`rounded-full p-3 ${isSubmitted ? "bg-emerald-500/10" : "bg-muted"}`}
      >
        {isSubmitted ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        ) : (
          <Save className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="font-medium text-sm">
          {isSubmitted
            ? `"${projectName || "This form"}" has been submitted for approval.`
            : `"${projectName || "This form"}" has been saved as a draft.`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This form is now read-only. You can revert it to pending if you need
          to make changes.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRevert}
        className="gap-2 mt-1"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Revert to Pending
      </Button>
    </div>
  );
}

// ── DemandFormPanel ───────────────────────────────────────────────────────────

function DemandFormPanel({
  form,
  index,
  total,
  formStatus,
  projects,
  pillars,
  roles,
  portfolios,
  programs,
  onChange,
  onSubmitSingle,
  onDraftSingle,
  onRevertSingle,
  isBusy,
}: {
  form: DemandForm;
  index: number;
  total: number;
  formStatus: FormStatus;
  projects: string[];
  pillars: string[];
  roles: string[];
  portfolios: string[];
  programs: string[];
  onChange: (patch: Partial<DemandForm>) => void;
  onSubmitSingle: () => void;
  onDraftSingle: () => void;
  onRevertSingle: () => void;
  isBusy: boolean;
}) {
  const set = (patch: Partial<DemandForm>) => onChange(patch);
  const isLocked = formStatus !== "pending";
  const isMulti = total > 1;

  return (
    <div className="space-y-4">
      {/* ── Project Details ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Project Details
            </CardTitle>
            {(isMulti || formStatus !== "pending") && (
              <FormStatusBadge status={formStatus} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <LockedFormOverlay
              formStatus={formStatus}
              projectName={form.projectName}
              onRevert={onRevertSingle}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Portfolio *</Label>
                <Select
                  value={form.portfolio}
                  onValueChange={(v) => set({ portfolio: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Program *</Label>
                <Select
                  value={form.program}
                  onValueChange={(v) => set({ program: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(programs.length ? programs : ["Enterprise"]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pillar *</Label>
                <Select
                  value={form.pillar}
                  onValueChange={(v) => set({ pillar: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project Name *</Label>
                <Select
                  value={form.projectName}
                  onValueChange={(v) => set({ projectName: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project Role *</Label>
                <Select
                  value={form.projectRole}
                  onValueChange={(v) => set({ projectRole: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget Code *</Label>
                <Input
                  value={form.budgetCode}
                  onChange={(e) => set({ budgetCode: e.target.value })}
                  placeholder="e.g. BC-1001"
                />
              </div>

              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set({ endDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Resource Count</Label>
                <Input
                  type="number"
                  value={form.resourceCount}
                  onChange={(e) =>
                    set({ resourceCount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="col-span-2 md:col-span-3">
                <Label>Comments</Label>
                <Textarea
                  value={form.comments}
                  onChange={(e) => set({ comments: e.target.value })}
                  placeholder="Any additional context…"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Allocation ── */}
      {!isLocked && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Allocation (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-3">
            {ALLOC_YEARS.map((k) => (
              <div key={k}>
                <Label className="text-xs">{yearLabel(k)}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={form.allocation[k]}
                  onChange={(e) =>
                    set({
                      allocation: {
                        ...form.allocation,
                        [k]: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Forecast ── */}
      {!isLocked && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-destructive uppercase tracking-wide">
              Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-3">
            {ALLOC_YEARS.map((k) => (
              <div key={k}>
                <Label className="text-xs">{yearLabel(k)}</Label>
                <Input
                  type="number"
                  value={form.forecast[k]}
                  onChange={(e) =>
                    set({
                      forecast: {
                        ...form.forecast,
                        [k]: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Per-form action bar ── */}
      {isMulti && !isLocked && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Actions for form {index + 1} only
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDraftSingle}
              disabled={isBusy}
              className="gap-1.5 text-xs h-7"
            >
              <Save className="h-3 w-3" />
              Save this draft
            </Button>
            <Button
              size="sm"
              onClick={onSubmitSingle}
              disabled={isBusy}
              className="gap-1.5 text-xs h-7"
            >
              <SendHorizonal className="h-3 w-3" />
              Submit this form
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bulk-action summary bar ───────────────────────────────────────────────────

function BulkStatusBar({ formStatuses }: { formStatuses: FormStatus[] }) {
  const pending = formStatuses.filter((s) => s === "pending").length;
  const drafted = formStatuses.filter((s) => s === "draft").length;
  const submitted = formStatuses.filter((s) => s === "submitted").length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">Progress:</span>
      {pending > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600">
          {pending} pending
        </span>
      )}
      {drafted > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
          <Save className="h-3 w-3" /> {drafted} drafted
        </span>
      )}
      {submitted > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="h-3 w-3" /> {submitted} submitted
        </span>
      )}
    </div>
  );
}

// ── CreateDemand (default export) ─────────────────────────────────────────────

export default function CreateDemand() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const { demands, addDemand, updateDemand } = useStore();
  const _projects = useActiveValues("projects");
  const _pillars = useActiveValues("pillars");
  const roles = useActiveValues("roles");
  const _portfolios = useActiveValues("portfolios");
  const _programs = useActiveValues("programs");

  // In edit mode, ensure saved values that aren't in master data still appear in dropdowns
  const editDemand = editId ? demands.find((d) => d.id === editId) : null;
  const addIfMissing = (list: string[], val?: string) =>
    val && val.trim() && !list.includes(val) ? [val, ...list] : list;
  const projects = addIfMissing(_projects, editDemand?.projectName);
  const pillars = addIfMissing(_pillars, editDemand?.pillar);
  const portfolios = addIfMissing(_portfolios, editDemand?.portfolio);
  const programs = addIfMissing(_programs, editDemand?.program);

  const [forms, setForms] = useState<DemandForm[]>([emptyDemand]);
  const [formStatuses, setFormStatuses] = useState<FormStatus[]>(["pending"]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (!editId) return;
    const demand = demands.find((d) => d.id === editId);
    if (!demand) return;
    setForms([
      {
        portfolio: demand.portfolio || demand.pillar || _portfolios[0] || "",
        program: demand.program,
        projectName: demand.projectName,
        projectRole: demand.projectRole,
        budgetCode: demand.budgetCode,
        pillar: demand.pillar,
        allocationPercent: demand.allocationPercent,
        status: demand.status,
        comments: demand.comments,
        identified: demand.identified,
        estimatedRate: demand.estimatedRate,
        currentYearForecast: demand.currentYearForecast,
        resourceName: demand.resourceName,
        workstream: demand.workstream,
        subTeam: demand.subTeam,
        startDate: demand.startDate,
        endDate: demand.endDate,
        resourceCount: demand.resourceCount || 0,
        type: demand.type as "Internal" | "External",
        vendorName: demand.vendorName,
        country: demand.country,
        allocation: { ...demand.allocation },
        forecast: { ...demand.forecast },
      },
    ]);
    setFormStatuses(["pending"]);
    setActiveIndex(0);
  }, [editId, demands]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const updateForm = (index: number, patch: Partial<DemandForm>) =>
    setForms((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );

  const removeForm = (index: number) => {
    if (forms.length === 1) return;
    setForms((prev) => prev.filter((_, i) => i !== index));
    setFormStatuses((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((prev) => Math.min(prev, forms.length - 2));
  };

  const advanceToNextPending = (
    fromIndex: number,
    updatedStatuses: FormStatus[],
  ) => {
    const next = updatedStatuses.findIndex(
      (s, i) => i > fromIndex && s === "pending",
    );
    if (next !== -1) {
      setActiveIndex(next);
      return;
    }
    const first = updatedStatuses.findIndex(
      (s, i) => i !== fromIndex && s === "pending",
    );
    if (first !== -1) setActiveIndex(first);
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateForm = (index: number): boolean => {
    const f = forms[index];
    const missing: string[] = [];
    if (!f.projectName) missing.push("Project Name");
    if (!f.pillar) missing.push("Pillar");
    if (!f.budgetCode) missing.push("Budget Code");
    if (!f.startDate) missing.push("Start Date");
    if (!f.endDate) missing.push("End Date");
    if (missing.length) {
      toast.error(`Form ${index + 1}: required fields missing`, {
        description: missing.join(", "),
        duration: 4000,
      });
      return false;
    }
    if (f.endDate < f.startDate) {
      toast.error(`Form ${index + 1}: End Date must be after Start Date`);
      return false;
    }
    return true;
  };

  const validateAllPending = (): boolean => {
    for (let i = 0; i < forms.length; i++) {
      if (formStatuses[i] !== "pending") continue;
      if (!validateForm(i)) {
        setActiveIndex(i);
        return false;
      }
    }
    return true;
  };

  // ── Per-form: Save as Draft ───────────────────────────────────────────────────
  const handleDraftSingle = async (index: number) => {
    if (!validateForm(index)) return;
    setIsSavingDraft(true);
    await new Promise((r) => setTimeout(r, 500));

    addDemand({ ...forms[index], status: "Draft" });

    const updated = formStatuses.map((s, i) =>
      i === index ? "draft" : s,
    ) as FormStatus[];
    setFormStatuses(updated);
    advanceToNextPending(index, updated);

    toast.success(`Draft saved`, {
      description: `"${forms[index].projectName || `Form ${index + 1}`}" saved as draft.`,
      duration: 4000,
    });
    setIsSavingDraft(false);
  };

  // ── Per-form: Submit ──────────────────────────────────────────────────────────
  // Returns the new demand ID so the caller can navigate with it.
  const handleSubmitSingle = async (index: number): Promise<string | null> => {
    if (!validateForm(index)) return null;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    // addDemand now returns the new ID
    const newId = addDemand({ ...forms[index], status: "Pending" });

    const updated = formStatuses.map((s, i) =>
      i === index ? "submitted" : s,
    ) as FormStatus[];
    setFormStatuses(updated);
    advanceToNextPending(index, updated);

    toast.success(`Demand submitted`, {
      description: `"${forms[index].projectName || `Form ${index + 1}`}" sent for approval.`,
      duration: 4000,
    });
    setIsSubmitting(false);
    return newId;
  };

  // ── Per-form: Revert to Pending ───────────────────────────────────────────────
  const handleRevertSingle = (index: number) => {
    setFormStatuses(
      (prev) =>
        prev.map((s, i) => (i === index ? "pending" : s)) as FormStatus[],
    );
    toast.info(`Form ${index + 1} reverted to pending.`);
  };

  // ── Per-form: Submit (called from the per-form action bar) ────────────────────
  // In multi-form mode the per-form submit bar calls this; we don't auto-navigate.
  const handleSubmitSingleFromBar = async (index: number) => {
    await handleSubmitSingle(index);
    // Don't navigate — user is still working on other forms.
  };

  // ── Bulk: Save remaining pending as Draft ─────────────────────────────────────
  const handleSaveDraft = async () => {
    if (editId && forms.length === 1) {
      if (!validateForm(0)) return;
      setIsSavingDraft(true);
      await new Promise((r) => setTimeout(r, 700));
      updateDemand(editId, { ...forms[0], status: "Draft" });
      toast.success("Draft updated", {
        description: `"${forms[0].projectName}" saved as draft.`,
        duration: 4000,
      });
      setIsSavingDraft(false);
      navigate("/demand");
      return;
    }

    if (!validateAllPending()) return;

    const pendingIndices = formStatuses
      .map((s, i) => (s === "pending" ? i : -1))
      .filter((i) => i !== -1);
    if (pendingIndices.length === 0) {
      toast.info("No pending forms to save.");
      return;
    }

    setIsSavingDraft(true);
    await new Promise((r) => setTimeout(r, 700));

    pendingIndices.forEach((i) => addDemand({ ...forms[i], status: "Draft" }));
    setFormStatuses(
      (prev) =>
        prev.map((s) => (s === "pending" ? "draft" : s)) as FormStatus[],
    );

    toast.success(
      pendingIndices.length > 1
        ? `${pendingIndices.length} drafts saved`
        : "Draft saved",
      {
        description:
          pendingIndices.length > 1
            ? pendingIndices
                .map((i) => forms[i].projectName || `Form ${i + 1}`)
                .join(" · ")
            : `"${forms[pendingIndices[0]].projectName}" has been saved as a draft.`,
        duration: 5000,
      },
    );
    setIsSavingDraft(false);
    navigate("/demand");
  };

  // ── Bulk: Submit remaining pending ───────────────────────────────────────────
  const handleSubmit = async () => {
    // Edit mode (single form)
    if (editId && forms.length === 1) {
      if (!validateForm(0)) return;
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 900));
      updateDemand(editId, { ...forms[0], status: "Pending" });
      toast.success("Demand submitted", {
        description: `"${forms[0].projectName}" sent for approval.`,
        duration: 5000,
      });
      setIsSubmitting(false);
      navigate("/demand");
      return;
    }

    if (!validateAllPending()) return;

    const pendingIndices = formStatuses
      .map((s, i) => (s === "pending" ? i : -1))
      .filter((i) => i !== -1);

    if (pendingIndices.length === 0) {
      toast.info("No pending forms to submit.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));

    // Collect IDs as we add them
    const newIds: string[] = pendingIndices.map((i) =>
      addDemand({ ...forms[i], status: "Pending" }),
    );

    setFormStatuses(
      (prev) =>
        prev.map((s) => (s === "pending" ? "submitted" : s)) as FormStatus[],
    );

    toast.success(
      pendingIndices.length > 1
        ? `${pendingIndices.length} demands submitted for approval`
        : "Demand submitted",
      {
        description:
          pendingIndices.length > 1
            ? pendingIndices
                .map((i) => forms[i].projectName || `Form ${i + 1}`)
                .join(" · ")
            : `"${forms[pendingIndices[0]].projectName}" is pending approval.`,
        duration: 5000,
      },
    );
    setIsSubmitting(false);

    // Navigate with the first new demand's ID so DemandSummary can auto-open allocation.
    // For bulk (>1), just navigate without auto-open since there are multiple new demands.
    if (newIds.length === 1 && newIds[0]) {
      navigate(`/demand?allocate=${newIds[0]}`);
    } else {
      navigate("/demand");
    }
  };

  // ── Import confirm ────────────────────────────────────────────────────────────
  const handleImportConfirm = (records: PreviewRecord[]) => {
    if (!records.length) return;

    const getMatchedValue = (value: string, list: string[]): string => {
      if (!value) return "";

      const match = list.find(
        (item) => item.toLowerCase().trim() === value.toLowerCase().trim(),
      );

      return match || "";
    };

    const newForms: DemandForm[] = records.map((r) => {
      return {
        ...emptyDemand,

        // Match dropdown fields with master data
        projectName: getMatchedValue(r.projectName, projects),
        projectRole: getMatchedValue(r.projectRole, roles),
        pillar: getMatchedValue(r.pillar, pillars),

        // Populate remaining fields
        budgetCode: r.budgetCode || "",
        resourceName: r.resource || "",
        type: (r.type as Demand["type"]) || "Internal",

        // Auto default values
        portfolio: portfolios[0] || "",
        program: programs[0] || "",

        // Optional defaults
        status: "Pending",
        comments: "",
        identified: false,
        estimatedRate: 0,
        currentYearForecast: 0,
        allocationPercent: 0,

        workstream: "",
        subTeam: "",
        startDate: "",
        endDate: "",

        vendorName: "",
        country: "Sydney",

        allocation: {
          current: 0,
          y2027: 0,
          y2028: 0,
          y2029: 0,
          y2030: 0,
        },

        forecast: {
          current: 0,
          y2027: 0,
          y2028: 0,
          y2029: 0,
          y2030: 0,
        },

        source: r.budgetCode?.startsWith("JIRA")
          ? "Jira"
          : r.budgetCode?.startsWith("PLNS")
            ? "Planisware"
            : r.budgetCode?.startsWith("SS")
              ? "Smartsheets"
              : "Manual",
      };
    });

    setForms(newForms);
    setFormStatuses(newForms.map(() => "pending"));
    setActiveIndex(0);

    toast.success(
      `${records.length} demand form${
        records.length > 1 ? "s" : ""
      } created from import`,
      {
        description:
          records.length > 1
            ? "Imported demand data mapped into the correct form fields."
            : "Imported demand data mapped successfully.",
        duration: 5000,
      },
    );
  };

  const isBusy = isSavingDraft || isSubmitting;
  const isMulti = forms.length > 1;
  const pendingCount = formStatuses.filter((s) => s === "pending").length;
  const allActioned = pendingCount === 0 && isMulti;

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {editId ? "Edit Demand" : "Create Demand"}
            </h1>

            {isMulti && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {forms.length} demand forms · editing form {activeIndex + 1} of{" "}
                {forms.length}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            disabled={isBusy}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {isMulti && (
        <div className="shrink-0">
          {/* KEEP YOUR EXISTING TABS CODE HERE EXACTLY AS IT IS */}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <DemandFormPanel
          key={activeIndex}
          form={forms[activeIndex]}
          index={activeIndex}
          total={forms.length}
          formStatus={formStatuses[activeIndex]}
          projects={projects}
          pillars={pillars}
          roles={roles}
          portfolios={portfolios}
          programs={programs}
          onChange={(patch) => updateForm(activeIndex, patch)}
          onSubmitSingle={() => handleSubmitSingleFromBar(activeIndex)}
          onDraftSingle={() => handleDraftSingle(activeIndex)}
          onRevertSingle={() => handleRevertSingle(activeIndex)}
          isBusy={isBusy}
        />
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 border-t bg-background pt-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {isMulti ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((i) => i - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  disabled={activeIndex === forms.length - 1}
                  onClick={() => setActiveIndex((i) => i + 1)}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <BulkStatusBar formStatuses={formStatuses} />
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/demand")}
              disabled={isBusy}
            >
              Cancel
            </Button>

            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isBusy || (isMulti && allActioned)}
              className="gap-2 min-w-[140px]"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : isMulti ? (
                pendingCount > 0 ? (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save {pendingCount} as Draft
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    All Drafted
                  </>
                )
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isBusy || (isMulti && allActioned)}
              className="gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting…
                </>
              ) : isMulti ? (
                pendingCount > 0 ? (
                  <>
                    <SendHorizonal className="h-3.5 w-3.5" />
                    Submit {pendingCount} Remaining
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    All Submitted
                  </>
                )
              ) : (
                <>
                  <SendHorizonal className="h-3.5 w-3.5" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <ImportDemandModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleImportConfirm}
      />
    </div>
  );
}
