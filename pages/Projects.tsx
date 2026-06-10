import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Users,
  ClipboardList,
  Check,
  UserCheck,
  Info,
  ArrowLeft,
  Send,
  Edit2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePillarFilter } from "@/hooks/usePillarFilter";
import {
  type ProjectResource,
  type Project,
  projectData,
  PROGRESS_RANGES,
} from "@/mocks/projects";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "Not Assigned" | "Assigned" | "Awaiting Approval";

interface Task {
  id: string;
  type: string;
  task: string;
  assignedResources: string[];
  status: TaskStatus;
}

type TaskMap = Record<string, Task[]>;

interface PanelState {
  resource: boolean;
  task: boolean;
}

type Filters = {
  search: string;
  status: string;
  priority: string;
  client: string;
  progressRange: string;
};

interface AssignmentDialogState {
  open: boolean;
  projectId: string;
  projectName: string;
  selectedTaskIds: string[];
  tasks: Task[];
  comments?: string;
}

// ---------------------------------------------------------------------------
// Constants / mock task generator
// ---------------------------------------------------------------------------

const CURRENT_USER = {
  name: "Tracey Warren",
  role: "Cloud Architect",
  initials: "TW",
  skills: ["AWS", "Terraform", "Azure"],
};

const TASK_TEMPLATES: { type: string; tasks: string[] }[] = [
  {
    type: "Development",
    tasks: [
      "API Integration",
      "Authentication Setup",
      "UI Development",
      "Bug Fixing",
      "Database Schema Design",
    ],
  },
  {
    type: "Testing",
    tasks: [
      "Test Case Creation",
      "Regression Testing",
      "API Validation",
      "Performance Testing",
    ],
  },
  {
    type: "Architecture",
    tasks: [
      "Cloud Architecture Design",
      "Security Review",
      "Infrastructure Planning",
    ],
  },
  {
    type: "Documentation",
    tasks: [
      "Technical Documentation",
      "User Manual Creation",
      "API Reference Guide",
    ],
  },
  {
    type: "Deployment",
    tasks: [
      "CI/CD Pipeline Setup",
      "Production Deployment",
      "Environment Configuration",
    ],
  },
  {
    type: "QA",
    tasks: [
      "QA Planning",
      "Test Automation",
      "Defect Triage",
      "Release Sign-off",
    ],
  },
  {
    type: "Review",
    tasks: ["Peer Code Review", "Security Code Audit", "Design Review"],
  },
];

function generateTasks(projectId: string): Task[] {
  const tasks: Task[] = [];
  let tid = 1;
  for (const tt of TASK_TEMPLATES) {
    for (const t of tt.tasks.slice(0, Math.ceil(tt.tasks.length * 0.65))) {
      tasks.push({
        id: `${projectId}-T${String(tid).padStart(3, "0")}`,
        type: tt.type,
        task: t,
        assignedResources: [],
        status: "Not Assigned",
      });
      tid++;
    }
  }
  return tasks.slice(0, 12);
}

function buildInitialTasks(projects: Project[]): TaskMap {
  const map: TaskMap = {};
  for (const p of projects) {
    map[p.id] = generateTasks(p.id);
  }
  if (map["P-001"]) {
    map["P-001"][0].assignedResources = ["Tracey Warren"];
    map["P-001"][0].status = "Awaiting Approval";
    map["P-001"][1].assignedResources = ["Kiran Patel"];
    map["P-001"][1].status = "Assigned";
    map["P-001"][2].assignedResources = ["Kiran Patel"];
    map["P-001"][2].status = "Assigned";
  }
  return map;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (dateString: string) => {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return dateString;
  return parsed.toISOString().split("T")[0];
};

const inProgressRange = (progress: number, range: string): boolean => {
  if (range === "all") return true;
  if (range === "0") return progress === 0;
  if (range === "100") return progress === 100;
  const [min, max] = range.split("-").map(Number);
  return progress >= min && progress <= max;
};

// ---------------------------------------------------------------------------
// Badge components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Active"
      ? "bg-green-500/20 text-green-700 border-green-500/40 dark:text-green-300"
      : "bg-orange-500/20 text-orange-700 border-orange-500/40 dark:text-orange-300";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === "High"
      ? "bg-red-500/20 text-red-700 border-red-500/40 dark:text-red-300"
      : priority === "Medium"
        ? "bg-yellow-400/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-300"
        : "bg-green-500/20 text-green-700 border-green-500/40 dark:text-green-300";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {priority}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, string> = {
    "Not Assigned": "bg-slate-500/10 text-muted-foreground border-border",

    Assigned:
      "bg-blue-500/20 text-blue-700 border-blue-500/40 dark:text-blue-300",

    "Awaiting Approval":
      "bg-amber-500/20 text-amber-700 border-amber-500/40 dark:text-amber-300",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${map[status]}`}
    >
      {status}
    </span>
  );
}

function TaskTypeBadge({ type }: { type: string }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-300 whitespace-nowrap">
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ progress }: { progress: number }) {
  const barColor =
    progress > 70
      ? "bg-green-500"
      : progress > 0
        ? "bg-blue-500"
        : "bg-muted-foreground/30";
  const textColor = progress > 70 ? "text-green-400" : "text-blue-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{progress}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter select
// ---------------------------------------------------------------------------

function FilterSelect({
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  const isActive = value !== "" && value !== "all";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-10 pl-3 pr-8 rounded-lg border text-sm font-medium cursor-pointer transition-colors outline-none
          ${
            isActive
              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
              : "bg-card border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
          }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resource multi-select dropdown
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Resource panel (left side)
// ---------------------------------------------------------------------------

function ResourcePanel({
  project,
  tasks,
  onAssignTask,
}: {
  project: Project;
  tasks: Task[];
  onAssignTask: (resourceName: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Resource Information
        </span>
        <span className="ml-auto text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-medium">
          {project.resources.length} members
        </span>
      </div>
      <div className="rounded-lg border border-border/50 overflow-hidden flex-1">
        <div className="h-full overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[380px]">
            <thead className="bg-muted/20">
              <tr className="text-left">
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Resource
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Designation
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Tasks
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Start Date
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody>
              {project.resources.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-sm text-muted-foreground italic text-center"
                  >
                    No resources assigned
                  </td>
                </tr>
              ) : (
                project.resources.map((resource) => {
                  const assigned = tasks.filter((t) =>
                    t.assignedResources.includes(resource.resourceName),
                  );
                  return (
                    <tr
                      key={resource.resourceId}
                      className="border-t border-border/50"
                    >
                      <td className="p-3">
                        <div className="font-medium text-sm">
                          {resource.resourceName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {resource.resourceId}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {resource.designation}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 items-center">
                          {assigned.length === 0 ? (
                            <span className="text-[10px] text-muted-foreground italic">
                              No task assigned
                            </span>
                          ) : (
                            assigned.map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              >
                                {t.task}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {resource.allocationStart}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {resource.allocationEnd}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task panel (right side)
// ---------------------------------------------------------------------------

function TaskPanel({
  project,
  tasks,
  selectedTaskIds,
  onTasksChange,
  onSelectionChange,
  onAssignToMe,
}: {
  project: Project;
  tasks: Task[];
  selectedTaskIds: string[];
  onTasksChange: (tasks: Task[]) => void;
  onSelectionChange: (ids: string[]) => void;
  onAssignToMe: () => void;
}) {
  const allSelected =
    tasks.length > 0 && selectedTaskIds.length === tasks.length;

  const toggleSelectAll = (checked: boolean) =>
    onSelectionChange(checked ? tasks.map((t) => t.id) : []);

  const toggleRow = (id: string) =>
    onSelectionChange(
      selectedTaskIds.includes(id)
        ? selectedTaskIds.filter((s) => s !== id)
        : [...selectedTaskIds, id],
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Task Allocation
        </span>
        <span className="ml-auto text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-medium">
          {tasks.length} tasks
        </span>
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden flex-1">
        <div className="h-full overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="bg-muted/20">
              <tr className="text-left">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Type
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Task
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Assigned
                </th>
                <th className="p-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`border-t border-border/50 transition-colors ${
                    selectedTaskIds.includes(task.id)
                      ? "bg-blue-500/5"
                      : "hover:bg-accent/10"
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleRow(task.id)}
                      className="rounded accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <TaskTypeBadge type={task.type} />
                  </td>
                  <td className="p-3 text-xs font-medium whitespace-nowrap">
                    {task.task}
                  </td>
                  <td className="p-3 min-w-[180px]">
                    <select
                      value={task.assignedResources[0] || ""}
                      onChange={(e) => {
                        const selectedPerson = e.target.value;

                        const updatedTasks = tasks.map((t) =>
                          t.id === task.id
                            ? {
                                ...t,
                                assignedResources: selectedPerson
                                  ? [selectedPerson]
                                  : [],
                                status: (selectedPerson
                                  ? "Assigned"
                                  : "Not Assigned") as TaskStatus,
                              }
                            : t,
                        );

                        onTasksChange(updatedTasks);
                      }}
                      className="w-full h-8 px-2 text-xs border border-border rounded-md bg-background"
                    >
                      <option value="">Select Resource</option>

                      {project.resources.map((resource) => (
                        <option
                          key={resource.resourceId}
                          value={resource.resourceName}
                        >
                          {resource.resourceName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <TaskStatusBadge
                      status={
                        task.assignedResources.length > 0
                          ? "Assigned"
                          : "Not Assigned"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign To Me button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={onAssignToMe}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Save
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Split panel (side-by-side container)
// ---------------------------------------------------------------------------

function SplitPanel({
  showResource,
  showTask,
  resourceContent,
  taskContent,
}: {
  showResource: boolean;
  showTask: boolean;
  resourceContent: React.ReactNode;
  taskContent: React.ReactNode;
}) {
  const bothOpen = showResource && showTask;
  const onlyResource = showResource && !showTask;
  const onlyTask = !showResource && showTask;

  return (
    <div
      className={`flex gap-4 ${bothOpen ? "flex-col md:flex-row" : "flex-col"}`}
    >
      {showResource && (
        <div className={bothOpen ? "w-full md:w-1/2" : "w-full"}>
          <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
            {resourceContent}
          </div>
        </div>
      )}
      {showTask && (
        <div className={bothOpen ? "w-full md:w-1/2" : "w-full"}>
          <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
            {taskContent}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assignment confirmation dialog
// ---------------------------------------------------------------------------

function AssignmentDialog({
  state,
  onBack,
  onSubmit,
  onCommentChange,
}: {
  state: AssignmentDialogState;
  onBack: () => void;
  onSubmit: () => void;
  onCommentChange: (value: string) => void;
}) {
  const selectedTasks = state.tasks.filter((t) =>
    state.selectedTaskIds.includes(t.id),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                Confirm Task Assignment
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {state.projectName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Selected tasks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Selected Tasks
              </span>
              <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 rounded-full px-2 py-0.5 font-semibold">
                {selectedTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Type: {task.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned user */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-3">
              Assigned To
            </span>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {CURRENT_USER.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{CURRENT_USER.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {CURRENT_USER.role}
                </p>
              </div>
              <div className="flex gap-1">
                {CURRENT_USER.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/15 text-muted-foreground border border-border/50 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-medium whitespace-nowrap">
                Assigned
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Comments
              </span>
              <span className="text-[10px] text-muted-foreground">
                Optional
              </span>
            </div>

            <textarea
              value={state.comments || ""}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add comments for the Project Manager (task context, dependencies, priority, blockers, etc.)"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-muted-foreground"
            />

            <p className="text-[11px] text-muted-foreground mt-1">
              These comments will be included in the approval request.
            </p>
          </div>

          {/* Approval info */}
          <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                  On submit, an approval request will be sent to:
                </p>
                <ul className="space-y-1">
                  <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                    Project/Reporting Manager — to approve and align assignment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={onSubmit}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Projects() {
  const { filterByPillar } = usePillarFilter();
  const visibleProjects = filterByPillar(projectData);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    priority: "",
    client: "",
    progressRange: "all",
  });

  // Per-project panel state
  const [expandedPanels, setExpandedPanels] = useState<
    Record<string, PanelState>
  >({});

  // Per-project task data
  const [tasks, setTasks] = useState<TaskMap>(() =>
    buildInitialTasks(visibleProjects),
  );

  // Per-project selected task IDs
  const [selectedTasks, setSelectedTasks] = useState<Record<string, string[]>>(
    {},
  );

  // Toast
  const [toast, setToast] = useState({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Assignment dialog
  const [assignDialog, setAssignDialog] =
    useState<AssignmentDialogState | null>(null);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3000,
    );
  }, []);

  const setFilter = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({
      search: "",
      status: "",
      priority: "",
      client: "",
      progressRange: "all",
    });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.client) count++;
    if (filters.progressRange !== "all") count++;
    return count;
  }, [filters]);

  const uniqueClients = useMemo(
    () => Array.from(new Set(visibleProjects.map((p) => p.client))).sort(),
    [visibleProjects],
  );

  const filtered = useMemo(
    () =>
      visibleProjects.filter((p) => {
        const q = filters.search.toLowerCase();
        if (
          q &&
          !p.project.toLowerCase().includes(q) &&
          !p.client.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)
        )
          return false;
        if (filters.status && p.status !== filters.status) return false;
        if (filters.priority && p.priority !== filters.priority) return false;
        if (filters.client && p.client !== filters.client) return false;
        if (!inProgressRange(p.progress, filters.progressRange)) return false;
        return true;
      }),
    [filters, visibleProjects],
  );

  // Panel toggle helpers
  const toggleResourcePanel = (pid: string) =>
    setExpandedPanels((prev) => ({
      ...prev,
      [pid]: { resource: !prev[pid]?.resource, task: prev[pid]?.task ?? false },
    }));

  const toggleTaskPanel = (pid: string) =>
    setExpandedPanels((prev) => ({
      ...prev,
      [pid]: { resource: prev[pid]?.resource ?? false, task: !prev[pid]?.task },
    }));

  const collapseAll = (pid: string) =>
    setExpandedPanels((prev) => ({
      ...prev,
      [pid]: { resource: false, task: false },
    }));

  const openTaskPanelForResource = (pid: string) =>
    setExpandedPanels((prev) => ({
      ...prev,
      [pid]: { resource: prev[pid]?.resource ?? true, task: true },
    }));

  const updateProjectTasks = (pid: string, updated: Task[]) =>
    setTasks((prev) => ({ ...prev, [pid]: updated }));

  const updateSelectedTasks = (pid: string, ids: string[]) =>
    setSelectedTasks((prev) => ({ ...prev, [pid]: ids }));

  const handleAssignToMe = (project: Project) => {
    const pid = project.id;
    const sel = selectedTasks[pid] ?? [];
    if (!sel.length) {
      showToast("Select at least one task first");
      return;
    }
    const projectTasks = tasks[pid] ?? [];
    setAssignDialog({
      open: true,
      projectId: pid,
      projectName: project.project,
      selectedTaskIds: sel,
      tasks: projectTasks,
    });
  };

  const handleCommentChange = (value: string) => {
    setAssignDialog((prev) =>
      prev
        ? {
            ...prev,
            comments: value,
          }
        : prev,
    );
  };

  const handleDialogSubmit = () => {
    if (!assignDialog) return;

    const { projectId, selectedTaskIds } = assignDialog;

    updateProjectTasks(
      projectId,
      (tasks[projectId] ?? []).map((t) => {
        if (!selectedTaskIds.includes(t.id)) return t;

        const resources = t.assignedResources.includes(CURRENT_USER.name)
          ? t.assignedResources
          : [...t.assignedResources, CURRENT_USER.name];

        return {
          ...t,
          assignedResources: resources,
          status: "Awaiting Approval",
        };
      }),
    );

    updateSelectedTasks(projectId, []);
    setAssignDialog(null);

    showToast("Tasks submitted for approval");

    // Navigate to TaskReviewApproval page
    navigate("/task-review-approval");
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col">
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-base">Project Portfolio</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filtered.length} projects
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col flex-1 min-h-0 gap-4">
            {/* Search + Filters */}
            <div className="shrink-0 flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-3 h-12 gap-2 min-w-[350px]">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                <input
                  value={filters.search}
                  onChange={(e) => setFilter("search")(e.target.value)}
                  placeholder="Search project, client or ID..."
                  className="bg-transparent outline-none w-full text-sm"
                />

                {filters.search && (
                  <button onClick={() => setFilter("search")("")}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}

                <span className="text-xs text-muted-foreground whitespace-nowrap pl-3 border-l border-border">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-nowrap">
                <FilterSelect
                  label="All Statuses"
                  value={filters.status}
                  onChange={setFilter("status")}
                  options={[
                    { label: "All Statuses", value: "" },
                    { label: "Active", value: "Active" },
                    { label: "Planning", value: "Planning" },
                  ]}
                />

                <FilterSelect
                  label="All Priorities"
                  value={filters.priority}
                  onChange={setFilter("priority")}
                  options={[
                    { label: "All Priorities", value: "" },
                    { label: "High", value: "High" },
                    { label: "Medium", value: "Medium" },
                    { label: "Low", value: "Low" },
                  ]}
                />

                <FilterSelect
                  label="All Clients"
                  value={filters.client}
                  onChange={setFilter("client")}
                  options={[
                    { label: "All Clients", value: "" },
                    ...uniqueClients.map((c) => ({ label: c, value: c })),
                  ]}
                />

                <FilterSelect
                  label="All Progress"
                  value={filters.progressRange}
                  onChange={setFilter("progressRange")}
                  options={PROGRESS_RANGES}
                />

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors whitespace-nowrap"
                  >
                    <X className="h-3 w-3" />
                    Clear
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {activeFilterCount}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 border border-border rounded-xl overflow-hidden">
              <div className="h-full overflow-y-auto overflow-x-auto">
                <table className="w-full text-sm min-w-[1020px]">
                  <thead className="sticky top-0 z-20 bg-card border-b border-border">
                    <tr className="text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        ID
                      </th>
                      <th className="px-4 py-3 font-medium normal-case w-[22%]">
                        Project
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Priority
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Budget
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Budget Hours
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Start
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        End
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Team Size
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Progress
                      </th>
                      <th className="px-4 py-3 font-medium normal-case whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="py-16 text-center text-sm text-muted-foreground"
                        >
                          No projects match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((project) => {
                        const panels = expandedPanels[project.id] ?? {
                          resource: false,
                          task: false,
                        };
                        const anyOpen = panels.resource || panels.task;
                        const projectTasks = tasks[project.id] ?? [];
                        const projectSelectedTasks =
                          selectedTasks[project.id] ?? [];

                        return (
                          <>
                            {/* Main project row */}
                            <tr
                              key={project.id}
                              className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                            >
                              <td className="p-4 text-sm text-muted-foreground font-medium">
                                {project.id}
                              </td>

                              <td className="p-4">
                                <div className="font-medium text-foreground">
                                  {project.project}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {project.client}
                                </div>
                              </td>

                              <td className="p-4">
                                <StatusBadge status={project.status} />
                              </td>
                              <td className="p-4">
                                <PriorityBadge priority={project.priority} />
                              </td>
                              <td className="p-4 text-sm font-medium">
                                {project.budget}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground text-center">
                                {project.budgetHrs}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(project.start)}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(project.end)}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                {project.teamSize}
                              </td>
                              <td className="p-4">
                                <ProgressBar progress={project.progress} />
                              </td>

                              {/* Actions */}
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  {/* View Resources */}
                                  <div className="relative group">
                                    <button
                                      onClick={() =>
                                        toggleResourcePanel(project.id)
                                      }
                                      className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
                                        panels.resource
                                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                                          : "border-border text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                                      }`}
                                      aria-label="View Resources"
                                    >
                                      <Users className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                      View Resources
                                    </span>
                                  </div>

                                  {/* Allocate Tasks */}
                                  <div className="relative group">
                                    <button
                                      onClick={() =>
                                        toggleTaskPanel(project.id)
                                      }
                                      className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
                                        panels.task
                                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                                          : "border-border text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                                      }`}
                                      aria-label="Allocate Tasks"
                                    >
                                      <ClipboardList className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                      Allocate Tasks
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded split panel */}
                            {anyOpen && (
                              <tr
                                key={`${project.id}-panel`}
                                className="bg-muted/10 border-b border-border/50"
                              >
                                <td />
                                <td colSpan={11} className="p-4">
                                  <SplitPanel
                                    showResource={panels.resource}
                                    showTask={panels.task}
                                    resourceContent={
                                      <ResourcePanel
                                        project={project}
                                        tasks={projectTasks}
                                        onAssignTask={() =>
                                          openTaskPanelForResource(project.id)
                                        }
                                      />
                                    }
                                    taskContent={
                                      <TaskPanel
                                        project={project}
                                        tasks={projectTasks}
                                        selectedTaskIds={projectSelectedTasks}
                                        onTasksChange={(updated) =>
                                          updateProjectTasks(
                                            project.id,
                                            updated,
                                          )
                                        }
                                        onSelectionChange={(ids) =>
                                          updateSelectedTasks(project.id, ids)
                                        }
                                        onAssignToMe={() =>
                                          handleAssignToMe(project)
                                        }
                                      />
                                    }
                                  />
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* Assignment dialog */}
      {assignDialog && (
        <AssignmentDialog
          state={assignDialog}
          onBack={() => setAssignDialog(null)}
          onSubmit={handleDialogSubmit}
          onCommentChange={handleCommentChange}
        />
      )}
    </div>
  );
}
