import type { WidgetConfig, KpiConfig } from "@/hooks/useDashboardConfig";

export interface FilterConfig {
  id: string;
  label: string;
  checked: boolean;
  order: number;
  mandatory?: boolean;
}

export interface SavedDashboard {
  id: string;
  name: string;
  userId: string;
  username: string;
  persona: string;
  role: string;
  createdAt: string;
  lastModifiedAt: string;
  widgetConfig: WidgetConfig[];
  kpiConfig: KpiConfig[];
  filterConfig: FilterConfig[];
  isActive: boolean;
  isStarred: boolean;
}

const STORAGE_KEY = "saved-dashboards-v1";

function loadAll(): SavedDashboard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDashboard[];
    return parsed;
  } catch {
    return [];
  }
}

function saveAll(dashboards: SavedDashboard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch {
    // Storage full — silently ignore
  }
}

export const DashboardService = {
  getAll(): SavedDashboard[] {
    return loadAll();
  },

  getForUser(userId: string): SavedDashboard[] {
    return loadAll().filter((d) => d.userId === userId);
  },

  getById(id: string): SavedDashboard | null {
    return loadAll().find((d) => d.id === id) ?? null;
  },

  /** Returns true if the user already has a dashboard with this name */
  nameExists(userId: string, name: string, excludeId?: string): boolean {
    const trimmed = name.trim().toLowerCase();
    return loadAll().some(
      (d) =>
        d.userId === userId &&
        d.name.trim().toLowerCase() === trimmed &&
        d.id !== excludeId
    );
  },

  save(
    userId: string,
    username: string,
    persona: string,
    role: string,
    name: string,
    widgetConfig: WidgetConfig[],
    kpiConfig: KpiConfig[],
    filterConfig: FilterConfig[]
  ): SavedDashboard {
    // The Default View is the permanent system baseline — it must never
    // be overwritten by a user-saved record.
    const trimmedName = name.trim();
    if (trimmedName.toLowerCase() === "default view") {
      throw new Error("Cannot save over the Default View. Please choose a different name.");
    }
    const all = loadAll();
    const now = new Date().toISOString();
    const newDash: SavedDashboard = {
      id: `dash-${userId}-${Date.now()}`,
      name: trimmedName,
      userId,
      username,
      persona,
      role,
      createdAt: now,
      lastModifiedAt: now,
      widgetConfig: widgetConfig.map((w, i) => ({ ...w, order: i })),
      kpiConfig: [...kpiConfig],
      filterConfig: filterConfig.map((f, i) => ({ ...f, order: i })),
      isActive: true,
      isStarred: false,
    };
    // Mark previous active dashboards for same user+persona as inactive
    const updated = all.map((d) =>
      d.userId === userId && d.persona === persona
        ? { ...d, isActive: false }
        : d
    );
    updated.push(newDash);
    saveAll(updated);
    return newDash;
  },

  update(
    id: string,
    patch: Partial<Pick<SavedDashboard, "name" | "widgetConfig" | "kpiConfig" | "filterConfig" | "isActive" | "isStarred">>
  ): SavedDashboard | null {
    const all = loadAll();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    const updated = {
      ...all[idx],
      ...patch,
      lastModifiedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    saveAll(all);
    return updated;
  },

  rename(id: string, newName: string): SavedDashboard | null {
    const trimmed = newName.trim();
    if (trimmed.toLowerCase() === "default view") return null;
    return DashboardService.update(id, { name: trimmed });
  },

  toggleStar(id: string): SavedDashboard | null {
    const dash = DashboardService.getById(id);
    if (!dash) return null;
    return DashboardService.update(id, { isStarred: !dash.isStarred });
  },

  delete(id: string): void {
    const all = loadAll().filter((d) => d.id !== id);
    saveAll(all);
  },
};