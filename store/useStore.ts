import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mockDemands,
  mockAllocations,
  mockWorklist,
  mockResources,
  mockForecasts,
  seedAuditLog,
} from "@/mocks/store";
import {
  mockReviewRequests,
  type ReviewRequest,
  type ApprovalRecord,
} from "@/mocks/resourceReview";

// Re-export all shared types from the central types file
export type {
  LifecycleState,
  YearMap,
  Demand,
  Allocation,
  ResourceProfile,
  TaskAssignment,
  Forecast,
  HistoryEntry,
  AuditEntry,
  WorklistItem,
} from "@/types";

// Import them locally for use inside this file
import type {
  LifecycleState,
  YearMap,
  Demand,
  Allocation,
  ResourceProfile,
  Forecast,
  HistoryEntry,
  AuditEntry,
  WorklistItem,
} from "@/types";

// ─── Store Interface ──────────────────────────────────────────────────────────

// Lazy getter for auth state — avoids a circular module dependency.
// useStore.ts → mocks/store.ts → (types), and useAuth is in its own chain.
// Importing useAuth at the top level puts both in the same Vite chunk and
// the cycle causes "does not provide an export named 'useAuth'".
// Reading it lazily (after all modules are initialised) is the Zustand-recommended
// pattern for cross-store access.
function getAuthUser(): { role: string; username: string } | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).__zustand_useAuth?.getState?.()?.user ?? null;
}
// Called once from useAuth.ts after it creates the store, registers it globally
// so our lazy getter can find it without a direct import.
export function __registerAuthStore(store: {
  getState: () => { user: { role: string; username: string } | null };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__zustand_useAuth = store;
}

// ─── Portfolio Project (from Scenario Planning) ───────────────────────────────

export interface PortfolioResourcePlanEntry {
  role: string;
  noOfResources: number;
  fromDate: string;
  toDate: string;
  billRate: number;
}

export interface PortfolioProject {
  id: string;
  projectId: string;
  project: string;
  portfolio: string;
  priority: "Immediate" | "High" | "Medium" | "Low";
  owner: string;
  type: string;
  status:
    | "Pending Approval"
    | "Approved"
    | "Rejected"
    | "Active"
    | "Proposed"
    | "Approved - Backlog";
  fromDate: string;
  toDate: string;
  budget: number;
  cost: number;
  variance: number;
  projectedBenefits: number;
  resourcePlan?: PortfolioResourcePlanEntry[];
}

interface AppState {
  demands: Demand[];
  allocations: Allocation[];
  portfolioProjects: PortfolioProject[];
  addPortfolioProject: (p: Omit<PortfolioProject, "id" | "projectId">) => void;
  worklist: WorklistItem[];
  resources: ResourceProfile[];
  forecasts: Forecast[];
  auditLog: AuditEntry[];
  reviewRequests: ReviewRequest[];
  selectedProject: string;
  powerBiUrl: string;

  addDemand: (
    d: Omit<
      Demand,
      | "id"
      | "history"
      | "createdBy"
      | "createdDate"
      | "updatedBy"
      | "updatedDate"
    >,
  ) => string; // ← now returns the new demand ID

  addDemands: (
    ds: Omit<
      Demand,
      | "id"
      | "history"
      | "createdBy"
      | "createdDate"
      | "updatedBy"
      | "updatedDate"
    >[],
  ) => void;

  updateDemand: (id: string, updates: Partial<Demand>) => void;
  deleteDemand: (id: string) => void;
  updateAllocation: (id: string, updates: Partial<Allocation>) => void;
  approveWorklistItem: (id: string) => void;
  rejectWorklistItem: (id: string) => void;
  setSelectedProject: (p: string) => void;
  updateResource: (id: string, updates: Partial<ResourceProfile>) => void;

  addForecast: (
    f: Omit<
      Forecast,
      "id" | "createdBy" | "createdDate" | "status" | "history"
    > & {
      status?: Forecast["status"];
    },
  ) => void;

  updateForecast: (id: string, updates: Partial<Forecast>) => void;
  deleteForecast: (id: string) => void;
  convertForecastToDemand: (id: string) => void;
  addReviewRequest: (req: ReviewRequest) => void;
  updateReviewRequest: (id: string, updates: Partial<ReviewRequest>) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeAuditEntries(
  entity: AuditEntry["entity"],
  entityId: string,
  entityLabel: string,
  historyEntries: HistoryEntry[],
  action?: string,
): AuditEntry[] {
  return historyEntries.map((h, i) => ({
    id: `audit-${Date.now()}-${i}`,
    timestamp: h.updatedOn,
    user: h.updatedBy,
    entity,
    entityId,
    entityLabel,
    action:
      action ?? (h.fieldName === "status" ? "Status Changed" : "Field Updated"),
    field: h.fieldName,
    oldValue: h.from,
    newValue: h.to,
  }));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist<AppState>(
    (set, get) => ({
      demands: mockDemands,
      allocations: mockAllocations,
      portfolioProjects: [],

      addPortfolioProject: (p) =>
        set((state) => {
          const existing = state.portfolioProjects ?? [];
          const idx = existing.length + 1;
          const newProject: PortfolioProject = {
            ...p,
            id: `pp-${Date.now()}`,
            projectId: `P-${String(100 + idx).padStart(3, "0")}`,
          };
          return { portfolioProjects: [newProject, ...existing] };
        }),
      worklist: mockWorklist,
      resources: mockResources,
      forecasts: mockForecasts,
      auditLog: seedAuditLog,
      reviewRequests: mockReviewRequests,

      selectedProject: "Global",

      powerBiUrl:
        "https://app.powerbi.com/reportEmbed?reportId=2ab54997-497c-4dcc-af21-74a90b01f79c&autoAuth=true&ctid=5b062343-db15-4905-9f00-236a9938ed0a",

      // ── Demand: Create ── (prepends + returns new ID)
      addDemand: (d) => {
        const id = `dem-${Date.now()}`;
        const now = new Date().toLocaleString();
        const currentUser = getAuthUser();
        const userLabel = currentUser?.username ?? "admin@company.com";
        const newDemand: Demand = {
          ...d,
          id,
          history: [],
          createdBy: userLabel,
          createdDate: new Date().toLocaleDateString(),
          updatedBy: userLabel,
          updatedDate: new Date().toLocaleDateString(),
        };
        const newEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: userLabel,
          entity: "Demand",
          entityId: id,
          entityLabel: d.projectName,
          action: "Created",
          field: "",
          oldValue: "",
          newValue: `status: ${d.status}`,
        };
        const worklistItem: WorklistItem = {
          id: `wl-${Date.now()}`,
          activityType: "Review Demand Approval",
          summary: `Demand for ${d.projectRole || d.projectName} submitted for approval`,
          project: d.projectName,
          status: "Open",
          dueBy: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
          demandId: id,
        };
        // Create a ReviewRequest so PMO/RM can see it in Resource Review
        const newReviewRequest: ReviewRequest = {
          id: `rev-${Date.now()}`,
          demandId: id,
          requestedBy: userLabel,
          requestedOn: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          project: d.projectName,
          resourceName: d.resourceName || "TBD",
          projectRole: d.projectRole || "TBD",
          portfolio: d.portfolio || "",
          pillar: d.pillar || "",
          startDate: d.startDate,
          endDate: d.endDate,
          type: d.type,
          vendorName: d.vendorName || "",
          allocationPercent: d.allocationPercent,
          estimatedRate: d.estimatedRate,
          currentYearForecast: d.currentYearForecast,
          country: d.country || "Sydney",
          resourceCount: d.resourceCount || 1,
          status: "Pending",
          approvalHistory: [],
          mailSubject: `Resource Review Required: ${d.projectRole || "Resource"} – ${d.projectName}`,
          mailBody: `Hi Manager,\n\nA resource request has been submitted for your review and approval.\n\nProject: ${d.projectName}\nRole: ${d.projectRole || "TBD"}\nResource: ${d.resourceName || "TBD"}\nAllocation: ${d.allocationPercent}%\nPeriod: ${d.startDate} – ${d.endDate}\nEstimated Rate: $${d.estimatedRate}/hr\nForecast (Current Year): $${d.currentYearForecast}\n\nPlease review the details and approve or decline the request at your earliest convenience.\n\nThank you,\nResource Management System`,
        };
        set((state) => ({
          demands: [newDemand, ...state.demands],
          worklist: [worklistItem, ...state.worklist],
          auditLog: [newEntry, ...state.auditLog],
          reviewRequests: [newReviewRequest, ...state.reviewRequests],
        }));
        return id; // ← return so callers can navigate with it
      },

      // ── Demand: Bulk Create ── (prepends)
      addDemands: (ds) =>
        set((state) => {
          const now = new Date().toLocaleString();
          const newDemands = ds.map((d, i) => ({
            ...d,
            id: `dem-${Date.now()}-${i}`,
            history: [],
            createdBy: "admin@company.com",
            createdDate: new Date().toLocaleDateString(),
            updatedBy: "admin@company.com",
            updatedDate: new Date().toLocaleDateString(),
          }));
          const newAuditEntries: AuditEntry[] = newDemands.map((d) => ({
            id: `audit-${Date.now()}-${d.id}`,
            timestamp: now,
            user: "admin@company.com",
            entity: "Demand",
            entityId: d.id,
            entityLabel: d.projectName,
            action: "Bulk Import",
            field: "",
            oldValue: "",
            newValue: `status: ${d.status}`,
          }));
          const currentUser = getAuthUser();
          const userLabel = currentUser?.username ?? "admin@company.com";
          const dateLabel = new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          });
          // Create a ReviewRequest for each bulk demand so Resource Review & Status pages work
          const newReviewRequests: ReviewRequest[] = newDemands.map((d) => ({
            id: `rev-${Date.now()}-${d.id}`,
            demandId: d.id,
            requestedBy: userLabel,
            requestedOn: dateLabel,
            project: d.projectName,
            resourceName: d.resourceName || "TBD",
            projectRole: d.projectRole || "TBD",
            portfolio: d.portfolio || "",
            pillar: d.pillar || "",
            startDate: d.startDate,
            endDate: d.endDate,
            type: d.type,
            vendorName: d.vendorName || "",
            allocationPercent: d.allocationPercent,
            estimatedRate: d.estimatedRate,
            currentYearForecast: d.currentYearForecast,
            country: d.country || "Sydney",
            resourceCount: d.resourceCount || 1,
            status: "Pending" as const,
            approvalHistory: [],
            mailSubject: `Resource Review Required: ${d.projectRole || "Resource"} – ${d.projectName}`,
            mailBody: `Hi Manager,\n\nA resource request has been submitted for your review and approval.\n\nProject: ${d.projectName}\nRole: ${d.projectRole || "TBD"}\nResource: ${d.resourceName || "TBD"}\nAllocation: ${d.allocationPercent}%\nPeriod: ${d.startDate} – ${d.endDate}\nEstimated Rate: $${d.estimatedRate}/hr\nForecast (Current Year): $${d.currentYearForecast}\n\nPlease review the details and approve or decline the request at your earliest convenience.\n\nThank you,\nResource Management System`,
          }));
          return {
            demands: [...newDemands, ...state.demands], // ← prepend bulk
            auditLog: [...newAuditEntries, ...state.auditLog],
            reviewRequests: [...newReviewRequests, ...state.reviewRequests],
          };
        }),

      // ── Demand: Update ──
      updateDemand: (id, updates) =>
        set((state) => {
          const demand = state.demands.find((d) => d.id === id);
          const historyEntries: HistoryEntry[] = [];
          if (demand) {
            for (const [key, val] of Object.entries(updates)) {
              if (key !== "history" && (demand as any)[key] !== val) {
                historyEntries.push({
                  fieldName: key,
                  from: String((demand as any)[key]),
                  to: String(val),
                  updatedOn: new Date().toLocaleString(),
                  updatedBy: "admin@company.com",
                });
              }
            }
          }
          const newAuditEntries = demand
            ? makeAuditEntries("Demand", id, demand.projectName, historyEntries)
            : [];
          return {
            demands: state.demands.map((d) => {
              if (d.id !== id) return d;
              return {
                ...d,
                ...updates,
                history: [...d.history, ...historyEntries],
                updatedBy: "admin@company.com",
                updatedDate: new Date().toLocaleDateString(),
              };
            }),
            auditLog: [...newAuditEntries, ...state.auditLog],
          };
        }),

      // ── Demand: Delete ──
      deleteDemand: (id) =>
        set((state) => {
          const demand = state.demands.find((d) => d.id === id);
          const newAuditEntry: AuditEntry | null = demand
            ? {
                id: `audit-${Date.now()}`,
                timestamp: new Date().toISOString().split("T")[0],
                user: "admin@company.com",
                entity: "Demand",
                entityId: id,
                entityLabel: demand.projectName,
                action: "Deleted",
                field: "",
                oldValue: `status: ${demand.status}`,
                newValue: "",
              }
            : null;
          return {
            demands: state.demands.filter((d) => d.id !== id),
            auditLog: newAuditEntry
              ? [newAuditEntry, ...state.auditLog]
              : state.auditLog,
          };
        }),

      // ── Allocation: Update ──
      updateAllocation: (id, updates) =>
        set((state) => {
          const alloc = state.allocations.find((a) => a.id === id);
          const historyEntries: HistoryEntry[] = [];
          if (alloc) {
            for (const [key, val] of Object.entries(updates)) {
              if (key !== "history" && (alloc as any)[key] !== val) {
                historyEntries.push({
                  fieldName: key,
                  from: String((alloc as any)[key]),
                  to: String(val),
                  updatedOn: new Date().toLocaleString(),
                  updatedBy: "admin@company.com",
                });
              }
            }
          }
          const newAuditEntries = alloc
            ? makeAuditEntries(
                "Allocation",
                id,
                alloc.resourceName,
                historyEntries,
              )
            : [];
          return {
            allocations: state.allocations.map((a) => {
              if (a.id !== id) return a;
              const historyEntries2: HistoryEntry[] = [];
              for (const [key, val] of Object.entries(updates)) {
                if (key !== "history" && (a as any)[key] !== val) {
                  historyEntries2.push({
                    fieldName: key,
                    from: String((a as any)[key]),
                    to: String(val),
                    updatedOn: new Date().toLocaleString(),
                    updatedBy: "admin@company.com",
                  });
                }
              }
              const next: Allocation = {
                ...a,
                ...updates,
                history: [...a.history, ...historyEntries2],
              };
              if (updates.lifecycle === "Offboarding")
                next.status = "Cancelled";
              return next;
            }),
            auditLog: [...newAuditEntries, ...state.auditLog],
          };
        }),

      // ── Worklist: Approve ──
      approveWorklistItem: (id) =>
        set((state) => {
          const item = state.worklist.find((w) => w.id === id);
          const now = new Date().toLocaleString();
          const role = getAuthUser()?.role;
          const username = getAuthUser()?.username ?? "admin";
          const newStatus =
            role === "pmo"
              ? ("PMO Approved" as const)
              : role === "resource_manager"
                ? ("RM Approved" as const)
                : ("Approved" as const);
          const newAuditEntry: AuditEntry | null = item
            ? {
                id: `audit-${Date.now()}`,
                timestamp: now,
                user: username,
                entity: "Demand",
                entityId: item.demandId,
                entityLabel: item.project,
                action: "Status Changed",
                field: "status",
                oldValue: "Pending",
                newValue: newStatus,
              }
            : null;
          // Build an approval history record for the ReviewRequest
          const approvalRecord: ApprovalRecord = {
            approver: username,
            role: role === "resource_manager" ? "Resource Manager" : "PMO",
            decision: "Approved",
            comment: "Approved.",
            decidedOn: new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            }),
          };
          return {
            worklist: state.worklist.map((w) =>
              w.id === id ? { ...w, status: "Approved" as const } : w,
            ),
            demands: state.demands.map((d) => {
              if (item && d.id === item.demandId) {
                return { ...d, status: newStatus };
              }
              return d;
            }),
            reviewRequests: state.reviewRequests.map((r) => {
              if (item && r.demandId === item.demandId) {
                return {
                  ...r,
                  status: newStatus as ReviewRequest["status"],
                  approvalHistory: [...r.approvalHistory, approvalRecord],
                };
              }
              return r;
            }),
            auditLog: newAuditEntry
              ? [newAuditEntry, ...state.auditLog]
              : state.auditLog,
          };
        }),

      // ── Worklist: Reject ──
      rejectWorklistItem: (id) =>
        set((state) => {
          const item = state.worklist.find((w) => w.id === id);
          const now = new Date().toLocaleString();
          const role = getAuthUser()?.role;
          const username = getAuthUser()?.username ?? "admin";
          const newStatus =
            role === "pmo"
              ? ("PMO Rejected" as const)
              : role === "resource_manager"
                ? ("RM Rejected" as const)
                : ("Rejected" as const);
          const newAuditEntry: AuditEntry | null = item
            ? {
                id: `audit-${Date.now()}`,
                timestamp: now,
                user: username,
                entity: "Demand",
                entityId: item.demandId,
                entityLabel: item.project,
                action: "Status Changed",
                field: "status",
                oldValue: "Pending",
                newValue: newStatus,
              }
            : null;
          const approvalRecord: ApprovalRecord = {
            approver: username,
            role: role === "resource_manager" ? "Resource Manager" : "PMO",
            decision: "Rejected",
            comment: "Declined.",
            decidedOn: new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            }),
          };
          return {
            worklist: state.worklist.map((w) =>
              w.id === id ? { ...w, status: "Rejected" as const } : w,
            ),
            demands: state.demands.map((d) => {
              if (item && d.id === item.demandId) {
                return { ...d, status: newStatus };
              }
              return d;
            }),
            reviewRequests: state.reviewRequests.map((r) => {
              if (item && r.demandId === item.demandId) {
                return {
                  ...r,
                  status: newStatus as ReviewRequest["status"],
                  approvalHistory: [...r.approvalHistory, approvalRecord],
                };
              }
              return r;
            }),
            auditLog: newAuditEntry
              ? [newAuditEntry, ...state.auditLog]
              : state.auditLog,
          };
        }),

      setSelectedProject: (p) => set({ selectedProject: p }),

      // ── Resource: Update ──
      updateResource: (id, updates) =>
        set((state) => {
          const resource = state.resources.find((r) => r.id === id);
          const historyEntries: HistoryEntry[] = [];
          if (resource) {
            for (const [key, val] of Object.entries(updates)) {
              if (key !== "history" && (resource as any)[key] !== val) {
                historyEntries.push({
                  fieldName: key,
                  from: String((resource as any)[key]),
                  to: String(val),
                  updatedOn: new Date().toLocaleString(),
                  updatedBy: "admin@company.com",
                });
              }
            }
          }
          const newAuditEntries = resource
            ? makeAuditEntries("Resource", id, resource.name, historyEntries)
            : [];
          return {
            resources: state.resources.map((r) =>
              r.id === id
                ? {
                    ...r,
                    ...updates,
                    history: [...r.history, ...historyEntries],
                  }
                : r,
            ),
            auditLog: [...newAuditEntries, ...state.auditLog],
          };
        }),

      // ── Forecast: Create ──
      addForecast: (f) =>
        set((state) => {
          const id = `fc-${Date.now()}`;
          const now = new Date().toLocaleString();
          const newEntry: AuditEntry = {
            id: `audit-${Date.now()}`,
            timestamp: now,
            user: "admin@company.com",
            entity: "Forecast",
            entityId: id,
            entityLabel: f.projectName,
            action: "Created",
            field: "",
            oldValue: "",
            newValue: `status: ${f.status ?? "Draft"}`,
          };
          return {
            forecasts: [
              ...state.forecasts,
              {
                ...f,
                id,
                status: f.status || "Draft",
                createdBy: "admin@company.com",
                createdDate: new Date().toLocaleDateString(),
                history: [],
              },
            ],
            auditLog: [newEntry, ...state.auditLog],
          };
        }),

      // ── Forecast: Update ──
      updateForecast: (id, updates) =>
        set((state) => {
          const forecast = state.forecasts.find((f) => f.id === id);
          const historyEntries: HistoryEntry[] = [];
          if (forecast) {
            for (const [key, val] of Object.entries(updates)) {
              if (key !== "history" && (forecast as any)[key] !== val) {
                historyEntries.push({
                  fieldName: key,
                  from: String((forecast as any)[key]),
                  to: String(val),
                  updatedOn: new Date().toLocaleString(),
                  updatedBy: "admin@company.com",
                });
              }
            }
          }
          const newAuditEntries = forecast
            ? makeAuditEntries(
                "Forecast",
                id,
                forecast.projectName,
                historyEntries,
              )
            : [];
          return {
            forecasts: state.forecasts.map((f) =>
              f.id === id
                ? {
                    ...f,
                    ...updates,
                    history: [...f.history, ...historyEntries],
                  }
                : f,
            ),
            auditLog: [...newAuditEntries, ...state.auditLog],
          };
        }),

      // ── Forecast: Delete ──
      deleteForecast: (id) =>
        set((state) => {
          const forecast = state.forecasts.find((f) => f.id === id);
          const newAuditEntry: AuditEntry | null = forecast
            ? {
                id: `audit-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                user: "admin@company.com",
                entity: "Forecast",
                entityId: id,
                entityLabel: forecast.projectName,
                action: "Deleted",
                field: "",
                oldValue: `status: ${forecast.status}`,
                newValue: "",
              }
            : null;
          return {
            forecasts: state.forecasts.filter((f) => f.id !== id),
            auditLog: newAuditEntry
              ? [newAuditEntry, ...state.auditLog]
              : state.auditLog,
          };
        }),

      // ── Forecast: Convert to Demand ── (prepends)
      convertForecastToDemand: (id) =>
        set((state) => {
          const f = state.forecasts.find((x) => x.id === id);
          if (!f || f.status === "Converted") return state;
          const newDemandId = `dem-${Date.now()}`;
          const now = new Date().toLocaleString();
          const newDemand: Demand = {
            id: newDemandId,
            portfolio: f.portfolio,
            program: f.program,
            projectName: f.projectName,
            projectRole: f.requiredRole,
            budgetCode: "",
            pillar: f.pillar,
            allocationPercent: 100,
            status: "Pending",
            comments: `Converted from Forecast ${f.id}`,
            identified: false,
            estimatedRate:
              f.headcount > 0
                ? Math.round(f.estimatedCost / f.headcount / 2080)
                : 0,
            currentYearForecast: f.estimatedCost,
            resourceName: "",
            workstream: "",
            subTeam: "",
            startDate: f.startDate,
            endDate: f.endDate,
            type: "Internal",
            resourceCount: f.headcount || 0,
            vendorName: "",
            country: "Sydney",
            allocation: { current: 1, y2027: 1, y2028: 0, y2029: 0, y2030: 0 },
            forecast: {
              current: f.estimatedCost,
              y2027: f.estimatedCost,
              y2028: 0,
              y2029: 0,
              y2030: 0,
            },
            createdBy: "admin@company.com",
            createdDate: new Date().toLocaleDateString(),
            updatedBy: "admin@company.com",
            updatedDate: new Date().toLocaleDateString(),
            history: [],
            forecastSourceId: f.id,
          };
          const auditForecast: AuditEntry = {
            id: `audit-${Date.now()}-fc`,
            timestamp: now,
            user: "admin@company.com",
            entity: "Forecast",
            entityId: id,
            entityLabel: f.projectName,
            action: "Converted to Demand",
            field: "status",
            oldValue: f.status,
            newValue: "Converted",
          };
          const auditDemand: AuditEntry = {
            id: `audit-${Date.now()}-dem`,
            timestamp: now,
            user: "admin@company.com",
            entity: "Demand",
            entityId: newDemandId,
            entityLabel: f.projectName,
            action: "Created (from Forecast)",
            field: "",
            oldValue: "",
            newValue: `status: Pending, source: ${f.id}`,
          };
          return {
            demands: [newDemand, ...state.demands], // ← prepend
            forecasts: state.forecasts.map((x) =>
              x.id === id
                ? {
                    ...x,
                    status: "Converted" as const,
                    history: [
                      ...x.history,
                      {
                        fieldName: "status",
                        from: x.status,
                        to: "Converted",
                        updatedOn: now,
                        updatedBy: "admin@company.com",
                      },
                    ],
                  }
                : x,
            ),
            auditLog: [auditDemand, auditForecast, ...state.auditLog],
          };
        }),
      // ── ReviewRequest: Add ──
      addReviewRequest: (req) =>
        set((state) => ({
          reviewRequests: [req, ...state.reviewRequests],
        })),

      // ── ReviewRequest: Update ──
      updateReviewRequest: (id, updates) =>
        set((state) => ({
          reviewRequests: state.reviewRequests.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),
    }),
    {
      name: "app-storage",
      version: 3,
      migrate: (persisted: any, fromVersion: number) => {
        // v1 → v2: replace old mock reviewRequests with updated seed data
        if (fromVersion < 2) {
          persisted = { ...persisted, reviewRequests: mockReviewRequests };
        }
        // v2 → v3: add portfolioProjects field
        if (fromVersion < 3) {
          persisted = { ...persisted, portfolioProjects: [] };
        }
        return persisted;
      },
    },
  ),
);

// ─── Re-exports ───────────────────────────────────────────────────────────────
export {
  projects,
  pillars,
  roles,
  budgetCodes,
  vendors,
  resourceNames,
  locations,
} from "@/mocks/store";
