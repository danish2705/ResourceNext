import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type ObjectType =
  | "Workflow"
  | "Calendar"
  | "Program"
  | "Currency"
  | "Notification"
  | "Users"
  | "Attributes"
  | "Email Templates"
  | "Accounting Calendar"
  | "Monthly Update";

interface WorkflowConfig {
  id: string;
  isActive: boolean;
  name: string;
  description: string;
  sendForApproval: boolean;
  sendForApprovalTo: string;
  notifyOnApprovalDenial: string;
  action?: "edit" | "delete" | null;
}

interface CalendarEntry {
  id: string;
  month: string;
  startDate: string;
  endDate: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const OBJECT_OPTIONS: ObjectType[] = [
  "Workflow",
  "Calendar",
  "Program",
  "Currency",
  "Notification",
  "Users",
  "Attributes",
  "Email Templates",
  "Accounting Calendar",
  "Monthly Update",
];

const initialWorkflows: WorkflowConfig[] = [
  {
    id: "wf-1",
    isActive: true,
    name: "New Demand Creation",
    description:
      "Initiates and routes new project demand requests for review and approval",
    sendForApproval: true,
    sendForApprovalTo: "Rajesh Kumar",
    notifyOnApprovalDenial: "Anurag Vaishy",
  },
  {
    id: "wf-2",
    isActive: false,
    name: "Resource Onboarding Request",
    description:
      "Manages the end-to-end process of onboarding new resources to active projects",
    sendForApproval: false,
    sendForApprovalTo: "Priya Sharma",
    notifyOnApprovalDenial: "Samson Karre",
  },
  {
    id: "wf-3",
    isActive: false,
    name: "Allocation Change Request",
    description:
      "Handles requests to modify existing resource allocations across projects",
    sendForApproval: true,
    sendForApprovalTo: "Michael Torres",
    notifyOnApprovalDenial: "Sameera Mohamed",
  },
  {
    id: "wf-4",
    isActive: false,
    name: "Budget Overrun Escalation",
    description:
      "Escalates and tracks projects that have exceeded their approved budget threshold",
    sendForApproval: true,
    sendForApprovalTo: "Sarah Mitchell",
    notifyOnApprovalDenial: "Kartik Dontula",
  },
  {
    id: "wf-5",
    isActive: false,
    name: "Vendor Engagement Approval",
    description:
      "Governs the approval process for initiating and renewing vendor engagements",
    sendForApproval: false,
    sendForApprovalTo: "David Nguyen",
    notifyOnApprovalDenial: "Danish Meraj",
  },
  {
    id: "wf-6",
    isActive: true,
    name: "Project Kickoff Sign-off",
    description:
      "Ensures all stakeholders formally sign off before a project moves to execution",
    sendForApproval: true,
    sendForApprovalTo: "Anita Desai",
    notifyOnApprovalDenial: "Betty Smith",
  },
  {
    id: "wf-7",
    isActive: false,
    name: "Monthly Capacity Review",
    description:
      "Facilitates monthly review of team capacity against planned project demand",
    sendForApproval: true,
    sendForApprovalTo: "James Whitfield",
    notifyOnApprovalDenial: "Ravi Patel",
  },
];

const calendarEntries: CalendarEntry[] = [
  { id: "c-1", month: "Jan", startDate: "01/01/2022", endDate: "01/28/2022" },
  { id: "c-2", month: "Feb", startDate: "01/30/2021", endDate: "02/26/2022" },
  { id: "c-3", month: "March", startDate: "02/27/2022", endDate: "03/26/2022" },
  { id: "c-4", month: "April", startDate: "04/01/2022", endDate: "04/29/2022" },
];

// ─── Workflow Modal ────────────────────────────────────────────────────────────

interface WorkflowModalProps {
  workflow: WorkflowConfig | null;
  onClose: () => void;
  onSave: (wf: WorkflowConfig) => void;
}

function WorkflowModal({ workflow, onClose, onSave }: WorkflowModalProps) {
  const isNew = !workflow?.id || workflow.id === "__new__";
  const [form, setForm] = useState<WorkflowConfig>(
    workflow ?? {
      id: `wf-${Date.now()}`,
      isActive: false,
      name: "",
      description: "",
      sendForApproval: false,
      sendForApprovalTo: "",
      notifyOnApprovalDenial: "",
    },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-md p-6 border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isNew ? "Add Workflow" : "Edit Workflow"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Workflow Name
            </label>
            <input
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Demand Approval – Data"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe what this workflow does"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Notify On Approval / Denial
            </label>
            <input
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.notifyOnApprovalDenial}
              onChange={(e) =>
                setForm({ ...form, notifyOnApprovalDenial: e.target.value })
              }
              placeholder="e.g. Inder Johal"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Is Active
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.sendForApproval}
                onChange={(e) =>
                  setForm({ ...form, sendForApproval: e.target.checked })
                }
              />
              Send For Approval
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={!form.name.trim()}>
            {isNew ? "Add" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ───────────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirm({ name, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-sm p-6 text-center border border-border">
        <div className="flex justify-center mb-3">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Delete Workflow
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">"{name}"</span>? This
          action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Configuration Page ────────────────────────────────────────────────────────

export default function Configuration() {
  const [selectedObject, setSelectedObject] = useState<ObjectType>("Workflow");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] =
    useState<WorkflowConfig[]>(initialWorkflows);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | null>(
    null,
  );
  const [deletingWorkflow, setDeletingWorkflow] =
    useState<WorkflowConfig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleObjectChange = (opt: ObjectType) => {
    setSelectedObject(opt);
    setDropdownOpen(false);
    setIsLoadingSection(true);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(
      () => setIsLoadingSection(false),
      1200,
    );
  };

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  const filtered = workflows.filter(
    (wf) =>
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      wf.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = (wf: WorkflowConfig) => {
    setWorkflows((prev) => {
      const exists = prev.find((w) => w.id === wf.id);
      return exists
        ? prev.map((w) => (w.id === wf.id ? wf : w))
        : [...prev, wf];
    });
    setShowModal(false);
    setEditingWorkflow(null);
  };

  const handleDelete = () => {
    if (!deletingWorkflow) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== deletingWorkflow.id));
    setDeletingWorkflow(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Configuration</h1>
      </div>

      {/* Object Selector */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Object
              </label>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 min-w-[200px] px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring transition"
              >
                <span className="flex-1 text-left">{selectedObject}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1">
                  {OBJECT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        handleObjectChange(opt);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        opt === selectedObject
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-popover-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Panel */}
      {isLoadingSection ? (
        <Card>
          <CardContent className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-9 w-9 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">
              Fetching data from database...
            </p>
          </CardContent>
        </Card>
      ) : selectedObject === "Workflow" ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                Workflow Configuration
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    className="pl-8 pr-3 py-2 border border-input rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56"
                    placeholder="Search workflows..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Add Button */}
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingWorkflow({
                      id: "__new__",
                      isActive: false,
                      name: "",
                      description: "",
                      sendForApproval: false,
                      sendForApprovalTo: "",
                      notifyOnApprovalDenial: "",
                    });
                    setShowModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-10 text-center">
                      Is Active
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Send For Approval</TableHead>
                    <TableHead>Notify On Approval / Denial</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground text-sm"
                      >
                        No workflows found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((wf) => (
                      <TableRow key={wf.id}>
                        {/* Is Active */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary"
                            checked={wf.isActive}
                            onChange={() =>
                              setWorkflows((prev) =>
                                prev.map((w) =>
                                  w.id === wf.id
                                    ? { ...w, isActive: !w.isActive }
                                    : w,
                                ),
                              )
                            }
                          />
                        </TableCell>

                        {/* Name */}
                        <TableCell className="font-medium text-foreground">
                          {wf.name}
                        </TableCell>

                        {/* Description */}
                        <TableCell className="text-muted-foreground">
                          {wf.description}
                        </TableCell>

                        {/* Send For Approval */}
                        <TableCell className="text-foreground">
                          {wf.sendForApprovalTo || "—"}
                        </TableCell>

                        {/* Notify On Approval / Denial */}
                        <TableCell className="text-foreground">
                          {wf.notifyOnApprovalDenial}
                        </TableCell>

                        {/* Action */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingWorkflow(wf);
                                setShowModal(true);
                              }}
                              className="p-1.5 rounded hover:bg-accent text-primary transition"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingWorkflow(wf)}
                              className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 pt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {workflows.length} workflows
            </div>
          </CardContent>
        </Card>
      ) : selectedObject === "Calendar" ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Calendar Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-4">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendarEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-foreground">
                      {entry.month}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.startDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.endDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-14 text-center">
            <Settings className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-foreground font-medium">
              {selectedObject} Configuration
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Configuration options for{" "}
              <span className="font-medium">{selectedObject}</span> will appear
              here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showModal && editingWorkflow && (
        <WorkflowModal
          workflow={editingWorkflow}
          onClose={() => {
            setShowModal(false);
            setEditingWorkflow(null);
          }}
          onSave={handleSave}
        />
      )}

      {deletingWorkflow && (
        <DeleteConfirm
          name={deletingWorkflow.name}
          onCancel={() => setDeletingWorkflow(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
