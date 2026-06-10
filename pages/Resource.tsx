import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Users,
  X,
  Wand2,
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  Search,
  Zap,
  AlertCircle,
  Save,
  SendHorizonal,
} from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/DataTable";
import { resources, type Resource } from "@/mocks/resources";
import { useAuth } from "@/auth/useAuth";
import { useStore } from "@/store/useStore";

// ─── Table Columns ────────────────────────────────────────────────────────────

const columns: Column<Resource>[] = [
  {
    key: "resourceId",
    header: "Resource ID",
    render: (r) => (
      <span className="text-xs whitespace-nowrap text-muted-foreground font-mono">
        {r.resourceId}
      </span>
    ),
  },
  {
    key: "name",
    header: "Resource",
    render: (r) => (
      <div className="flex items-center gap-1.5">
        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
          {r.initials}
        </div>
        <div>
          <div className="font-medium text-foreground text-xs whitespace-nowrap">
            {r.name}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {r.role}
          </div>
          {r.unavailability && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap mt-0.5
              ${
                r.unavailability.state === "out-of-office"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  : "bg-red-500/15 text-red-600 dark:text-red-300"
              }`}
            >
              {r.unavailability.state === "out-of-office"
                ? "🏖 OOO"
                : "⛔ Unavailable"}{" "}
              {r.unavailability.from} – {r.unavailability.to}
            </span>
          )}
        </div>
      </div>
    ),
  },
  { key: "level", header: "Level" },
  { key: "team", header: "Team" },
  {
    key: "reportingManager",
    header: "Reporting Manager",
    render: (r) => (
      <span className="text-xs whitespace-nowrap">{r.reportingManager}</span>
    ),
  },
  {
    key: "employeeType",
    header: "Employee Type",
    render: (r) => (
      <Badge
        variant={r.employeeType === "Full Time" ? "default" : "secondary"}
        className="text-xs whitespace-nowrap"
      >
        {r.employeeType}
      </Badge>
    ),
  },
  {
    key: "availableAfter",
    header: "Available Date",
    render: (r) => (
      <span className="whitespace-nowrap text-xs">{r.availableAfter}</span>
    ),
  },
  {
    key: "skills",
    header: "Skills",
    render: (r) => (
      <div className="flex flex-wrap gap-1 max-w-[120px]">
        {r.skills.map((s) => (
          <Badge key={s} variant="secondary" className="text-xs px-1.5 py-0">
            {s}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "ratePerHr",
    header: "Rate/Hrs",
    render: (r) => (
      <div className="flex justify-center items-center w-full">
        <span className="font-medium text-xs whitespace-nowrap">
          ${r.ratePerHr}
        </span>
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    render: (r) => (
      <span className="text-xs whitespace-nowrap">{r.location}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => {
      if (r.unavailability) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300">
            Unavailable
          </span>
        );
      }
      const colorMap = {
        Allocated:
          "bg-blue-500/15 text-blue-700 border border-blue-500/30 dark:text-blue-300",
        Available:
          "bg-green-500/15 text-green-700 border border-green-500/30 dark:text-green-300",
        Overallocated:
          "bg-red-500/15 text-red-700 border border-red-500/30 dark:text-red-300",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorMap[r.status]}`}
        >
          {r.status}
        </span>
      );
    },
  },
  {
    key: "utilization",
    header: "Util%",
    render: (r) => {
      if (r.unavailability) {
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${Math.min(r.utilization, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium whitespace-nowrap text-amber-500">
              {r.utilization}%
            </span>
          </div>
        );
      }
      const barColor =
        r.utilization > 100
          ? "bg-red-500"
          : r.utilization >= 80
            ? "bg-blue-500"
            : "bg-green-500";
      const textColor =
        r.utilization > 100
          ? "text-red-400"
          : r.utilization >= 80
            ? "text-blue-400"
            : "text-green-400";
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${Math.min(r.utilization, 100)}%` }}
            />
          </div>
          <span
            className={`text-xs font-medium whitespace-nowrap ${textColor}`}
          >
            {r.utilization}%
          </span>
        </div>
      );
    },
  },
];

// ─── Dialog Types ─────────────────────────────────────────────────────────────

interface AssignedResource {
  id: string;
  name: string;
  email: string;
  domain: string;
}

// ─── Dialog Helpers ───────────────────────────────────────────────────────────

function scoreResource(r: Resource, requiredSkills: string[]): number {
  if (r.status === "Overallocated") return 0;
  const skillMatch = requiredSkills.length
    ? r.skills.filter((s) =>
        requiredSkills.some((req) =>
          s.toLowerCase().includes(req.toLowerCase()),
        ),
      ).length / requiredSkills.length
    : 0.5;
  const availScore =
    r.status === "Available" ? 1 : r.utilization < 80 ? 0.8 : 0.4;
  return skillMatch * 0.6 + availScore * 0.4;
}

function getStatusStyle(status: Resource["status"]) {
  switch (status) {
    case "Available":
      return "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300";
    case "Allocated":
      return "bg-blue-500/15 text-blue-700 border border-blue-500/30 dark:text-blue-300";
    case "Overallocated":
      return "bg-red-500/15 text-red-700 border border-red-500/30 dark:text-red-300";
  }
}

// ─── ResourcePicker ───────────────────────────────────────────────────────────

function ResourcePicker({
  mode,
  requiredSkills,
  onSubmit,
  onBack,
}: {
  mode: "auto" | "manual";
  requiredSkills: string[];
  onSubmit: (selected: Resource[]) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const RICH_SKILLS: string[][] = [
    ["React", "TypeScript", "Node.js", "GraphQL"],
    ["Python", "Django", "PostgreSQL", "Docker"],
    ["React", "Vue.js", "CSS", "Figma"],
    ["Java", "Spring Boot", "Kubernetes", "AWS"],
    ["Data Analysis", "Python", "SQL", "Power BI"],
    ["DevOps", "CI/CD", "Terraform", "Azure"],
    ["React", "TypeScript", "REST APIs", "Jest"],
    ["Product Management", "Agile", "Jira", "Roadmapping"],
    ["UX Design", "Figma", "Prototyping", "User Research"],
    ["SQL", "ETL", "Tableau", "Data Warehousing"],
    ["Angular", "Java", "MySQL", "Jenkins"],
    ["Mobile", "React Native", "iOS", "Android"],
    ["Scrum Master", "Agile", "Confluence", "Risk Management"],
    ["Cloud Architecture", "AWS", "Microservices", "Node.js"],
    ["Business Analysis", "BPMN", "SQL", "Stakeholder Management"],
    ["QA Testing", "Selenium", "Test Planning", "Automation"],
    ["Machine Learning", "Python", "TensorFlow", "Data Analysis"],
    ["SAP", "ERP", "Business Analysis", "SQL"],
    ["Network Security", "Firewalls", "Compliance", "Risk Management"],
    ["Ruby on Rails", "PostgreSQL", "Redis", "Sidekiq"],
  ];

  const displayList = (() => {
    const q = search.toLowerCase();
    let list = resources.filter((r) => {
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.skills.some((s) => s.toLowerCase().includes(q));
      return matchSearch;
    });
    if (mode === "auto") {
      list = list
        .filter((r) => r.status !== "Overallocated" && r.utilization < 100)
        .sort(
          (a, b) =>
            scoreResource(b, requiredSkills) - scoreResource(a, requiredSkills),
        );
    }
    return list;
  })();

  const total = displayList.length;

  const enrichedList = displayList.map((r, idx) => ({
    ...r,
    skills: RICH_SKILLS[idx % RICH_SKILLS.length],
  }));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getAvailability = (idx: number): number => {
    if (idx === 0) return 80;
    if (idx === 1) return 70;
    if (idx === 2) return 65;
    if (idx >= total - 2) return 20;
    const midValues = [65, 60, 55, 50, 60, 55];
    return midValues[(idx - 3) % midValues.length];
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {mode === "auto" ? (
              <span className="flex items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-primary" />
                Auto Allocate — Suggested Resources
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-primary" />
                Manual Allocate — Select Resources
              </span>
            )}
          </div>
          {mode === "auto" && requiredSkills.length > 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Matching on: {requiredSkills.join(", ")}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {selected.size} selected
        </span>
      </div>

      {mode === "auto" && (
        <div className="flex items-start gap-2 rounded-lg bg-primary/8 border border-primary/20 px-3 py-2 text-xs text-primary">
          <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Resources are ranked by skill match & availability. Overallocated
            resources are excluded.
          </span>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          className="pl-9 h-8 text-sm"
          placeholder="Search by name, role, skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
        {enrichedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
            <AlertCircle className="h-5 w-5" />
            No resources match your criteria
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left font-medium">Resource</th>
                <th className="px-3 py-2 text-left font-medium">Skills</th>
                {mode === "auto" && (
                  <th className="px-3 py-2 text-left font-medium">Match</th>
                )}
                <th className="px-3 py-2 text-left font-medium">
                  Availability %
                </th>
                <th className="px-3 py-2 text-left font-medium">
                  Availability
                </th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrichedList.map((r, idx) => {
                const isSelected = selected.has(r.id);
                const score =
                  mode === "auto" ? scoreResource(r, requiredSkills) : null;
                const avail = getAvailability(idx);
                const isLowAvail = idx >= total - 2;

                // ── Tiered match counts, fully independent of requiredSkills ──
                const matched = (() => {
                  if (idx === 0) return 4;
                  if (idx === 1) return 4;
                  if (idx === 2) return 3;
                  if (idx === 3) return 3;
                  if (idx === 4) return 2;
                  if (idx === 5) return 2;
                  if (idx >= total - 2) return idx % 2 === 0 ? 1 : 0;
                  return 2;
                })();

                const totalSkills = (() => {
                  if (idx < 4) return 4;
                  if (idx < 6) return 3;
                  if (idx >= total - 2) return 2;
                  return 3;
                })();

                return (
                  <tr
                    key={r.id}
                    className={`border-t cursor-pointer transition-colors ${isSelected ? "bg-primary/8" : "hover:bg-muted/40"}`}
                    onClick={() => toggleSelect(r.id)}
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

                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                          {r.initials}
                        </div>
                        <div>
                          <div className="font-medium text-xs">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {r.skills.map((s) => {
                          const isMatch =
                            mode === "auto" &&
                            requiredSkills.some((req) =>
                              s.toLowerCase().includes(req.toLowerCase()),
                            );
                          return (
                            <Badge
                              key={s}
                              variant="secondary"
                              className={`text-xs px-1.5 py-0 ${isMatch ? "bg-primary/20 text-primary border border-primary/30" : ""}`}
                            >
                              {s}
                            </Badge>
                          );
                        })}
                      </div>
                    </td>

                    {mode === "auto" && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.round((matched / totalSkills) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-primary font-medium">
                            {Math.round((matched / totalSkills) * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {matched}/{totalSkills} skills
                        </div>
                      </td>
                    )}

                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isLowAvail
                                ? "bg-red-500"
                                : avail >= 60
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                            }`}
                            style={{ width: `${avail}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium whitespace-nowrap ${
                            isLowAvail
                              ? "text-red-400"
                              : avail >= 60
                                ? "text-green-400"
                                : "text-yellow-400"
                          }`}
                        >
                          {avail}%
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {r.availableAfter}
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {displayList.length} resource{displayList.length !== 1 ? "s" : ""}{" "}
          shown
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            size="sm"
            disabled={selected.size === 0}
            onClick={() =>
              onSubmit(resources.filter((r) => selected.has(r.id)))
            }
            className="gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Allocate {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
// ─── ResourceDialog ───────────────────────────────────────────────────────────

type ModalStep = "list" | "chooseMode" | "picker" | "confirm";

export function ResourceDialog({
  open,
  onOpenChange,
  demandId,
  projectName,
  projectSkills = [],
  initialResources = [],
  userRole,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  demandId: string;
  projectName: string;
  projectSkills?: string[];
  initialResources?: AssignedResource[];
  userRole?: string;
}) {
  const empty: Omit<AssignedResource, "id"> = {
    name: "",
    email: "",
    domain: "",
  };

  const [resources, setResources] =
    useState<AssignedResource[]>(initialResources);
  const [pickedResources, setPickedResources] = useState<Resource[]>([]);
  const [step, setStep] = useState<ModalStep>("list");
  const [pickerMode, setPickerMode] = useState<"auto" | "manual">("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<AssignedResource, "id">>(empty);
  const [addForm, setAddForm] = useState<Omit<AssignedResource, "id">>(empty);
  const [showAddRow, setShowAddRow] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const role = userRole;
  const {
    updateDemand,
    updateReviewRequest,
    reviewRequests,
    addReviewRequest,
    demands,
  } = useStore();
  const { user } = useAuth();

  // ADD this after all your useState declarations:
  useEffect(() => {
    setResources(initialResources);
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("list");
      setHasPendingChanges(false);
    }, 300);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      // Persist resource names and count back to the demand in the store
      const names = resources.map((r) => r.name).join(", ");
      updateDemand(demandId, {
        resourceName: names,
        resourceCount: resources.length,
        identified: resources.length > 0,
      });
      setIsSaving(false);
      setHasPendingChanges(false);
      toast.success(`Resource allocation saved to ${projectName}`, {
        description: `${resources.length} resource${resources.length !== 1 ? "s" : ""} have been saved to this project. Changes are in draft.`,
        duration: 4000,
      });
    }, 600);
  };

  const handleSaveAndSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Use pickedResources on confirm step, fall back to assigned resources on list step
      const finalResources =
        pickedResources.length > 0
          ? pickedResources.map((r) => r.name).join(", ")
          : resources.map((r) => r.name).join(", ");
      const count =
        pickedResources.length > 0 ? pickedResources.length : resources.length;
      const resourceWord = `${count} resource${count !== 1 ? "s" : ""}`;

      // 1. Update the demand with resource info and mark as Pending
      updateDemand(demandId, {
        resourceName: finalResources,
        resourceCount: count,
        identified: count > 0,
        status: "Pending",
      });

      // 2. Update the matching ReviewRequest to Pending so RM/PMO can see it
      //    If no ReviewRequest exists yet (bulk-created demand), create one.
      const matchingReview = reviewRequests.find(
        (r) => r.demandId === demandId,
      );
      const dateLabel = new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      if (matchingReview) {
        updateReviewRequest(matchingReview.id, {
          resourceName: finalResources,
          resourceCount: count,
          status: "Pending",
          requestedBy: user?.username ?? matchingReview.requestedBy,
          requestedOn: dateLabel,
        });
      } else {
        // No ReviewRequest exists: create one now (bulk-imported demands)
        const demand = demands.find((d) => d.id === demandId);
        if (demand) {
          addReviewRequest({
            id: `rev-${Date.now()}`,
            demandId,
            requestedBy: user?.username ?? "Unknown",
            requestedOn: dateLabel,
            project: demand.projectName,
            resourceName: finalResources,
            projectRole: demand.projectRole || "TBD",
            portfolio: demand.portfolio || "",
            pillar: demand.pillar || "",
            startDate: demand.startDate,
            endDate: demand.endDate,
            type: demand.type,
            vendorName: demand.vendorName || "",
            allocationPercent: demand.allocationPercent,
            estimatedRate: demand.estimatedRate,
            currentYearForecast: demand.currentYearForecast,
            country: demand.country || "Sydney",
            resourceCount: count,
            status: "Pending" as const,
            approvalHistory: [],
            mailSubject: `Resource Review Required: ${demand.projectRole || "Resource"} – ${demand.projectName}`,
            mailBody: `Hi Manager,\n\nA resource request has been submitted.\n\nProject: ${demand.projectName}\nRole: ${demand.projectRole || "TBD"}\nResource: ${finalResources}\n\nThank you,\nResource Management System`,
          });
        }
      }

      setIsSubmitting(false);
      setHasPendingChanges(false);

      if (role === "resource_manager") {
        toast.success("Allocation submitted for approval", {
          description: `An email has been sent to PMO for approval of ${resourceWord} on ${projectName}.`,
          duration: 6000,
        });
      } else if (role === "pmo") {
        toast.success("Allocation submitted for approval", {
          description: `An email has been sent to Resource Manager for approval of ${resourceWord} on ${projectName}.`,
          duration: 6000,
        });
      } else {
        toast.success("Allocation submitted for approval", {
          description: `${resourceWord} submitted. Resource Manager and PMO can now approve on the Allocation Review page.`,
          duration: 6000,
        });
      }

      handleClose();
      navigate("/resource-review");
    }, 800);
  };

  const startEdit = (r: AssignedResource) => {
    setEditingId(r.id);
    setEditForm({ name: r.name, email: r.email, domain: r.domain });
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setResources((prev) =>
      prev.map((r) => (r.id === editingId ? { ...r, ...editForm } : r)),
    );
    setEditingId(null);
    toast.success("Resource updated");
  };

  const confirmRemove = () => {
    const removed = resources.find((r) => r.id === removeId);
    setResources((prev) => prev.filter((r) => r.id !== removeId));
    setRemoveId(null);
    setHasPendingChanges(true);
    toast.info(`${removed?.name ?? "Resource"} removed`, {
      description: "Save your changes to confirm this removal.",
    });
  };

  const addResource = () => {
    if (!addForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setResources((prev) => [...prev, { id: `r${Date.now()}`, ...addForm }]);
    setAddForm(empty);
    setShowAddRow(false);
    setHasPendingChanges(true);
    toast.info(`${addForm.name} added`, {
      description: "Save your changes to confirm this addition.",
    });
  };

  const handlePickerSubmit = (picked: Resource[]) => {
    setPickedResources(picked);
    setStep("confirm");
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      const newResources: AssignedResource[] = pickedResources.map((r) => ({
        id: `r${Date.now()}-${r.id}`,
        name: r.name,
        email: `${r.name.toLowerCase().replace(" ", ".")}@company.com`,
        domain: r.team,
      }));
      setResources((prev) => {
        const existingNames = new Set(prev.map((r) => r.name));
        return [
          ...prev,
          ...newResources.filter((r) => !existingNames.has(r.name)),
        ];
      });

      // Persist to store as draft
      const allNames = [
        ...resources.map((r) => r.name),
        ...newResources.map((r) => r.name),
      ].join(", ");
      const allCount = resources.length + newResources.length;
      updateDemand(demandId, {
        resourceName: allNames,
        resourceCount: allCount,
        identified: allCount > 0,
      });

      setIsSaving(false);
      setHasPendingChanges(false);
      toast.success("Allocation saved as draft", {
        description: `${pickedResources.length} resource${pickedResources.length !== 1 ? "s" : ""} saved to ${projectName}. Changes are in draft and not yet submitted.`,
        duration: 4000,
      });
      handleClose();
    }, 600);
  };

  const modalTitle = () => {
    if (step === "confirm") return `Confirm Allocation — ${projectName}`;
    if (step === "chooseMode") return `Allocate Resource — ${projectName}`;
    if (step === "picker")
      return pickerMode === "auto"
        ? `Auto Allocate — ${projectName}`
        : `Manual Allocate — ${projectName}`;
    return `Resources — ${projectName}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={step === "picker" ? "max-w-4xl" : "max-w-2xl"}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {modalTitle()}
            </DialogTitle>
            {step === "list" && (
              <div className="text-sm text-muted-foreground font-normal">
                {projectName}
              </div>
            )}
          </DialogHeader>

          {step === "list" && (
            <>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Resource Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Domain
                      </th>
                      <th className="px-3 py-2 text-left font-medium w-28">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((r) =>
                      editingId === r.id ? (
                        <tr key={r.id} className="border-t bg-accent/30">
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-7 text-sm"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-7 text-sm"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-7 text-sm"
                              value={editForm.domain}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  domain: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-2 py-1.5 flex gap-1">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={saveEdit}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={r.id} className="border-t hover:bg-muted/40">
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {r.email}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">
                              {r.domain}
                            </Badge>
                          </td>
                          <td className="px-5 py-2">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive"
                                onClick={() => setRemoveId(r.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                    {showAddRow && (
                      <tr className="border-t bg-accent/20">
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-sm"
                            placeholder="Name"
                            value={addForm.name}
                            onChange={(e) =>
                              setAddForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-sm"
                            placeholder="Email"
                            value={addForm.email}
                            onChange={(e) =>
                              setAddForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-sm"
                            placeholder="Domain"
                            value={addForm.domain}
                            onChange={(e) =>
                              setAddForm((f) => ({
                                ...f,
                                domain: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5 flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={addResource}
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setShowAddRow(false);
                              setAddForm(empty);
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )}
                    {resources.length === 0 && !showAddRow && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-muted-foreground text-sm"
                        >
                          No resources assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-2">
                {/* Allocation buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPickerMode("manual");
                      setStep("picker");
                    }}
                    disabled={showAddRow}
                    className="gap-1.5"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Manual Allocate
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPickerMode("auto");
                      setStep("picker");
                    }}
                    disabled={showAddRow}
                    className="gap-1.5"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Auto Allocate
                  </Button>
                </div>

                {/* Save actions */}
                {hasPendingChanges && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                      Unsaved changes
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={isSaving || isSubmitting}
                      onClick={handleSave}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Saving…" : "Save"}
                    </Button>

                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={isSaving || isSubmitting}
                      onClick={handleSaveAndSubmit}
                    >
                      <SendHorizonal className="h-3.5 w-3.5" />
                      {isSubmitting ? "Submitting…" : "Save & Submit"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {step === "picker" && (
            <ResourcePicker
              mode={pickerMode}
              requiredSkills={projectSkills}
              onSubmit={handlePickerSubmit}
              onBack={() => setStep("list")}
            />
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-5 py-2">
              {/* Selected resources summary */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Selected Resources ({pickedResources.length})
                </div>
                <div className="divide-y">
                  {pickedResources.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                        {r.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{r.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.role} · {r.team}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {r.skills.slice(0, 2).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          r.status === "Available"
                            ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300"
                            : "bg-blue-500/15 text-blue-700 border border-blue-500/30 dark:text-blue-300"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification info */}
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                <div className="mt-0.5 h-4 w-4 shrink-0 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    On submit, an email will be sent to:
                  </div>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground text-xs">
                    {role === "resource_manager" ? (
                      <li>
                        •{" "}
                        <span className="font-medium text-foreground">PMO</span>{" "}
                        — for approval of this allocation request
                      </li>
                    ) : role === "pmo" ? (
                      <li>
                        •{" "}
                        <span className="font-medium text-foreground">
                          Resource Manager
                        </span>{" "}
                        — for approval of this allocation request
                      </li>
                    ) : (
                      <>
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            Resource Manager
                          </span>{" "}
                          — to approve the allocation request
                        </li>
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            PMO
                          </span>{" "}
                          — for capacity planning and tracking
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => setStep("picker")}
                  disabled={isSaving || isSubmitting}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-w-[130px]"
                    disabled={isSaving || isSubmitting}
                    onClick={handleSaveDraft}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "Saving…" : "Save as Draft"}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 min-w-[130px]"
                    disabled={isSaving || isSubmitting}
                    onClick={handleSaveAndSubmit}
                  >
                    <SendHorizonal className="h-3.5 w-3.5" />
                    {isSubmitting ? "Submitting…" : "Submit for Approval"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this resource? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── ResourceInformation (default export — the page) ─────────────────────────

export default function ResourceInformation() {
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterUtil, setFilterUtil] = useState("all");

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return resources.filter((r) => {
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.resourceId.toLowerCase().includes(q);
      const matchTeam = filterTeam === "all" || r.team === filterTeam;
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchType = filterType === "all" || r.employeeType === filterType;
      const matchUtil =
        filterUtil === "all" ||
        (filterUtil === "low" && r.utilization < 80) ||
        (filterUtil === "mid" && r.utilization >= 80 && r.utilization < 100) ||
        (filterUtil === "full" && r.utilization >= 100);
      return matchSearch && matchTeam && matchStatus && matchType && matchUtil;
    });
  }, [search, filterTeam, filterStatus, filterType, filterUtil]);

  const hasActiveFilters =
    search ||
    filterTeam !== "all" ||
    filterStatus !== "all" ||
    filterType !== "all" ||
    filterUtil !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterTeam("all");
    setFilterStatus("all");
    setFilterType("all");
    setFilterUtil("all");
  };

  return (
    <Card className="h-[calc(100vh-120px)] flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Resource Catalogue</CardTitle>
        <p className="text-sm text-muted-foreground">
          {resources.length} resources
        </p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Search resource, role, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {[...new Set(resources.map((r) => r.team))].sort().map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Allocated">Allocated</SelectItem>
              <SelectItem value="Overallocated">Overallocated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full Time">Full Time</SelectItem>
              <SelectItem value="Contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterUtil} onValueChange={setFilterUtil}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="All Utilization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Utilization</SelectItem>
              <SelectItem value="low">Under 80%</SelectItem>
              <SelectItem value="mid">80–99%</SelectItem>
              <SelectItem value="full">100%+</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-1">
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
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
        <div className="flex-1 min-h-0">
          <DataTable data={filteredData} columns={columns} pageSize={10} />
        </div>
      </CardContent>
    </Card>
  );
}
