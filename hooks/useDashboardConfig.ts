import { useState, useCallback } from "react";
import { useAuth } from "@/auth/useAuth";

export interface WidgetConfig {
  id: string;
  label: string;
  checked: boolean;
  row: number;
  order?: number;
}

export interface KpiConfig {
  id: string;
  checked: boolean;
}

export interface FilterConfig {
  id: string;
  label: string;
  checked: boolean;
  order: number;
  mandatory?: boolean;
}

export interface DashboardConfig {
  widgets: WidgetConfig[];
  kpiCards: KpiConfig[];
  filters?: FilterConfig[];
  savedAt?: string;
}

function getStorageKey(userId: string, persona: string) {
  return `dashboard-config:${userId}:${persona}`;
}

export function useDashboardConfig(
  persona: string,
  defaultWidgets: WidgetConfig[],
  defaultKpiIds: string[],
  defaultFilters: FilterConfig[] = []
) {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const storageKey = getStorageKey(userId, persona);

  function loadFromStorage(): DashboardConfig | null {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as DashboardConfig;
    } catch {
      return null;
    }
  }

  function mergeWithDefaults(
    saved: DashboardConfig | null,
    defaultW: WidgetConfig[],
    defaultKIds: string[],
    defaultF: FilterConfig[]
  ) {
    if (!saved) {
      return {
        widgets: defaultW.map((w, i) => ({ ...w, order: i })),
        kpiCards: defaultKIds.map((id) => ({ id, checked: true })),
        filters: defaultF.map((f, i) => ({ ...f, order: i })),
      };
    }

    // Merge widgets
    const savedWidgetMap = new Map(saved.widgets.map((w) => [w.id, w]));
    const widgets = defaultW
      .map((w, i) => {
        const s = savedWidgetMap.get(w.id);
        return s ? { ...w, checked: s.checked, order: s.order ?? i } : { ...w, order: i };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Merge kpis
    const savedKpiMap = new Map(saved.kpiCards.map((k) => [k.id, k]));
    const kpiCards = defaultKIds.map((id) => {
      const s = savedKpiMap.get(id);
      return { id, checked: s ? s.checked : true };
    });

    // Merge filters
    const savedFilters = saved.filters ?? [];
    const savedFilterMap = new Map(savedFilters.map((f) => [f.id, f]));
    const filters = defaultF
      .map((f, i) => {
        const s = savedFilterMap.get(f.id);
        if (s) {
          // mandatory filters are always visible
          return { ...f, checked: f.mandatory ? true : s.checked, order: s.order ?? i };
        }
        return { ...f, order: i };
      })
      .sort((a, b) => a.order - b.order);

    return { widgets, kpiCards, filters };
  }

  const saved = loadFromStorage();
  const merged = mergeWithDefaults(saved, defaultWidgets, defaultKpiIds, defaultFilters);

  const [widgets, setWidgets] = useState<WidgetConfig[]>(merged.widgets);
  const [kpiCards, setKpiCards] = useState<KpiConfig[]>(merged.kpiCards);
  const [filters, setFilters] = useState<FilterConfig[]>(merged.filters);

  const saveConfig = useCallback(
    (ws: WidgetConfig[], kpis: KpiConfig[], fs: FilterConfig[]) => {
      const config: DashboardConfig = {
        widgets: ws.map((w, i) => ({ ...w, order: i })),
        kpiCards: kpis,
        filters: fs.map((f, i) => ({ ...f, order: i })),
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
      } catch {
        // storage full or unavailable
      }
    },
    [storageKey]
  );

  const resetConfig = useCallback(() => {
    const freshWidgets = defaultWidgets.map((w, i) => ({ ...w, order: i }));
    const freshKpis = defaultKpiIds.map((id) => ({ id, checked: true }));
    const freshFilters = defaultFilters.map((f, i) => ({ ...f, order: i }));
    setWidgets(freshWidgets);
    setKpiCards(freshKpis);
    setFilters(freshFilters);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey, defaultWidgets, defaultKpiIds, defaultFilters]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, checked: !w.checked } : w)));
  }, []);

  const toggleKpi = useCallback((id: string) => {
    setKpiCards((ks) => ks.map((k) => (k.id === id ? { ...k, checked: !k.checked } : k)));
  }, []);

  const toggleFilter = useCallback((id: string) => {
    setFilters((fs) =>
      fs.map((f) => (f.id === id && !f.mandatory ? { ...f, checked: !f.checked } : f))
    );
  }, []);

  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets((ws) => {
      const arr = [...ws];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  const reorderKpis = useCallback((fromIndex: number, toIndex: number) => {
    setKpiCards((ks) => {
      const arr = [...ks];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }, []);

  const reorderFilters = useCallback((fromIndex: number, toIndex: number) => {
    setFilters((fs) => {
      const arr = [...fs];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr.map((f, i) => ({ ...f, order: i }));
    });
  }, []);

  return {
    widgets,
    kpiCards,
    filters,
    setWidgets,
    setKpiCards,
    setFilters,
    saveConfig,
    resetConfig,
    toggleWidget,
    toggleKpi,
    toggleFilter,
    reorderWidgets,
    reorderKpis,
    reorderFilters,
    hasSavedConfig: saved !== null,
  };
}