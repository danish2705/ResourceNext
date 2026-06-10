import { useState, useMemo } from "react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePillarFilter } from "@/hooks/usePillarFilter";
import {
  type ReviewStatus,
  type ApprovalRecord,
  type ReviewRequest,
} from "@/mocks/resourceReview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Users,
  AlertCircle,
  CheckCheck,
  Filter,
  ChevronRight,
  Building2,
  Briefcase,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/auth/useAuth";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getApprovalStage(status: ReviewStatus): "rm" | "pmo" | "done" {
  if (status === "Pending" || status === "Awaiting Approval") return "rm";
  if (status === "RM Approved") return "pmo";
  return "done";
}

function isFinalApproved(status: ReviewStatus) {
  return status === "PMO Approved" || status === "Approved";
}

type BadgeStyle = {
  bg: string;
  text: string;
  border: string;
  Icon: React.FC<{ className?: string }>;
  label: string;
};

const statusStyles: Record<ReviewStatus, BadgeStyle> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    Icon: Clock,
    label: "Pending RM",
  },
  "Awaiting Approval": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    Icon: AlertCircle,
    label: "Awaiting RM",
  },
  "RM Approved": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    Icon: ChevronRight,
    label: "Pending PMO",
  },
  "RM Rejected": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    Icon: XCircle,
    label: "RM Rejected",
  },
  "PMO Approved": {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    Icon: CheckCheck,
    label: "Fully Approved",
  },
  "PMO Rejected": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    Icon: XCircle,
    label: "PMO Rejected",
  },
  Approved: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    Icon: CheckCheck,
    label: "Fully Approved",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    Icon: XCircle,
    label: "Rejected",
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0",
  )}:${String(date.getSeconds()).padStart(2, "0")}`;
};

// ─── Approval Pipeline Stepper ───────────────────────────────────────────────

function ApprovalStepper({ request }: { request: ReviewRequest }) {
  const rmRecord = request.approvalHistory.find(
    (a) => a.role === "Resource Manager",
  );
  const pmoRecord = request.approvalHistory.find((a) => a.role === "PMO");
  const stage = getApprovalStage(request.status);

  const steps = [
    {
      id: "rm",
      label: "Resource Manager",
      icon: <Users className="h-4 w-4" />,
      record: rmRecord,
      state:
        rmRecord?.decision === "Rejected"
          ? "rejected"
          : rmRecord?.decision === "Approved"
            ? "approved"
            : stage === "rm"
              ? "active"
              : "waiting",
    },
    {
      id: "pmo",
      label: "PMO / Project",
      icon: <Briefcase className="h-4 w-4" />,
      record: pmoRecord,
      state:
        pmoRecord?.decision === "Rejected"
          ? "rejected"
          : pmoRecord?.decision === "Approved"
            ? "approved"
            : stage === "pmo"
              ? "active"
              : "waiting",
    },
  ] as const;

  const stepColors = {
    approved: {
      ring: "border-green-500 bg-green-500",
      text: "text-green-600",
      iconColor: "text-white",
    },
    rejected: {
      ring: "border-red-500 bg-red-50",
      text: "text-red-600",
      iconColor: "text-red-500",
    },
    active: {
      ring: "border-blue-500 bg-blue-50",
      text: "text-blue-700",
      iconColor: "text-blue-600",
    },
    waiting: {
      ring: "border-muted-foreground/30 bg-muted/40",
      text: "text-muted-foreground",
      iconColor: "text-muted-foreground/50",
    },
  };

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const colors = stepColors[step.state];
        return (
          <div key={step.id} className="flex items-start gap-0 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${colors.ring}`}
              >
                <span className={colors.iconColor}>{step.icon}</span>
              </div>
              <p
                className={`text-xs font-medium mt-1.5 text-center ${colors.text}`}
              >
                {step.label}
              </p>
              {step.record ? (
                <div className="mt-1 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    {step.record.approver}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateTime(step.record.decidedOn)}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${step.state === "approved" ? "text-green-600" : "text-red-500"}`}
                  >
                    {step.record.decision}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {step.state === "active" ? "Awaiting action" : "Waiting"}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center mt-4 flex-shrink-0 w-10">
                <div
                  className={`h-0.5 w-full ${steps[i].state === "approved" ? "bg-green-400" : "bg-muted"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary card ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResourceReview() {
  const { updateDemand, demands, reviewRequests, updateReviewRequest } =
    useStore();
  const { filterByPillar } = usePillarFilter();
  const { user } = useAuth();

  const baseRequests = useMemo(
    () => filterByPillar(reviewRequests),
    [filterByPillar, reviewRequests],
  );

  const requests = useMemo(() => baseRequests, [baseRequests]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selected, setSelected] = useState<ReviewRequest | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "approve" | "reject">(
    "view",
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mailPreview, setMailPreview] = useState<ReviewRequest | null>(null);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pendingRM: requests.filter(
        (r) => r.status === "Pending" || r.status === "Awaiting Approval",
      ).length,
      pendingPMO: requests.filter((r) => r.status === "RM Approved").length,
      fullyApproved: requests.filter((r) => isFinalApproved(r.status)).length,
      rejected: requests.filter(
        (r) =>
          r.status === "RM Rejected" ||
          r.status === "PMO Rejected" ||
          r.status === "Rejected",
      ).length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        search === "" ||
        r.resourceName.toLowerCase().includes(search.toLowerCase()) ||
        r.project.toLowerCase().includes(search.toLowerCase()) ||
        r.projectRole.toLowerCase().includes(search.toLowerCase()) ||
        r.requestedBy.toLowerCase().includes(search.toLowerCase());

      let matchStatus = statusFilter === "All";
      if (!matchStatus) {
        if (statusFilter === "Pending RM")
          matchStatus =
            r.status === "Pending" || r.status === "Awaiting Approval";
        else if (statusFilter === "Pending PMO")
          matchStatus = r.status === "RM Approved";
        else if (statusFilter === "Fully Approved")
          matchStatus = isFinalApproved(r.status);
        else if (statusFilter === "Rejected")
          matchStatus =
            r.status === "RM Rejected" ||
            r.status === "PMO Rejected" ||
            r.status === "Rejected";
        else matchStatus = r.status === statusFilter;
      }
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const openAction = (
    req: ReviewRequest,
    mode: "view" | "approve" | "reject",
  ) => {
    setSelected(req);
    setDialogMode(mode);
    setComment("");
  };

  // PMO cannot approve before RM approval

  const handleDecision = (decision: "Approved" | "Rejected") => {
    if (!selected) return;
    if (
      user?.role === "pmo" &&
      (selected.status === "Pending" || selected.status === "Awaiting Approval")
    ) {
      toast.error("Resource Manager approval is required before PMO approval.");
      return;
    }
    // Derive stage from the logged-in user's role first so that a PMO user
    // rejecting a "Pending" request correctly records "PMO Rejected" (not
    // "RM Rejected" which the status-based fallback would produce).
    const stageFromRole =
      user?.role === "resource_manager"
        ? "rm"
        : user?.role === "pmo"
          ? "pmo"
          : user?.role === "super_admin"
            ? getApprovalStage(selected.status) === "rm"
              ? "rm"
              : "pmo"
            : null;
    const stage = stageFromRole ?? getApprovalStage(selected.status);
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const approverName =
        user?.username ??
        (stage === "rm" ? "Sarah Mitchell" : "James Thornton");
      const newRecord: ApprovalRecord = {
        approver: approverName,
        role: stage === "rm" ? "Resource Manager" : "PMO",
        decision,
        comment:
          comment || (decision === "Approved" ? "Approved." : "Declined."),
        decidedOn: now,
      };
      let newStatus: ReviewStatus;
      if (stage === "rm")
        newStatus = decision === "Approved" ? "RM Approved" : "RM Rejected";
      else
        newStatus = decision === "Approved" ? "PMO Approved" : "PMO Rejected";

      // Persist to store
      updateReviewRequest(selected.id, {
        status: newStatus,
        approvalHistory: [...selected.approvalHistory, newRecord],
      });

      if (newStatus === "PMO Approved") {
        updateDemand(selected.demandId, {
          status: "Approved",
          comments: `PMO approved: ${newRecord.comment}`,
        });
      } else if (newStatus === "RM Rejected" || newStatus === "PMO Rejected") {
        updateDemand(selected.demandId, {
          status: "Rejected",
          comments: `${newRecord.role} rejected: ${newRecord.comment}`,
        });
      } else if (newStatus === "RM Approved") {
        updateDemand(selected.demandId, {
          status: "RM Approved",
          comments: `Resource Manager approved: ${newRecord.comment}`,
        });
      }

      const stageLabel = stage === "rm" ? "Resource Manager" : "PMO";
      toast.success(
        decision === "Approved"
          ? `${stageLabel} approval recorded. ${stage === "rm" ? "Now awaiting PMO review." : "Request fully approved!"}`
          : `Request declined by ${stageLabel}.`,
      );
      setSelected(null);
      setSubmitting(false);
    }, 600);
  };

  const currentStage = selected ? getApprovalStage(selected.status) : null;
  const stageLabel =
    currentStage === "rm"
      ? "Resource Manager"
      : currentStage === "pmo"
        ? "PMO / Project"
        : "";

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col p-6 gap-6">
      <div className="shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Resource Review
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dual-stage approval: Resource Manager → PMO / Project sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-muted/30 text-sm">
          <div className="flex items-center gap-2 text-amber-600 font-medium">
            <Users className="h-4 w-4" /> Stage 1: Resource Manager
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Building2 className="h-4 w-4" /> Stage 2: PMO / Project
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCheck className="h-4 w-4" /> Fully Approved
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Pending RM Review"
          value={counts.pendingRM}
          icon={<Users className="h-5 w-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <SummaryCard
          label="Pending PMO Review"
          value={counts.pendingPMO}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <SummaryCard
          label="Fully Approved"
          value={counts.fullyApproved}
          icon={<CheckCheck className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
        />
        <SummaryCard
          label="Rejected"
          value={counts.rejected}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          color="bg-red-50"
        />
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <CardTitle className="text-base font-semibold">Requests</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resource, project, role…"
                  className="pl-8 h-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-48 gap-1">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Stage / Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending RM">Pending RM Review</SelectItem>
                  <SelectItem value="Pending PMO">
                    Pending PMO Review
                  </SelectItem>
                  <SelectItem value="Fully Approved">Fully Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-20 bg-background pl-6">
                    Resource
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Project
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Role
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Requested By
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Allocation
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Forecast
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background">
                    Approval Stage
                  </TableHead>

                  <TableHead className="sticky top-0 z-20 bg-background text-center min-w-[300px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No requests match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((req) => {
                  const style = statusStyles[req.status];
                  const stage = getApprovalStage(req.status);
                  const canAct = stage !== "done";

                  const canApprove =
                    (user?.role === "resource_manager" && stage === "rm") ||
                    (user?.role === "pmo" && stage === "pmo") ||
                    (user?.role === "super_admin" && stage !== "done");
                  return (
                    <TableRow
                      key={req.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-6 font-medium">
                        <div>{req.resourceName}</div>
                        <div className="text-xs text-muted-foreground">
                          {req.type === "External"
                            ? `External · ${req.vendorName}`
                            : "Internal"}{" "}
                          · {req.country}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{req.project}</TableCell>
                      <TableCell className="text-sm">
                        {req.projectRole}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.requestedBy}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            req.allocationPercent >= 100
                              ? "text-green-600"
                              : req.allocationPercent >= 75
                                ? "text-blue-600"
                                : req.allocationPercent >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                          }`}
                        >
                          {req.allocationPercent}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmt(req.currentYearForecast)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${style.bg} ${style.text} ${style.border}`}
                          >
                            {style.Icon && <style.Icon className="h-3 w-3" />}
                            {style.label}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {/* Pending RM — dot 1 amber, dot 2 muted */}
                            {(req.status === "Pending" ||
                              req.status === "Awaiting Approval") && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-amber-400" />
                                <div className="h-0.5 w-2 bg-muted" />
                                <div className="h-1.5 w-5 rounded-full bg-muted" />
                              </>
                            )}

                            {/* RM Approved / Pending PMO — both dots blue */}
                            {req.status === "RM Approved" && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-blue-500" />
                                <div className="h-0.5 w-2 bg-blue-300" />
                                <div className="h-1.5 w-5 rounded-full bg-blue-500" />
                              </>
                            )}

                            {/* Fully Approved — both dots green */}
                            {(req.status === "PMO Approved" ||
                              req.status === "Approved") && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-green-500" />
                                <div className="h-0.5 w-2 bg-green-300" />
                                <div className="h-1.5 w-5 rounded-full bg-green-500" />
                              </>
                            )}

                            {/* RM Rejected — dot 1 red, dot 2 muted */}
                            {req.status === "RM Rejected" && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-red-400" />
                                <div className="h-0.5 w-2 bg-muted" />
                                <div className="h-1.5 w-5 rounded-full bg-muted" />
                              </>
                            )}

                            {/* PMO Rejected — both dots red */}
                            {req.status === "PMO Rejected" && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-red-400" />
                                <div className="h-0.5 w-2 bg-red-300" />
                                <div className="h-1.5 w-5 rounded-full bg-red-400" />
                              </>
                            )}

                            {/* Rejected — both dots red */}
                            {req.status === "Rejected" && (
                              <>
                                <div className="h-1.5 w-5 rounded-full bg-red-400" />
                                <div className="h-0.5 w-2 bg-red-300" />
                                <div className="h-1.5 w-5 rounded-full bg-red-400" />
                              </>
                            )}
                          </div>
                          {/* Stage 1 */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {canAct && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs text-green-700 border-green-300 hover:bg-green-50 hover:text-green-800"
                                disabled={!canApprove}
                                onClick={() => openAction(req, "approve")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                disabled={!canApprove}
                                onClick={() => openAction(req, "reject")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          <div className="flex items-center gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="View email"
                              onClick={() => setMailPreview(req)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => openAction(req, "view")}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail / Action Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "approve" && `Approve — ${stageLabel}`}
              {dialogMode === "reject" && `Decline — ${stageLabel}`}
              {dialogMode === "view" && "Request Details"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="bg-muted/30 rounded-lg p-4 border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Approval Pipeline
                </p>
                <ApprovalStepper request={selected} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <DetailRow label="Resource" value={selected.resourceName} />
                  <DetailRow
                    label="Type"
                    value={
                      selected.type === "External"
                        ? `External · ${selected.vendorName}`
                        : "Internal"
                    }
                  />
                  <DetailRow label="Project" value={selected.project} />
                  <DetailRow label="Role" value={selected.projectRole} />
                  <DetailRow
                    label="Portfolio / Pillar"
                    value={`${selected.portfolio} / ${selected.pillar}`}
                  />
                </div>
                <div className="space-y-3">
                  <DetailRow
                    label="Start Date"
                    value={formatDate(selected.startDate)}
                  />

                  <DetailRow
                    label="End Date"
                    value={formatDate(selected.endDate)}
                  />
                  <DetailRow
                    label="Allocation"
                    value={`${selected.allocationPercent}%`}
                  />
                  <DetailRow
                    label="Est. Rate"
                    value={`$${selected.estimatedRate}/hr`}
                  />
                  <DetailRow
                    label="Forecast (Current Year)"
                    value={fmt(selected.currentYearForecast)}
                  />
                </div>
              </div>
              <div className="border-t pt-4 text-sm space-y-2">
                <DetailRow label="Requested By" value={selected.requestedBy} />
                <DetailRow
                  label="Requested On"
                  value={formatDateTime(selected.requestedOn)}
                />
              </div>
              {selected.approvalHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Approval History
                  </p>
                  {selected.approvalHistory.map((rec, i) => (
                    <div
                      key={i}
                      className={`text-sm rounded-md px-3 py-2 border ${rec.decision === "Approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium">{rec.approver}</span>
                        <span className="text-xs text-muted-foreground">
                          {rec.role} · {formatDateTime(rec.decidedOn)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {rec.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {(dialogMode === "approve" || dialogMode === "reject") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {dialogMode === "approve"
                      ? `${stageLabel} approval comment (optional)`
                      : "Reason for declining"}
                  </label>
                  <Textarea
                    placeholder={
                      dialogMode === "approve"
                        ? "Add any notes…"
                        : "Please provide a reason…"
                    }
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            {dialogMode === "approve" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={submitting}
                onClick={() => handleDecision("Approved")}
              >
                {submitting
                  ? "Approving…"
                  : currentStage === "rm"
                    ? "Confirm RM Approval"
                    : "Confirm PMO Approval"}
              </Button>
            )}
            {dialogMode === "reject" && (
              <Button
                variant="destructive"
                disabled={submitting || comment.trim() === ""}
                onClick={() => handleDecision("Rejected")}
              >
                {submitting ? "Declining…" : "Confirm Decline"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mail Preview Dialog */}
      <Dialog
        open={!!mailPreview}
        onOpenChange={(o) => !o && setMailPreview(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Email Preview</DialogTitle>
          </DialogHeader>
          {mailPreview && (
            <div className="space-y-3 text-sm">
              <div className="bg-muted/40 rounded-md px-4 py-3 space-y-1.5 border">
                <p className="text-muted-foreground text-xs">
                  From:{" "}
                  <span className="text-foreground font-medium">
                    noreply@resourcemgmt.com
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Subject:{" "}
                  <span className="text-foreground font-medium">
                    {mailPreview.mailSubject}
                  </span>
                </p>
              </div>
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground bg-background border rounded-md px-4 py-3">
                {mailPreview.mailBody}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMailPreview(null)}>
              Close
            </Button>
            {getApprovalStage(mailPreview?.status ?? "PMO Approved") !==
              "done" && (
              <Button
                onClick={() => {
                  const req = mailPreview!;
                  setMailPreview(null);
                  openAction(req, "approve");
                }}
              >
                Review Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-44 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
