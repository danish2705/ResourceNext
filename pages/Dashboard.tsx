import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import {
  Users, Gauge, PieChart as PieChartIcon, UserCheck, UserX,
  TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Settings, Shield, Activity, Bell, CheckCircle, Clock,
  Briefcase, Star, BookOpen, Calendar, Award, FileText,
  ChevronRight, Plus, Search, BarChart2, Layers, Target,
  Zap, Database,
} from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import type { Role } from "@/auth/rbac";
import { useDashboardConfig, type WidgetConfig, type KpiConfig, type FilterConfig } from "@/hooks/useDashboardConfig";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SaveDashboardDialog } from "@/components/SaveDashboardDialog";
import { DashboardService, type SavedDashboard } from "@/components/DashboardService";

// ─── Global CSS ──────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      :root {
        --db-bg: #f3f4f6;
        --db-surface: #ffffff;
        --db-surface-alt: #f9fafb;
        --db-border: #e5e7eb;
        --db-border-light: #f3f4f6;
        --db-text-primary: #111827;
        --db-text-sec: #374151;
        --db-text-muted: #6b7280;
        --db-text-faint: #9ca3af;
        --db-input-bg: #ffffff;
        --db-overlay: rgba(0,0,0,0.3);
        --db-drag-checked: #eff6ff;
        --db-drag-checked-border: #3b82f6;
        --db-drag-unchecked: #f9fafb;
        --db-hover-bg: #f3f4f6;
        --db-section-label: #9ca3af;
        --db-row-alert: #fff5f5;
      }
      .dark {
        --db-bg: #0f1117;
        --db-surface: #1a1d27;
        --db-surface-alt: #1f2231;
        --db-border: #2d3148;
        --db-border-light: #252838;
        --db-text-primary: #f1f5f9;
        --db-text-sec: #cbd5e1;
        --db-text-muted: #8b99b5;
        --db-text-faint: #4f5b73;
        --db-input-bg: #1f2231;
        --db-overlay: rgba(0,0,0,0.6);
        --db-drag-checked: #1e2a3a;
        --db-drag-checked-border: #3b82f6;
        --db-drag-unchecked: #1a1d27;
        --db-hover-bg: #252838;
        --db-section-label: #4f5b73;
        --db-row-alert: #2a1a1a;
      }
      * { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease; box-sizing: border-box; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--db-border); border-radius: 2px; }
    `}</style>
  );
}

const T = {
  bg: "var(--db-bg)", surface: "var(--db-surface)", surfaceAlt: "var(--db-surface-alt)",
  border: "var(--db-border)", borderLight: "var(--db-border-light)",
  text: "var(--db-text-primary)", textSec: "var(--db-text-sec)",
  textMuted: "var(--db-text-muted)", textFaint: "var(--db-text-faint)",
  inputBg: "var(--db-input-bg)", overlay: "var(--db-overlay)",
  dragChecked: "var(--db-drag-checked)", dragCheckedBorder: "var(--db-drag-checked-border)",
  dragUnchecked: "var(--db-drag-unchecked)", hoverBg: "var(--db-hover-bg)",
  sectionLabel: "var(--db-section-label)", rowAlert: "var(--db-row-alert)",
  blue: "#3b82f6", green: "#10b981", red: "#ef4444", orange: "#f97316",
  amber: "#f59e0b", teal: "#14b8a6", purple: "#8b5cf6", sky: "#0ea5e9", gray: "#6b7280",
};

const C = {
  blueSoft: "#eff6ff", greenSoft: "#ecfdf5", redSoft: "#fef2f2",
  orangeSoft: "#fff7ed", amberSoft: "#fffbeb", purpleSoft: "#f5f3ff",
  tealSoft: "#f0fdfa", blue: T.blue, green: T.green, red: T.red,
  orange: T.orange, amber: T.amber, purple: T.purple, teal: T.teal,
};

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function resolveDark() {
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  try {
    for (const key of ["theme","dashboard-theme","color-theme","app-theme"]) {
      const v = localStorage.getItem(key);
      if (v === "dark") return true;
      if (v === "light") return false;
    }
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function useDark() {
  const [dark, setDark] = useState(resolveDark);
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(resolveDark()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onStorage = (e) => { if (["theme","dashboard-theme","color-theme","app-theme"].includes(e.key ?? "")) setDark(resolveDark()); };
    window.addEventListener("storage", onStorage);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => setDark(resolveDark());
    mq.addEventListener("change", onMq);
    return () => { mo.disconnect(); window.removeEventListener("storage", onStorage); mq.removeEventListener("change", onMq); };
  }, []);
  return dark;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK = {
  // Super Admin
  utilTrend12: [
    { month: "Jun", rate: 72 }, { month: "Jul", rate: 74 }, { month: "Aug", rate: 71 },
    { month: "Sep", rate: 76 }, { month: "Oct", rate: 78 }, { month: "Nov", rate: 75 },
    { month: "Dec", rate: 73 }, { month: "Jan", rate: 77 }, { month: "Feb", rate: 79 },
    { month: "Mar", rate: 81 }, { month: "Apr", rate: 78 }, { month: "May", rate: 76 },
  ],
  resourceDist: [
    { name: "Technology", value: 46, color: T.blue },
    { name: "Operations", value: 25, color: T.green },
    { name: "Consulting", value: 18, color: T.purple },
    { name: "Support", value: 10, color: T.orange },
    { name: "Others", value: 5, color: T.gray },
  ],
  usersByRole: [
    { name: "Resource", value: 1842, pct: "72%", color: T.blue },
    { name: "Resource Manager", value: 345, pct: "14%", color: T.green },
    { name: "PMO", value: 198, pct: "8%", color: T.purple },
    { name: "Super Admin", value: 58, pct: "2%", color: T.orange },
    { name: "Others", value: 100, pct: "4%", color: T.gray },
  ],
  systemAlerts: [
    { label: "User Access Requests", count: 7, color: T.orange },
    { label: "Role Expirations", count: 4, color: T.red },
    { label: "Inactive Users (30+ days)", count: 23, color: T.amber },
    { label: "Workflow Exceptions", count: 5, color: T.purple },
  ],
  masterData: [
    { label: "Skills", value: 532, color: T.blue },
    { label: "Competencies", value: 256, color: T.green },
    { label: "Domains", value: 12, color: T.purple },
    { label: "Project Types", value: 18, color: T.orange },
    { label: "Active Certifications", value: 324, color: T.teal },
  ],
  userMgmt: [
    { type: "Active Users", count: 2480, color: T.green },
    { type: "Inactive Users", count: 63, color: T.gray },
    { type: "Locked Users", count: 14, color: T.red },
    { type: "New Users (30d)", count: 52, color: T.blue },
  ],

  // PMO
  demandVsCapacity: [
    { month: "Jan", demand: 820, capacity: 780, gap: 40 },
    { month: "Feb", demand: 850, capacity: 800, gap: 50 },
    { month: "Mar", demand: 900, capacity: 840, gap: 60 },
    { month: "Apr", demand: 870, capacity: 860, gap: 10 },
    { month: "May", demand: 920, capacity: 870, gap: 50 },
    { month: "Jun", demand: 960, capacity: 890, gap: 70 },
  ],
  demandStatus: [
    { name: "Open", value: 98, color: T.blue },
    { name: "In Progress", value: 72, color: T.amber },
    { name: "Fulfilled", value: 45, color: T.green },
    { name: "On Hold", value: 22, color: T.gray },
  ],
  projectStaffing: [
    { project: "Apollo", demand: 25, filled: 20, gap: 5, util: "80%" },
    { project: "Osprey", demand: 20, filled: 20, gap: 0, util: "100%" },
    { project: "Phoenix", demand: 18, filled: 15, gap: 3, util: "83%" },
    { project: "Titan", demand: 30, filled: 27, gap: 3, util: "90%" },
    { project: "Nebula", demand: 12, filled: 9, gap: 3, util: "75%" },
    { project: "Orion", demand: 10, filled: 7, gap: 3, util: "70%" },
  ],
  upcomingDemand: [
    { month: "Jun", demand: 85 }, { month: "Jul", demand: 92 },
    { month: "Aug", demand: 88 }, { month: "Sep", demand: 96 },
    { month: "Oct", demand: 102 }, { month: "Nov", demand: 98 },
  ],
  overallocated: [
    { name: "John Smith", pct: 140 }, { name: "Sarah Wilson", pct: 125 }, { name: "Karthik Rao", pct: 115 },
  ],
  topUnfilled: [
    { role: "AI Architect", gap: 8, urgent: true },
    { role: "Data Engineer", gap: 6, urgent: true },
    { role: "SAP Lead", gap: 5, urgent: false },
    { role: "Cloud Engineer", gap: 4, urgent: false },
    { role: "DevOps Engineer", gap: 4, urgent: false },
  ],
  pipeline: [
    { stage: "Draft", count: 32, color: T.gray },
    { stage: "Submitted", count: 45, color: T.blue },
    { stage: "Approved", count: 38, color: T.green },
    { stage: "Staffing", count: 67, color: T.amber },
    { stage: "Fulfilled", count: 120, color: T.teal },
    { stage: "Closed", count: 85, color: T.purple },
  ],

  // Resource Manager
  teamHeatmap: [
    { resource: "John Smith", project: "Apollo", util: 130, color: "#ef4444" },
    { resource: "Sarah Wilson", project: "Titan", util: 85, color: "#10b981" },
    { resource: "David Kumar", project: "Phoenix", util: 60, color: "#f59e0b" },
    { resource: "Priya Nair", project: "Osprey", util: 90, color: "#10b981" },
    { resource: "Rahul Sharma", project: "Nebula", util: 110, color: "#f97316" },
    { resource: "Anita Verma", project: "Orion", util: 70, color: "#f59e0b" },
  ],
  skills: [
    { skill: "React", count: 10, color: T.blue },
    { skill: "Java", count: 14, color: T.green },
    { skill: ".NET", count: 8, color: T.purple },
    { skill: "QA", count: 6, color: T.orange },
    { skill: "Azure", count: 12, color: T.sky },
    { skill: "Data Engg", count: 5, color: T.teal },
    { skill: "SAP", count: 3, color: T.amber },
    { skill: "Oracle", count: 5, color: T.red },
  ],
  bench: [
    { name: "Rahul Sharma", skill: "React", exp: "5 yrs", avail: "Immediate" },
    { name: "Priya Nair", skill: "QA", exp: "7 yrs", avail: "Immediate" },
    { name: "Alex Kumar", skill: ".NET", exp: "6 yrs", avail: "2 Weeks" },
    { name: "Meena Iyer", skill: "Java", exp: "4 yrs", avail: "1 Week" },
  ],
  rollOffs: [
    { name: "John Smith", project: "Apollo", date: "Jul 10" },
    { name: "Sarah Wilson", project: "Titan", date: "Jul 15" },
    { name: "David Kumar", project: "Phoenix", date: "Aug 2" },
  ],
  assignmentRequests: [
    { id: "AR-1256", project: "Osprey", role: "Data Engineer", by: "PMO", date: "20 May" },
    { id: "AR-1257", project: "Phoenix", role: "React Developer", by: "PMO", date: "20 May" },
    { id: "AR-1258", project: "Titan", role: "DevOps Engineer", by: "PMO", date: "20 May" },
    { id: "AR-1259", project: "Nebula", role: "QA Engineer", by: "PMO", date: "20 May" },
    { id: "AR-1260", project: "Orion", role: "Business Analyst", by: "PMO", date: "20 May" },
  ],
  resourceAvail: [
    { skill: "React", count: 10 }, { skill: ".NET", count: 14 }, { skill: "Data Engineering", count: 8 },
    { skill: "Azure", count: 12 }, { skill: "SAP", count: 6 }, { skill: "Oracle", count: 5 },
  ],

  // My Dashboard
  myAssignments: [
    { project: "Apollo", role: "Developer", alloc: 60, period: "01 Mar – 30 Jun" },
    { project: "Phoenix", role: "Data Analyst", alloc: 20, period: "16 Apr – 15 Jun" },
  ],
  myTasks: {
    todo: ["Requirements Documentation", "Dashboard & Analytics", "Stakeholder Meeting Prep", "Data Collection"],
    inprogress: ["UAT Sign-off", "Prototype Review"],
    awaiting: ["Report Review", "Metrics Review"],
    completed: ["Kick-off Meeting", "Data Mapping"],
  },
  upcomingActivities: [
    { label: "Performance Review", date: "30 May 2025", icon: "🎯", color: T.blue },
    { label: "Skill Assessment", date: "06 Jun 2025", icon: "📊", color: T.green },
    { label: "Certification Renewal", date: "15 Jun 2025", icon: "🏅", color: T.amber },
    { label: "Sprint Review", date: "18 Jun 2025", icon: "🔄", color: T.purple },
  ],
  mySkills: [
    { name: "React", level: 90, color: T.blue },
    { name: "TypeScript", level: 85, color: T.teal },
    { name: "Node.js", level: 75, color: T.green },
    { name: "Python", level: 70, color: T.amber },
    { name: "AWS", level: 65, color: T.orange },
  ],
  notifications: [
    { msg: "New Task Assigned", time: "3 hours ago", color: T.blue, dot: T.blue },
    { msg: "Demand Approved", time: "8 hours ago", color: T.green, dot: T.green },
    { msg: "Project Allocation Updated", time: "1 day ago", color: T.amber, dot: T.amber },
  ],
  learningProgress: [
    { course: "Azure AI Intermediate", pct: 68, color: T.sky },
    { course: "Power BI Intermediate", pct: 45, color: T.orange },
    { course: "Prompt Engineering Beginner", pct: 82, color: T.purple },
  ],
};

// ─── Shared Components ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.text, minWidth: 140 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: T.textMuted }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function DashSectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.sectionLabel, marginBottom: 10, paddingLeft: 2 }}>{children}</div>;
}

function CardShell({ title, subtitle, children, style = {} }) {
  return (
    <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 10, height: "100%", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function MiniBar({ value, max = 100, color = T.blue, height = 8 }) {
  return (
    <div style={{ flex: 1, height, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width .3s" }} />
    </div>
  );
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, valueColor, vsLabel, delta, deltaUp }) {
  return (
    <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "14px 14px 12px", minWidth: 0, position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: valueColor, borderRadius: "14px 14px 0 0" }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Icon size={14} color={iconColor} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: valueColor, lineHeight: 1, marginBottom: 3, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 9.5, color: T.textFaint, lineHeight: 1.4, marginBottom: 5, minHeight: 26 }}>{label}</div>
      <div style={{ fontSize: 9.5, color: T.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
        {deltaUp ? <ArrowUpRight size={10} color={T.green} /> : <ArrowDownRight size={10} color={T.red} />}
        <span style={{ color: deltaUp ? T.green : T.red, fontWeight: 700 }}>{delta}</span>
        <span>{vsLabel}</span>
      </div>
    </div>
  );
}

function StatusBadge({ color, bg, children }) {
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>{children}</span>;
}

function QuickActionBtn({ icon: Icon, label, color = T.blue, bg, onClick }: { icon: any; label: string; color?: string; bg?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: bg || `${color}15`, border: `1px solid ${color}30`, borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap", flex: 1, justifyContent: "center" }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
      onMouseLeave={e => e.currentTarget.style.background = bg || `${color}15`}>
      <Icon size={12} />{label}
    </button>
  );
}

// ─── Customize Sidebar ────────────────────────────────────────────────────────
interface CustomizeSidebarProps {
  onClose: () => void;
  onSave: () => void;
  kpiCards: (KpiConfig & { label: string })[];
  widgets: (WidgetConfig)[];
  filters: FilterConfig[];
  onToggleKpi: (id: string) => void;
  onToggleWidget: (id: string) => void;
  onToggleFilter: (id: string) => void;
  onReset: () => void;
  onReorderWidgets: (from: number, to: number) => void;
  onReorderKpis: (from: number, to: number) => void;
  onReorderFilters: (from: number, to: number) => void;
}

function CustomizeSidebar({ onClose, onSave, kpiCards, widgets, filters, onToggleKpi, onToggleWidget, onToggleFilter, onReset, onReorderWidgets, onReorderKpis, onReorderFilters }: CustomizeSidebarProps) {
  const [tab, setTab] = useState("widgets");
  const widgetDragRef = useRef<number | null>(null);
  const kpiDragRef = useRef<number | null>(null);
  const filterDragRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragGroup, setDragGroup] = useState<string | null>(null);

  const visibleCount = widgets.filter(w => w.checked).length;
  const allHidden = visibleCount === 0;

  // Determine active item list based on tab
  const tabItems = tab === "widgets" ? widgets : tab === "kpi" ? kpiCards : filters;
  const tabDragRef = tab === "widgets" ? widgetDragRef : tab === "kpi" ? kpiDragRef : filterDragRef;
  const tabToggle = (id: string) => {
    if (tab === "widgets") onToggleWidget(id);
    else if (tab === "kpi") onToggleKpi(id);
    else onToggleFilter(id);
  };
  const tabReorder = (from: number, to: number) => {
    if (tab === "widgets") onReorderWidgets(from, to);
    else if (tab === "kpi") onReorderKpis(from, to);
    else onReorderFilters(from, to);
  };

  return (
    <div style={{ width: 280, minWidth: 280, background: T.surface, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Customize Dashboard</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.textMuted }}>×</button>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, padding: "0 14px" }}>
        {[
          { id: "widgets", label: "Widgets" },
          { id: "kpi", label: "KPI Cards" },
          { id: "filters", label: "Filters" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "9px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${T.blue}` : "2px solid transparent", color: tab === t.id ? T.blue : T.textMuted }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 10.5, color: T.textFaint }}>
          {tab === "filters"
            ? "Toggle filters on/off and drag to reorder. Mandatory filters cannot be hidden."
            : "Toggle items on/off and drag to reorder."}
        </p>
        {allHidden && tab === "widgets" && (
          <div style={{ padding: "10px 12px", background: `${T.amber}15`, border: `1px solid ${T.amber}40`, borderRadius: 8, fontSize: 11, color: T.amber, fontWeight: 600 }}>
            ⚠ All widgets are hidden. Enable at least one widget.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tabItems.map((item, i) => {
            const isOver = dragGroup === tab && dragOver === i && dragging !== i;
            const isDragging = dragGroup === tab && dragging === i;
            const isMandatory = (item as FilterConfig).mandatory;
            return (
              <div key={item.id} draggable={!isMandatory}
                onDragStart={() => { tabDragRef.current = i; setDragging(i); setDragGroup(tab); }}
                onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                onDrop={() => {
                  if (tabDragRef.current !== null && tabDragRef.current !== i) {
                    tabReorder(tabDragRef.current, i);
                  }
                  setDragging(null); setDragOver(null); setDragGroup(null);
                }}
                onDragEnd={() => { setDragging(null); setDragOver(null); setDragGroup(null); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 9px", borderRadius: 7, background: isOver ? T.hoverBg : item.checked ? T.dragChecked : T.dragUnchecked, border: `1px solid ${isOver ? T.blue : item.checked ? T.dragCheckedBorder : T.border}`, opacity: isDragging ? 0.4 : 1, cursor: isMandatory ? "default" : "grab", userSelect: "none" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: isMandatory ? "default" : "pointer", flex: 1 }}>
                  <input type="checkbox" checked={item.checked} disabled={isMandatory} onChange={() => tabToggle(item.id)} style={{ accentColor: T.blue, width: 13, height: 13 }} />
                  <span style={{ fontSize: 10.5, color: T.textSec, fontWeight: 500 }}>{item.label}</span>
                  {isMandatory && <span style={{ fontSize: 9, color: T.textFaint, background: `${T.blue}15`, borderRadius: 4, padding: "1px 5px" }}>required</span>}
                </label>
                {!isMandatory && <span style={{ fontSize: 13, color: T.textMuted }}>⠿</span>}
              </div>
            );
          })}
        </div>
        <button onClick={onReset} style={{ padding: "8px 0", fontSize: 11, fontWeight: 700, color: "#fff", background: T.blue, border: "none", borderRadius: 8, cursor: "pointer" }}>↺ Reset to Default</button>
      </div>
      {/* Save Button */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={onSave}
          disabled={allHidden}
          style={{ width: "100%", padding: "10px 0", fontSize: 12, fontWeight: 700, color: "#fff", background: allHidden ? T.gray : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "none", borderRadius: 9, cursor: allHidden ? "not-allowed" : "pointer", boxShadow: allHidden ? "none" : "0 2px 10px rgba(37,99,235,0.3)", opacity: allHidden ? 0.6 : 1 }}>
          Save Dashboard
        </button>
        {allHidden && <p style={{ margin: "6px 0 0", fontSize: 10, color: T.red, textAlign: "center" }}>Enable at least one widget to save.</p>}
      </div>
    </div>
  );
}

// ─── SUPER ADMIN KPI & WIDGET DEFINITIONS ─────────────────────────────────────
const SA_KPI_DEFS = [
  { id: "sa_users", icon: Users, iconBg: C.blueSoft, iconColor: C.blue, label: "Total Users", value: "2,543", vsLabel: "vs last month", delta: "3.2%", deltaUp: true, valueColor: T.blue },
  { id: "sa_resources", icon: Briefcase, iconBg: C.greenSoft, iconColor: C.green, label: "Total Resources", value: "4,782", vsLabel: "vs last month", delta: "1.9%", deltaUp: true, valueColor: T.green },
  { id: "sa_projects", icon: Target, iconBg: C.orangeSoft, iconColor: C.orange, label: "Active Projects", value: "156", vsLabel: "vs last month", delta: "8%", deltaUp: true, valueColor: T.orange },
  { id: "sa_demands", icon: TrendingUp, iconBg: C.purpleSoft, iconColor: C.purple, label: "Open Demands", value: "237", vsLabel: "vs last month", delta: "10%", deltaUp: true, valueColor: T.purple },
  { id: "sa_util", icon: Gauge, iconBg: C.tealSoft, iconColor: C.teal, label: "Overall Utilization", value: "76%", vsLabel: "vs last month", delta: "4%", deltaUp: true, valueColor: T.teal },
  { id: "sa_approvals", icon: CheckCircle, iconBg: C.amberSoft, iconColor: C.amber, label: "Pending Approvals", value: "18", vsLabel: "vs last month", delta: "5%", deltaUp: false, valueColor: T.amber },
];
const SA_WIDGET_DEFS: WidgetConfig[] = [
  { id: "sa_overview", label: "System Overview", checked: true, row: 1 },
  { id: "sa_users_role", label: "Users by Role", checked: true, row: 1 },
  { id: "sa_master", label: "Master Data Overview", checked: true, row: 1 },
  { id: "sa_dist", label: "Resource Distribution", checked: true, row: 2 },
  { id: "sa_util_trend", label: "Utilization Trend", checked: true, row: 2 },
  { id: "sa_alerts", label: "System Alerts", checked: true, row: 2 },
  { id: "sa_user_mgmt", label: "User Management", checked: true, row: 3 },
  { id: "sa_quick", label: "Quick Actions", checked: true, row: 3 },
];

// ─── PMO KPI & WIDGET DEFINITIONS ─────────────────────────────────────────────
const PMO_KPI_DEFS = [
  { id: "pmo_demands", icon: TrendingUp, iconBg: C.blueSoft, iconColor: C.blue, label: "Open Demands", value: "237", vsLabel: "vs last month", delta: "16%", deltaUp: true, valueColor: T.blue },
  { id: "pmo_approvals", icon: CheckCircle, iconBg: C.amberSoft, iconColor: C.amber, label: "Pending Approvals", value: "18", vsLabel: "vs last month", delta: "8%", deltaUp: false, valueColor: T.amber },
  { id: "pmo_projects", icon: Briefcase, iconBg: C.greenSoft, iconColor: C.green, label: "Active Projects", value: "156", vsLabel: "vs last month", delta: "4%", deltaUp: true, valueColor: T.green },
  { id: "pmo_fulfill", icon: Target, iconBg: C.tealSoft, iconColor: C.teal, label: "Fulfillment Rate", value: "78%", vsLabel: "vs last month", delta: "8%", deltaUp: true, valueColor: T.teal },
  { id: "pmo_bench", icon: UserX, iconBg: C.purpleSoft, iconColor: C.purple, label: "Bench Resources", value: "412", vsLabel: "vs last month", delta: "8%", deltaUp: true, valueColor: T.purple },
  { id: "pmo_util", icon: Gauge, iconBg: C.orangeSoft, iconColor: C.orange, label: "Overall Utilization", value: "76%", vsLabel: "vs last month", delta: "4%", deltaUp: true, valueColor: T.orange },
];
const PMO_WIDGET_DEFS: WidgetConfig[] = [
  { id: "pmo_demandcap", label: "Demand vs Capacity", checked: true, row: 1 },
  { id: "pmo_status", label: "Demand Status", checked: true, row: 1 },
  { id: "pmo_unfilled", label: "Top Unfilled Demands", checked: true, row: 1 },
  { id: "pmo_staffing", label: "Project Staffing Overview", checked: true, row: 2 },
  { id: "pmo_forecast", label: "Upcoming Demand Forecast", checked: true, row: 2 },
  { id: "pmo_quick", label: "Quick Actions", checked: true, row: 2 },
];

// ─── RESOURCE MANAGER KPI & WIDGET DEFINITIONS ────────────────────────────────
const RM_KPI_DEFS = [
  { id: "rm_team", icon: Users, iconBg: C.blueSoft, iconColor: C.blue, label: "Team Size", value: "42", vsLabel: "vs last month", delta: "3%", deltaUp: true, valueColor: T.blue },
  { id: "rm_avail", icon: UserCheck, iconBg: C.greenSoft, iconColor: C.green, label: "Available Resources", value: "12", vsLabel: "vs last month", delta: "2%", deltaUp: true, valueColor: T.green },
  { id: "rm_alloc", icon: Briefcase, iconBg: C.orangeSoft, iconColor: C.orange, label: "Allocated Resources", value: "30", vsLabel: "vs last month", delta: "2%", deltaUp: true, valueColor: T.orange },
  { id: "rm_util", icon: Gauge, iconBg: C.purpleSoft, iconColor: C.purple, label: "Avg Utilization", value: "78%", vsLabel: "vs last month", delta: "4%", deltaUp: true, valueColor: T.purple },
  { id: "rm_requests", icon: Clock, iconBg: C.amberSoft, iconColor: C.amber, label: "Pending Requests", value: "5", vsLabel: "vs last month", delta: "2%", deltaUp: false, valueColor: T.amber },
  { id: "rm_rolloffs", icon: AlertTriangle, iconBg: C.redSoft, iconColor: C.red, label: "Upcoming Roll-Offs", value: "7", vsLabel: "Next 30 days", delta: "2%", deltaUp: false, valueColor: T.red },
];
const RM_WIDGET_DEFS: WidgetConfig[] = [
  { id: "rm_heatmap", label: "Team Utilization Heatmap", checked: true, row: 1 },
  { id: "rm_avail_chart", label: "Resource Availability", checked: true, row: 1 },
  { id: "rm_rolloffs", label: "Upcoming Roll-Offs", checked: true, row: 1 },
  { id: "rm_requests_table", label: "Assignment Requests", checked: true, row: 2 },
  { id: "rm_skills", label: "Skill Distribution", checked: true, row: 2 },
  { id: "rm_bench", label: "Bench Resources", checked: true, row: 3 },
  { id: "rm_quick", label: "Quick Actions", checked: true, row: 3 },
];

// ─── RESOURCE (My Dashboard) KPI & WIDGET DEFINITIONS ─────────────────────────
const MY_KPI_DEFS = [
  { id: "my_tasks", icon: CheckCircle, iconBg: C.blueSoft, iconColor: C.blue, label: "Assigned Tasks", value: "12", vsLabel: "3 overdue", delta: "3%", deltaUp: false, valueColor: T.blue },
  { id: "my_util", icon: Gauge, iconBg: C.greenSoft, iconColor: C.green, label: "Utilization", value: "80%", vsLabel: "on allocation", delta: "5%", deltaUp: true, valueColor: T.green },
  { id: "my_projects", icon: Briefcase, iconBg: C.purpleSoft, iconColor: C.purple, label: "Active Projects", value: "2", vsLabel: "active", delta: "0", deltaUp: true, valueColor: T.purple },
  { id: "my_upcoming", icon: Clock, iconBg: C.orangeSoft, iconColor: C.orange, label: "Upcoming Tasks", value: "5", vsLabel: "due this week", delta: "2%", deltaUp: false, valueColor: T.orange },
  { id: "my_skills", icon: Star, iconBg: C.tealSoft, iconColor: C.teal, label: "Skills", value: "18", vsLabel: "strong skills", delta: "3", deltaUp: true, valueColor: T.teal },
  { id: "my_certs", icon: Award, iconBg: C.amberSoft, iconColor: C.amber, label: "Certifications", value: "4", vsLabel: "active", delta: "1", deltaUp: true, valueColor: T.amber },
];
const MY_WIDGET_DEFS: WidgetConfig[] = [
  { id: "my_assignments", label: "My Assignments", checked: true, row: 1 },
  { id: "my_tasks_board", label: "My Tasks", checked: true, row: 1 },
  { id: "my_gauge", label: "Utilization Gauge", checked: true, row: 1 },
  { id: "my_activities", label: "Upcoming Activities", checked: true, row: 2 },
  { id: "my_skills_widget", label: "Skill Growth", checked: true, row: 2 },
  { id: "my_notifs", label: "Notifications", checked: true, row: 2 },
  { id: "my_quick", label: "Quick Actions", checked: true, row: 2 },
  { id: "my_learning", label: "Learning Progress", checked: true, row: 3 },
  { id: "my_leave", label: "Leave Summary", checked: true, row: 3 },
];

// ─── Default filter definitions (shared across all personas) ─────────────────
const DEFAULT_FILTERS: FilterConfig[] = [
  { id: "filter_pillar",        label: "Pillars",        checked: true,  order: 0 },
  { id: "filter_portfolio",     label: "Portfolio",      checked: true,  order: 1 },
  { id: "filter_region",        label: "Region",         checked: true,  order: 2 },
  { id: "filter_department",    label: "Department",     checked: true,  order: 3 },
  { id: "filter_resource_type", label: "Resource Type",  checked: false, order: 4 },
  { id: "filter_time_period",   label: "Time Period",    checked: true,  order: 5, mandatory: false },
];

// ─── Role → dashboard config mapper ──────────────────────────────────────────
function getRoleDashConfig(role: Role) {
  switch (role) {
    case "super_admin": return { persona: "super_admin", kpiDefs: SA_KPI_DEFS, widgetDefs: SA_WIDGET_DEFS };
    case "pmo": return { persona: "pmo", kpiDefs: PMO_KPI_DEFS, widgetDefs: PMO_WIDGET_DEFS };
    case "resource_manager": return { persona: "resource_manager", kpiDefs: RM_KPI_DEFS, widgetDefs: RM_WIDGET_DEFS };
    case "resource": return { persona: "resource", kpiDefs: MY_KPI_DEFS, widgetDefs: MY_WIDGET_DEFS };
    default: return { persona: "resource", kpiDefs: MY_KPI_DEFS, widgetDefs: MY_WIDGET_DEFS };
  }
}

function getDashMeta(role: Role) {
  switch (role) {
    case "super_admin": return { title: "Super Admin Dashboard", subtitle: "Enterprise-wide visibility and governance." };
    case "pmo": return { title: "PMO Dashboard", subtitle: "Workforce planning overview and demand fulfillment status." };
    case "resource_manager": return { title: "Resource Manager Dashboard", subtitle: "Manage your team's allocation, utilization and resource availability." };
    case "resource": return { title: "Resource Dashboard", subtitle: "Your personal work summary and tasks." };
    default: return { title: "Dashboard", subtitle: "" };
  }
}

// ─── Widget renderers ─────────────────────────────────────────────────────────
function renderSAWidget(id: string, axisProps: object, navigate: (path: string) => void) {
  switch (id) {
    case "sa_overview": return (
      <CardShell title="System Overview">
        {[["Business Units","12",T.blue],["Domains","21",T.green],["Practices","28",T.purple],["Locations","15",T.orange],["Active Workflows","9",T.teal]].map(([l,v,c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: c }} />
              <span style={{ color: T.textSec }}>{l}</span>
            </div>
            <span style={{ fontWeight: 700, color: T.text }}>{v}</span>
          </div>
        ))}
      </CardShell>
    );
    case "sa_users_role": return (
      <CardShell title="Users by Role">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <PieChart width={100} height={100}>
              <Pie data={MOCK.usersByRole} cx={49} cy={49} innerRadius={28} outerRadius={46} dataKey="value" startAngle={90} endAngle={-270}>
                {MOCK.usersByRole.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
              </Pie>
            </PieChart>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>2,543</div>
              <div style={{ fontSize: 8, color: T.textMuted }}>Total</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {MOCK.usersByRole.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ color: T.textSec, flex: 1 }}>{d.name}</span>
                <span style={{ fontWeight: 700, color: T.text }}>{d.value.toLocaleString()}</span>
                <span style={{ color: T.textFaint }}>({d.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </CardShell>
    );
    case "sa_master": return (
      <CardShell title="Master Data Overview">
        {MOCK.masterData.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", fontSize: 11 }}>
            <span style={{ color: T.textSec }}>{d.label}</span>
            <span style={{ fontWeight: 700, color: d.color, background: `${d.color}15`, padding: "2px 8px", borderRadius: 99, fontSize: 10.5 }}>{d.value}</span>
          </div>
        ))}
      </CardShell>
    );
    case "sa_dist": return (
      <CardShell title="Resource Distribution by Domain">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <PieChart width={110} height={110}>
              <Pie data={MOCK.resourceDist} cx={54} cy={54} innerRadius={32} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                {MOCK.resourceDist.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
              </Pie>
            </PieChart>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>4,782</div>
              <div style={{ fontSize: 8, color: T.textMuted }}>Resources</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            {MOCK.resourceDist.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ color: T.textSec, flex: 1 }}>{d.name}</span>
                <MiniBar value={d.value} max={50} color={d.color} height={6} />
                <span style={{ fontWeight: 700, color: T.text, minWidth: 28, textAlign: "right" }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardShell>
    );
    case "sa_util_trend": return (
      <CardShell title="Utilization Trend (Last 12 Months)">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MOCK.utilTrend12} margin={{ top: 4, right: 4, bottom: 4, left: -18 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis domain={[65, 85]} {...axisProps} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <defs><linearGradient id="saUG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.25} /><stop offset="100%" stopColor={T.blue} stopOpacity={0.01} /></linearGradient></defs>
            <Area type="monotone" dataKey="rate" stroke={T.blue} strokeWidth={2.5} fill="url(#saUG)" dot={{ r: 3, fill: T.blue }} name="Utilization %" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ textAlign: "right", fontSize: 10, color: T.textFaint }}>May 76% <span style={{ color: T.blue, fontWeight: 700 }}>▲</span></div>
      </CardShell>
    );
    case "sa_alerts": return (
      <CardShell title="System Alerts">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "API Status", status: "Operational", color: T.green },
            { label: "Workflow Status", status: "Running", color: T.green },
            { label: "Security Alerts", status: "2 Active", color: T.red },
            { label: "Integration Status", status: "Degraded", color: T.orange },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", background: T.surfaceAlt, borderRadius: 7, fontSize: 11 }}>
              <span style={{ color: T.textSec }}>{s.label}</span>
              <StatusBadge color={s.color} bg={`${s.color}15`}>{s.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8, marginTop: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>Alert Summary</div>
          {MOCK.systemAlerts.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "2px 0", color: T.textMuted }}>
              <span>{a.label}</span>
              <span style={{ fontWeight: 700, color: a.color }}>{a.count}</span>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "sa_user_mgmt": return (
      <CardShell title="User Management Summary">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MOCK.userMgmt.map((u, i) => (
            <div key={i} style={{ background: T.surfaceAlt, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: u.color }}>{u.count.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>{u.type}</div>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "sa_quick": return (
      <CardShell title="Quick Actions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <QuickActionBtn icon={UserCheck} label="Create User" color={T.blue} onClick={() => navigate("/user-management")} />
          <QuickActionBtn icon={Shield} label="Manage Roles" color={T.green} onClick={() => navigate("/user-management")} />
          <QuickActionBtn icon={Database} label="Import Data" color={T.orange} onClick={() => navigate("/resources")} />
          <QuickActionBtn icon={FileText} label="View Audit Logs" color={T.gray} onClick={() => navigate("/audit-log")} />
        </div>
      </CardShell>
    );
    default: return null;
  }
}

function renderPMOWidget(id: string, axisProps: object, navigate: (path: string) => void) {
  switch (id) {
    case "pmo_demandcap": return (
      <CardShell title="Demand vs Capacity (Next 6 Months)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MOCK.demandVsCapacity} barSize={10} barCategoryGap="28%" margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9, paddingTop: 6 }} />
            <Bar dataKey="demand" fill={T.blue} radius={[3, 3, 0, 0]} name="Demand" />
            <Bar dataKey="capacity" fill={T.green} radius={[3, 3, 0, 0]} name="Capacity" />
            <Line type="monotone" dataKey="gap" stroke={T.red} strokeWidth={2} dot={{ r: 3, fill: T.red }} name="Gap" />
          </BarChart>
        </ResponsiveContainer>
      </CardShell>
    );
    case "pmo_status": return (
      <CardShell title="Demand Status" subtitle="Current period breakdown">
        <div style={{ position: "relative", height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={MOCK.demandStatus} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {MOCK.demandStatus.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>237</div>
            <div style={{ fontSize: 9, color: T.textMuted }}>Total</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {MOCK.demandStatus.map(d => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color }} />
                <span style={{ color: T.textSec }}>{d.name}</span>
              </div>
              <span style={{ fontWeight: 700, color: T.text }}>{d.value}</span>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "pmo_unfilled": return (
      <CardShell title="Top Unfilled Demands" subtitle="By role & gap">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK.topUnfilled.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, color: T.textSec, minWidth: 100 }}>{r.role}</span>
              <MiniBar value={r.gap} max={10} color={r.urgent ? T.red : T.orange} height={8} />
              <span style={{ fontSize: 11, fontWeight: 700, color: r.urgent ? T.red : T.orange, minWidth: 16 }}>{r.gap}</span>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "pmo_staffing": return (
      <CardShell title="Project Staffing Overview">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Project","Total Demand","Filled","Gap","Utilization"].map(h => (
                  <th key={h} style={{ padding: "4px 6px", textAlign: h === "Project" ? "left" : "right", color: T.textFaint, fontWeight: 600, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.projectStaffing.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "5px 6px", color: T.text, fontWeight: 600 }}>{r.project}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: T.textSec }}>{r.demand}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: T.green, fontWeight: 600 }}>{r.filled}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: r.gap > 0 ? T.red : T.green, fontWeight: 600 }}>{r.gap}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right" }}>
                    <span style={{ color: parseInt(r.util) >= 90 ? T.green : T.amber, fontWeight: 700 }}>{r.util}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardShell>
    );
    case "pmo_forecast": return (
      <CardShell title="Upcoming Demand Forecast" subtitle="Next 6 months">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MOCK.upcomingDemand} margin={{ top: 4, right: 4, bottom: 4, left: -18 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <defs><linearGradient id="pmoFG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.teal} stopOpacity={0.25} /><stop offset="100%" stopColor={T.teal} stopOpacity={0.01} /></linearGradient></defs>
            <Area type="monotone" dataKey="demand" stroke={T.teal} strokeWidth={2.5} fill="url(#pmoFG)" dot={{ r: 3, fill: T.teal }} name="Demand FTE" />
          </AreaChart>
        </ResponsiveContainer>
      </CardShell>
    );
    case "pmo_quick": return (
      <CardShell title="Quick Actions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <QuickActionBtn icon={Plus} label="Create/Import Demand" color={T.blue} onClick={() => navigate("/demand/create")} />
          <QuickActionBtn icon={CheckCircle} label="Allocation Review & Approval" color={T.green} onClick={() => navigate("/resource-review")} />
          <QuickActionBtn icon={BarChart2} label="Demand Summary" color={T.purple} onClick={() => navigate("/demand")} />
          <QuickActionBtn icon={Target} label="Capacity Plan" color={T.teal} onClick={() => navigate("/scenario-plannig")} />
          <QuickActionBtn icon={Search} label="Resource Search" color={T.gray} onClick={() => navigate("/resources")} />
        </div>
      </CardShell>
    );
    default: return null;
  }
}

function renderRMWidget(id: string, axisProps: object, navigate: (path: string) => void) {
  function getHeatColor(util: number) {
    if (util > 110) return { bg: "#fef2f2", text: T.red, bar: T.red };
    if (util > 90) return { bg: "#fff7ed", text: T.orange, bar: T.orange };
    if (util > 75) return { bg: "#f0fdf4", text: T.green, bar: T.green };
    return { bg: "#fefce8", text: T.amber, bar: T.amber };
  }
  switch (id) {
    case "rm_heatmap": return (
      <CardShell title="Team Utilization Heatmap">
        <div style={{ display: "flex", gap: 4, marginBottom: 6, fontSize: 9, color: T.textFaint, paddingLeft: 90 }}>
          {[0, 25, 50, 75, "100%", "125%+"].map((v, i) => <span key={i} style={{ flex: 1, textAlign: "center" }}>{v}</span>)}
        </div>
        {MOCK.teamHeatmap.map((r, i) => {
          const c = getHeatColor(r.util);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: T.textSec, minWidth: 88 }}>{r.resource}</span>
              <div style={{ flex: 1, height: 20, background: T.borderLight, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${Math.min((r.util / 130) * 100, 100)}%`, height: "100%", background: c.bar, borderRadius: 4 }} />
                <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 700, color: c.text }}>{r.util}%</div>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {[["≤75%", T.amber], ["76-90%", T.green], ["91-110%", T.orange], [">110%", T.red]].map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: T.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "rm_avail_chart": return (
      <CardShell title="Resource Availability" subtitle="Next 90 days">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK.resourceAvail.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, color: T.textSec, minWidth: 92 }}>{r.skill}</span>
              <MiniBar value={r.count} max={16} color={T.blue} height={10} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text, minWidth: 16, textAlign: "right" }}>{r.count}</span>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "rm_rolloffs": return (
      <CardShell title="Upcoming Roll-Offs" subtitle="Next 30 days">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MOCK.rollOffs.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: T.rowAlert, borderRadius: 8, border: `1px solid ${T.red}20`, fontSize: 11 }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{r.name}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{r.project}</div>
              </div>
              <span style={{ color: T.red, fontWeight: 700, fontSize: 10.5 }}>{r.date}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, padding: "8px 10px", background: `${T.orange}10`, borderRadius: 8, border: `1px solid ${T.orange}25`, fontSize: 11 }}>
          <span style={{ color: T.orange, fontWeight: 600 }}>⚠ 4 more roll-offs in August</span>
        </div>
      </CardShell>
    );
    case "rm_requests_table": return (
      <CardShell title="Assignment Requests (5)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Request ID","Project","Role","Requested By","Date","Action"].map(h => (
                  <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: T.textFaint, fontWeight: 600, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.assignmentRequests.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "5px 6px", color: T.blue, fontWeight: 600 }}>{r.id}</td>
                  <td style={{ padding: "5px 6px", color: T.textSec }}>{r.project}</td>
                  <td style={{ padding: "5px 6px", color: T.text }}>{r.role}</td>
                  <td style={{ padding: "5px 6px", color: T.textMuted }}>{r.by}</td>
                  <td style={{ padding: "5px 6px", color: T.textFaint }}>{r.date}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: "#fff", background: T.green, border: "none", borderRadius: 5, cursor: "pointer" }}>Approve</button>
                      <button style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: "#fff", background: T.red, border: "none", borderRadius: 5, cursor: "pointer" }}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardShell>
    );
    case "rm_skills": return (
      <CardShell title="Skill Distribution">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MOCK.skills} layout="vertical" barSize={9} margin={{ top: 4, right: 20, bottom: 4, left: 50 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} horizontal={false} />
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="skill" tick={{ fontSize: 10, fill: T.textMuted }} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 3, 3, 0]} name="Resources">
              {MOCK.skills.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardShell>
    );
    case "rm_bench": return (
      <CardShell title="Bench Resources" subtitle="Available for immediate allocation">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Resource","Skill","Experience","Availability"].map(h => (
                  <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: T.textFaint, fontWeight: 600, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.bench.map((b, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "5px 6px", color: T.text, fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: "5px 6px" }}><StatusBadge color={T.blue} bg={`${T.blue}15`}>{b.skill}</StatusBadge></td>
                  <td style={{ padding: "5px 6px", color: T.textSec }}>{b.exp}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <StatusBadge color={b.avail === "Immediate" ? T.green : T.amber} bg={`${b.avail === "Immediate" ? T.green : T.amber}15`}>{b.avail}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardShell>
    );
    case "rm_quick": return (
      <CardShell title="Quick Actions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <QuickActionBtn icon={UserCheck} label="Assign Resource" color={T.blue} onClick={() => navigate("/demand")} />
          <QuickActionBtn icon={CheckCircle} label="Allocation Review & Approval" color={T.green} onClick={() => navigate("/resource-review")} />
          <QuickActionBtn icon={Search} label="Resource Search" color={T.green} onClick={() => navigate("/resources")} />
          <QuickActionBtn icon={UserX} label="View Bench" color={T.amber} onClick={() => navigate("/resources")} />
        </div>
      </CardShell>
    );
    default: return null;
  }
}

function renderMyWidget(id: string, navigate: (path: string) => void) {
  switch (id) {
    case "my_assignments": return (
      <CardShell title="My Assignments">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Project","Role","Allocation","Period"].map(h => (
                  <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: T.textFaint, fontWeight: 600, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.myAssignments.map((a, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "5px 6px", color: T.text, fontWeight: 700 }}>{a.project}</td>
                  <td style={{ padding: "5px 6px", color: T.textSec }}>{a.role}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MiniBar value={a.alloc} max={100} color={T.blue} height={7} />
                      <span style={{ fontWeight: 700, color: T.blue, minWidth: 28 }}>{a.alloc}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", color: T.textFaint, fontSize: 10 }}>{a.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "7px 10px", background: `${T.blue}08`, borderRadius: 8, fontSize: 10.5 }}>
          <span style={{ color: T.textMuted }}>Total Allocation: </span>
          <span style={{ fontWeight: 700, color: T.blue }}>80%</span>
          <span style={{ color: T.textMuted }}> · Available: </span>
          <span style={{ fontWeight: 700, color: T.green }}>20%</span>
        </div>
      </CardShell>
    );
    case "my_tasks_board": return (
      <CardShell title="My Tasks">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "To Do", tasks: MOCK.myTasks.todo, color: T.gray },
            { label: "In Progress", tasks: MOCK.myTasks.inprogress, color: T.blue },
            { label: "Awaiting Approval", tasks: MOCK.myTasks.awaiting, color: T.amber },
            { label: "Completed", tasks: MOCK.myTasks.completed, color: T.green },
          ].map(col => (
            <div key={col.label} style={{ background: T.surfaceAlt, borderRadius: 8, padding: "8px 10px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: col.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.label} ({col.tasks.length})</div>
              {col.tasks.map((t, i) => (
                <div key={i} style={{ fontSize: 10, color: T.textSec, padding: "3px 0", borderBottom: i < col.tasks.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>{t}</div>
              ))}
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "my_gauge": return (
      <CardShell title="Utilization">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 8 }}>
          <div style={{ width: 110, height: 110, borderRadius: "50%", border: `10px solid ${T.blue}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px ${T.blue}20` }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>80%</span>
            <span style={{ fontSize: 9, color: T.textMuted }}>Current</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 10, color: T.textFaint }}>
            <span>0%</span><span style={{ color: T.blue, fontWeight: 600 }}>Target: 85%</span><span>100%</span>
          </div>
          <div style={{ width: "100%", height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: "80%", height: "100%", background: T.blue, borderRadius: 4 }} />
          </div>
          <div style={{ background: `${T.green}12`, color: T.green, borderRadius: 99, padding: "3px 12px", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <ArrowUpRight size={11} /> +5pp vs last month
          </div>
        </div>
      </CardShell>
    );
    case "my_activities": return (
      <CardShell title="Upcoming Activities">
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {MOCK.upcomingActivities.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{a.label}</div>
                <div style={{ fontSize: 10, color: T.textFaint }}>{a.date}</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "my_skills_widget": return (
      <CardShell title="Skill Growth" subtitle="Recommended for you">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK.mySkills.map((s, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}>
                <span style={{ color: T.textSec, fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.level}%</span>
              </div>
              <MiniBar value={s.level} max={100} color={s.color} height={7} />
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "my_notifs": return (
      <CardShell title="Notifications">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MOCK.notifications.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "7px 10px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{n.msg}</div>
                <div style={{ fontSize: 10, color: T.textFaint, marginTop: 1 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "my_quick": return (
      <CardShell title="Quick Actions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <QuickActionBtn icon={Users} label="Update Profile" color={T.blue} onClick={() => navigate("/resources")} />
          <QuickActionBtn icon={Star} label="Update Skills" color={T.teal} onClick={() => navigate("/resources")} />
          <QuickActionBtn icon={Briefcase} label="View Assignments" color={T.purple} onClick={() => navigate("/allocation")} />
        </div>
      </CardShell>
    );
    case "my_learning": return (
      <CardShell title="Learning Progress">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK.learningProgress.map((c, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: T.textSec, fontWeight: 500 }}>{c.course}</span>
                <span style={{ fontWeight: 700, color: c.color }}>{c.pct}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: T.borderLight, overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 99, transition: "width .4s" }} />
              </div>
            </div>
          ))}
        </div>
      </CardShell>
    );
    case "my_leave": return (
      <CardShell title="Leave Summary">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Available", "12", T.green], ["Used", "8", T.orange], ["Upcoming", "2", T.blue]].map(([l, v, c]) => (
            <div key={l} style={{ background: `${c}10`, border: `1px solid ${c}25`, borderRadius: 9, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 9.5, color: T.textFaint, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 4, fontSize: 10.5, color: T.textFaint, padding: "6px 8px", background: T.surfaceAlt, borderRadius: 7 }}>
          Next leave: <span style={{ color: T.blue, fontWeight: 600 }}>Jul 4 – Jul 6</span> · Approved
        </div>
      </CardShell>
    );
    default: return null;
  }
}

// ─── Dashboard Content (shared layout for all roles) ──────────────────────────
interface DashboardContentProps {
  role: Role;
  widgets: WidgetConfig[];
  kpiCards: KpiConfig[];
}

function DashboardContent({ role, widgets, kpiCards }: DashboardContentProps) {
  const axisProps = { tick: { fontSize: 9, fill: T.textMuted } };
  const navigate = useNavigate();

  // Build KPI defs lookup
  const kpiDefMap = useMemo(() => {
    let defs = role === "super_admin" ? SA_KPI_DEFS : role === "pmo" ? PMO_KPI_DEFS : role === "resource_manager" ? RM_KPI_DEFS : MY_KPI_DEFS;
    const m = new Map(defs.map(d => [d.id, d]));
    return m;
  }, [role]);

  const visibleKpi = kpiCards.filter(k => k.checked).map(k => kpiDefMap.get(k.id)).filter(Boolean);
  const visibleWidgets = widgets.filter(w => w.checked);

  // Group widgets into rows preserving order
  const rowMap = useMemo(() => {
    const m = new Map<number, WidgetConfig[]>();
    for (const w of visibleWidgets) {
      const r = w.row || 1;
      if (!m.has(r)) m.set(r, []);
      m.get(r)!.push(w);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a - b);
  }, [visibleWidgets]);

  const rowLabels: Record<number, Record<string, string>> = {
    super_admin: { 1: "Organization Overview", 2: "Resource & System Insights", 3: "Team & Actions" },
    pmo: { 1: "Demand Pipeline & Alerts", 2: "Demand Analysis & Staffing", 3: "Forecast & Actions" },
    resource_manager: { 1: "Team Overview", 2: "Requests & Skills", 3: "Bench & Actions" },
    resource: { 1: "Work Summary", 2: "Activities & Growth", 3: "Learning & Leave" },
  } as any;

  function renderWidget(id: string) {
    switch (role) {
      case "super_admin": return renderSAWidget(id, axisProps, navigate);
      case "pmo": return renderPMOWidget(id, axisProps, navigate);
      case "resource_manager": return renderRMWidget(id, axisProps, navigate);
      case "resource": return renderMyWidget(id, navigate);
      default: return null;
    }
  }

  if (visibleKpi.length === 0 && visibleWidgets.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: T.textMuted }}>
        <div style={{ fontSize: 32 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>No widgets visible</div>
        <div style={{ fontSize: 12, color: T.textFaint }}>Open Customize Dashboard to enable widgets.</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      {visibleKpi.length > 0 && (<>
        <DashSectionLabel>Key Performance Indicators</DashSectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(visibleKpi.length, 6)}, minmax(0,1fr))`, gap: 10, marginBottom: 8 }}>
          {visibleKpi.map(k => <KpiCard key={k!.id} {...(k as any)} />)}
        </div>
      </>)}
      {rowMap.map(([rowNum, rowWidgets]) => (
        <div key={rowNum} style={{ marginBottom: 4 }}>
          <DashSectionLabel>{(rowLabels as any)[role]?.[rowNum] ?? `Section ${rowNum}`}</DashSectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${rowWidgets.length}, minmax(0,1fr))`, gap: 12, marginBottom: 4 }}>
            {rowWidgets.map(w => <div key={w.id} style={{ minWidth: 0 }}>{renderWidget(w.id)}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Role-based Dashboard Shell (uses useDashboardConfig) ─────────────────────
// ─── Active-view constants ─────────────────────────────────────────────────
const DEFAULT_VIEW_ID = "default";
const DEFAULT_VIEW_NAME = "Default View";

function RoleDashboard({ role }: { role: Role }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { persona, kpiDefs, widgetDefs } = getRoleDashConfig(role);
  const kpiIds = kpiDefs.map(k => k.id);

  const {
    widgets, kpiCards, filters,
    setWidgets, setKpiCards, setFilters,
    saveConfig, resetConfig,
    toggleWidget, toggleKpi, toggleFilter,
    reorderWidgets, reorderKpis, reorderFilters,
  } = useDashboardConfig(persona, widgetDefs, kpiIds, DEFAULT_FILTERS);

  // ─── Active View state ────────────────────────────────────────────────────
  // "default" means the Default View (system baseline, never modified).
  // Any other value is a SavedDashboard.id.
  const [activeViewId, setActiveViewId] = useState<string>(DEFAULT_VIEW_ID);
  const [activeViewName, setActiveViewName] = useState<string>(DEFAULT_VIEW_NAME);
  const [savedViews, setSavedViews] = useState<SavedDashboard[]>([]);

  // Load saved views list for this user+persona whenever it may change
  function refreshSavedViews() {
    if (!user) return;
    const all = DashboardService.getForUser(user.id).filter(
      (d) => d.persona === persona
    );
    setSavedViews(all);
  }

  useEffect(() => {
    refreshSavedViews();
  }, [user?.id, persona]);

  // ─── Auto-select view when navigated from My Dashboard ────────────────────
  useEffect(() => {
    const state = location.state as { viewId?: string } | null;
    if (!state?.viewId) return;
    // Use setTimeout to ensure refreshSavedViews has settled its state
    const id = state.viewId;
    if (id === DEFAULT_VIEW_ID) {
      handleSelectView(DEFAULT_VIEW_ID);
    } else {
      // Small defer so savedViews state is populated before we try to select
      const timer = setTimeout(() => handleSelectView(id), 0);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // ─── Switch view ──────────────────────────────────────────────────────────
  function handleSelectView(id: string) {
    if (id === DEFAULT_VIEW_ID) {
      // Restore Default View: reset to system defaults
      resetConfig();
      setActiveViewId(DEFAULT_VIEW_ID);
      setActiveViewName(DEFAULT_VIEW_NAME);
      setShowCustomize(false);
      return;
    }
    // Load a saved view
    const dash = DashboardService.getById(id);
    if (!dash) return;

    // Apply saved widget / kpi / filter config
    const mergedWidgets = widgetDefs.map((w, i) => {
      const saved = dash.widgetConfig.find((s) => s.id === w.id);
      return saved ? { ...w, checked: saved.checked, order: saved.order ?? i } : { ...w, order: i };
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const mergedKpis = kpiIds.map((id) => {
      const saved = dash.kpiConfig.find((k) => k.id === id);
      return { id, checked: saved ? saved.checked : true };
    });

    const mergedFilters = DEFAULT_FILTERS.map((f, i) => {
      const saved = dash.filterConfig.find((s) => s.id === f.id);
      if (saved) return { ...f, checked: f.mandatory ? true : saved.checked, order: saved.order ?? i };
      return { ...f, order: i };
    }).sort((a, b) => a.order - b.order);

    setWidgets(mergedWidgets);
    setKpiCards(mergedKpis);
    setFilters(mergedFilters);
    setActiveViewId(id);
    setActiveViewName(dash.name);
    setShowCustomize(false);
  }

  // Build kpiCards with labels for sidebar
  const kpiWithLabels = kpiCards.map(k => {
    const def = kpiDefs.find(d => d.id === k.id);
    return { ...k, label: def?.label ?? k.id };
  });

  const [showCustomize, setShowCustomize] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const meta = getDashMeta(role);

  // "Save & View Dashboard" clicked in sidebar → open dialog
  const handleSaveClick = () => {
    setShowCustomize(false);
    setShowSaveDialog(true);
  };

  // Dialog saved successfully → navigate to My Dashboard so the user sees their new view
  const handleDialogSaved = (dashId: string, dashName: string) => {
    setShowSaveDialog(false);
    // NOTE: We intentionally do NOT call saveConfig() here — the Default View
    // localStorage config must remain unchanged.  The saved view lives only in
    // DashboardService (SavedDashboard records).
    navigate("/mydashboard", {
      state: { fromSave: true, dashboardId: dashId, dashboardName: dashName },
    });
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Shared header with filters + Active View selector */}
        <DashboardHeader
          title={meta.title}
          subtitle={meta.subtitle}
          filters={filters}
          onCustomize={() => setShowCustomize(c => !c)}
          showCustomize={showCustomize}
          activeViewId={activeViewId}
          activeViewName={activeViewName}
          savedViews={savedViews}
          onSelectView={handleSelectView}
        />

        {/* Main layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
          <DashboardContent role={role} widgets={widgets} kpiCards={kpiCards} />
          {showCustomize && (
            <CustomizeSidebar
              onClose={() => setShowCustomize(false)}
              onSave={handleSaveClick}
              kpiCards={kpiWithLabels}
              widgets={widgets}
              filters={filters}
              onToggleKpi={toggleKpi}
              onToggleWidget={toggleWidget}
              onToggleFilter={toggleFilter}
              onReset={resetConfig}
              onReorderWidgets={reorderWidgets}
              onReorderKpis={reorderKpis}
              onReorderFilters={reorderFilters}
            />
          )}
        </div>

        {/* Save Dashboard Dialog */}
        {showSaveDialog && (
          <SaveDashboardDialog
            userId={user?.id ?? "anonymous"}
            username={user?.username ?? "User"}
            persona={persona}
            role={role}
            widgets={widgets}
            kpiCards={kpiCards}
            filters={filters}
            onSaved={handleDialogSaved}
            onCancel={() => setShowSaveDialog(false)}
          />
        )}
      </div>
    </>
  );
}

// ─── Main Export: role-based routing ─────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role as Role) ?? "resource";
  return <RoleDashboard role={role} />;
}