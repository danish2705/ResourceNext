import { create } from "zustand";

export interface MasterEntry {
  id: string;
  value: string;
  description: string;
  status: "Active" | "Inactive";
  createdDate: string;
  updatedDate: string;
}

export interface MasterAudit {
  id: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedOn: string;
}

export interface MasterObject {
  key: string;
  label: string;
  entries: MasterEntry[];
  audit: MasterAudit[];
}

const now = () => new Date().toLocaleDateString();
const ts = () => new Date().toLocaleString();

const seed = (values: string[]): MasterEntry[] =>
  values.map((v, i) => ({
    id: `${v.toLowerCase().replace(/\s+/g, "-")}-${i}`,
    value: v,
    description: "",
    status: "Active" as const,
    createdDate: "01/15/2026",
    updatedDate: "01/15/2026",
  }));

const initialObjects: MasterObject[] = [
  {
    key: "projects",
    label: "Projects",
    entries: seed([
      "Data Modernization - ASPAC",
      "QE Automation",
      "Cloud Enablement",
      "Application Support",
    ]),
    audit: [],
  },
  {
    key: "resources",
    label: "Resource Names",
    entries: seed([
      "Grishma Gangar",
      "Anurag Vaishy",
      "Karthik Dontula",
      "Adnan Siddiqui",
      "Ian Lee",
      "Rich Bowers",
      "Matthew Truelove",
      "Jamison Ducey",
      "Lindsey Lord",
      "Kristie Shirkavand",
    ]),
    audit: [],
  },
  {
    key: "vendors",
    label: "Vendors",
    entries: seed([
      "UX Reactor",
      "Hyqoo",
      "Collabera",
      "Ascendion Global",
      "Moodys NWC",
    ]),
    audit: [],
  },
  {
    key: "pillars",
    label: "Pillars",
    entries: seed([
      "Hi-tech",
      "Retail",
      "Banking",
      "Healthcare",
      "Life Sciences",
    ]),
    audit: [],
  },
  {
    key: "roles",
    label: "Roles",
    entries: seed([
      "Business Analyst",
      "Technical Lead",
      "QA Engineer",
      "Project Manager",
      "DevOps Engineer",
    ]),
    audit: [],
  },
  {
    key: "levels",
    label: "Levels",
    entries: seed(["External", "M1", "M2", "D1", "D2", "VP"]),
    audit: [],
  },
  {
    key: "workstreams",
    label: "Workstreams",
    entries: seed(["WS-1", "WS-2", "WS-3"]),
    audit: [],
  },
  {
    key: "countries",
    label: "Locations",
    entries: seed(["Sydney", "Germany", "Australia", "Poland"]),
    audit: [],
  },
  {
    key: "portfolios",
    label: "Portfolios",
    entries: seed([
      "Global",
      "Hi-tech",
      "Retail",
      "Banking",
      "Healthcare",
      "Life Sciences",
    ]),
    audit: [],
  },
  {
    key: "programs",
    label: "Programs",
    entries: seed(["Enterprise", "EMEA", "AMER", "APAC"]),
    audit: [],
  },
  {
    key: "skills",
    label: "Skills",
    entries: seed([
      "React",
      "Node.js",
      "AWS",
      "Python",
      "Java",
      "Selenium",
      "Salesforce",
      "Snowflake",
      "Kubernetes",
      "Power BI",
    ]),
    audit: [],
  },
  {
    key: "lifecycleStates",
    label: "Lifecycle States",
    entries: seed(["Demand", "Intake", "Active Allocation", "Offboarding"]),
    audit: [],
  },
  {
    key: "allocationType",
    label: "Allocation Type",
    entries: seed([
      "Project",
      "Base Business",
      "Innovation / R&D",
      "Support & Maintenance",
      "Training & Development",
      "Internal Initiative",
    ]),
    audit: [],
  },
];

interface MasterState {
  objects: MasterObject[];
  addEntry: (
    objectKey: string,
    entry: Omit<
      MasterEntry,
      "id" | "createdDate" | "updatedDate" | "status"
    > & { status?: MasterEntry["status"] },
  ) => void;
  updateEntry: (
    objectKey: string,
    id: string,
    updates: Partial<MasterEntry>,
  ) => void;
  deleteEntry: (objectKey: string, id: string) => void;
  bulkAddEntries: (
    objectKey: string,
    values: { value: string; description?: string }[],
  ) => number;
  addObjectType: (label: string) => void;
}

export const useMasterData = create<MasterState>((set, get) => ({
  objects: initialObjects,

  addEntry: (objectKey, entry) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.key !== objectKey
          ? o
          : {
              ...o,
              entries: [
                ...o.entries,
                {
                  id: `${objectKey}-${Date.now()}`,
                  value: entry.value,
                  description: entry.description || "",
                  status: entry.status || "Active",
                  createdDate: now(),
                  updatedDate: now(),
                },
              ],
              audit: [
                ...o.audit,
                {
                  id: `a-${Date.now()}`,
                  fieldName: "value",
                  oldValue: "",
                  newValue: entry.value,
                  updatedBy: "current@user.com",
                  updatedOn: ts(),
                },
              ],
            },
      ),
    })),

  updateEntry: (objectKey, id, updates) =>
    set((state) => ({
      objects: state.objects.map((o) => {
        if (o.key !== objectKey) return o;
        const existing = o.entries.find((e) => e.id === id);
        if (!existing) return o;
        const auditEntries: MasterAudit[] = [];
        for (const [k, v] of Object.entries(updates)) {
          if ((existing as any)[k] !== v) {
            auditEntries.push({
              id: `a-${Date.now()}-${k}`,
              fieldName: k,
              oldValue: String((existing as any)[k]),
              newValue: String(v),
              updatedBy: "current@user.com",
              updatedOn: ts(),
            });
          }
        }
        return {
          ...o,
          entries: o.entries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedDate: now() } : e,
          ),
          audit: [...o.audit, ...auditEntries],
        };
      }),
    })),

  deleteEntry: (objectKey, id) =>
    set((state) => ({
      objects: state.objects.map((o) => {
        if (o.key !== objectKey) return o;
        const existing = o.entries.find((e) => e.id === id);
        if (!existing) return o;
        return {
          ...o,
          entries: o.entries.map((e) =>
            e.id === id
              ? { ...e, status: "Inactive" as const, updatedDate: now() }
              : e,
          ),
          audit: [
            ...o.audit,
            {
              id: `a-${Date.now()}`,
              fieldName: "status",
              oldValue: existing.status,
              newValue: "Inactive",
              updatedBy: "current@user.com",
              updatedOn: ts(),
            },
          ],
        };
      }),
    })),

  bulkAddEntries: (objectKey, values) => {
    const obj = get().objects.find((o) => o.key === objectKey);
    if (!obj) return 0;
    const existingValues = new Set(
      obj.entries.map((e) => e.value.toLowerCase()),
    );
    const fresh = values.filter(
      (v) => v.value && !existingValues.has(v.value.toLowerCase()),
    );
    if (fresh.length === 0) return 0;
    set((state) => ({
      objects: state.objects.map((o) =>
        o.key !== objectKey
          ? o
          : {
              ...o,
              entries: [
                ...o.entries,
                ...fresh.map((f, i) => ({
                  id: `${objectKey}-${Date.now()}-${i}`,
                  value: f.value,
                  description: f.description || "",
                  status: "Active" as const,
                  createdDate: now(),
                  updatedDate: now(),
                })),
              ],
              audit: [
                ...o.audit,
                ...fresh.map((f, i) => ({
                  id: `a-${Date.now()}-${i}`,
                  fieldName: "value",
                  oldValue: "",
                  newValue: f.value,
                  updatedBy: "current@user.com",
                  updatedOn: ts(),
                })),
              ],
            },
      ),
    }));
    return fresh.length;
  },

  addObjectType: (label) =>
    set((state) => {
      const key = label.toLowerCase().replace(/\s+/g, "-");
      if (state.objects.find((o) => o.key === key)) return state;
      return {
        objects: [...state.objects, { key, label, entries: [], audit: [] }],
      };
    }),
}));

// Convenience selectors — return only ACTIVE values for dropdowns.
// IMPORTANT: select the stable `objects` reference and derive the array via
// useMemo to avoid returning a new array on every render (which would cause
// React error #185 — infinite re-renders).
import { useMemo } from "react";
export const useActiveValues = (objectKey: string): string[] => {
  const objects = useMasterData((s) => s.objects);
  return useMemo(
    () =>
      objects
        .find((o) => o.key === objectKey)
        ?.entries.filter((e) => e.status === "Active")
        .map((e) => e.value) || [],
    [objects, objectKey],
  );
};
