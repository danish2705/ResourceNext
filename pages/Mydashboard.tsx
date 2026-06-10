import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Star,
  Lock,
  Unlock,
  MoreHorizontal,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Clock,
  Trash2,
  Edit3,
  Copy,
  TrendingUp,
  X,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { DashboardService } from "@/components/DashboardService";

// ─── CSS custom properties — same system as Dashboard.tsx ─────────────────────
function GlobalStyles() {
  return (
    <style>{`
      :root {
        --db-bg:           #f3f4f6;
        --db-surface:      #ffffff;
        --db-surface-alt:  #f9fafb;
        --db-border:       #e5e7eb;
        --db-border-light: #f3f4f6;
        --db-text-primary: #111827;
        --db-text-sec:     #374151;
        --db-text-muted:   #6b7280;
        --db-text-faint:   #9ca3af;
        --db-input-bg:     #ffffff;
        --db-card-hover:   #fafbfc;
        --db-star-active:  #f59e0b;
        --db-star-inactive:#d1d5db;
        --db-active-ring:  #2563eb;
        --db-preview-bg:   #f3f4f6;
        --db-preview-line: #e5e7eb;
      }
      .dark {
        --db-bg:           #0f1117;
        --db-surface:      #1a1d27;
        --db-surface-alt:  #1f2231;
        --db-border:       #2d3148;
        --db-border-light: #252838;
        --db-text-primary: #f1f5f9;
        --db-text-sec:     #cbd5e1;
        --db-text-muted:   #8b99b5;
        --db-text-faint:   #4f5b73;
        --db-input-bg:     #1f2231;
        --db-card-hover:   #242830;
        --db-star-active:  #f59e0b;
        --db-star-inactive:#374151;
        --db-active-ring:  #3b82f6;
        --db-preview-bg:   #13161c;
        --db-preview-line: #2d3139;
      }
      * { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease; }
    `}</style>
  );
}

// ─── Token shorthands (CSS vars — auto dark/light, no JS logic needed) ────────
const T = {
  bg: "var(--db-bg)",
  surface: "var(--db-surface)",
  border: "var(--db-border)",
  text: "var(--db-text-primary)",
  textSec: "var(--db-text-sec)",
  textMuted: "var(--db-text-muted)",
  textFaint: "var(--db-text-faint)",
  inputBg: "var(--db-input-bg)",
  cardHover: "var(--db-card-hover)",
  starActive: "var(--db-star-active)",
  starInactive: "var(--db-star-inactive)",
  activeRing: "var(--db-active-ring)",
  previewBg: "var(--db-preview-bg)",
  previewLine: "var(--db-preview-line)",
};

// ─── Passive theme listener — watches <html class> set by profile dropdown ────
function resolveDark(): boolean {
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  try {
    for (const key of [
      "theme",
      "dashboard-theme",
      "color-theme",
      "app-theme",
    ]) {
      const v = localStorage.getItem(key);
      if (v === "dark") return true;
      if (v === "light") return false;
    }
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useDark(): boolean {
  const [dark, setDark] = useState<boolean>(resolveDark);
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(resolveDark()));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const onStorage = (e: StorageEvent) => {
      if (
        ["theme", "dashboard-theme", "color-theme", "app-theme"].includes(
          e.key ?? "",
        )
      )
        setDark(resolveDark());
    };
    window.addEventListener("storage", onStorage);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => setDark(resolveDark());
    mq.addEventListener("change", onMq);
    return () => {
      mo.disconnect();
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", onMq);
    };
  }, []);
  return dark;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardCard {
  id: string;
  name: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  workspace: string;
  workspaceIcon: string;
  isStarred: boolean;
  isLocked: boolean;
  permission: "owner" | "editor" | "viewer";
  lastModified: Date;
  widgetCount: number;
  kpiCount: number;
  previewWidgets: string[];
  isActive: boolean;
  isSharedWithMe?: boolean;
}

// ─── Mini Dashboard Preview ───────────────────────────────────────────────────
function DashboardPreview({ widgets }: { widgets: string[] }) {
  const sectionColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];
  const bars = [65, 80, 55, 90, 70, 45, 85, 60, 75];
  return (
    <div
      style={{
        background: T.previewBg,
        borderRadius: 8,
        padding: "12px 10px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 140,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 18,
              borderRadius: 4,
              background: sectionColors[i % sectionColors.length],
              opacity: 0.15 + i * 0.05,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[...Array(3)].map((_, col) => (
          <div
            key={col}
            style={{
              flex: 1,
              background: T.surface,
              borderRadius: 5,
              border: `1px solid ${T.previewLine}`,
              padding: "5px 5px 4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 1.5,
                height: 32,
              }}
            >
              {bars.slice(col * 3, col * 3 + 3).map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 2,
                    background: sectionColors[(col + i) % sectionColors.length],
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            <div
              style={{ height: 3, borderRadius: 2, background: T.previewLine }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 22,
              borderRadius: 4,
              background: T.surface,
              border: `1px solid ${T.previewLine}`,
              display: "flex",
              alignItems: "center",
              padding: "0 4px",
              gap: 3,
            }}
          >
            <div
              style={{
                width: 3,
                height: 10,
                borderRadius: 1,
                background: sectionColors[(i * 2) % sectionColors.length],
                opacity: 0.8,
              }}
            />
            <div
              style={{
                flex: 1,
                height: 3,
                borderRadius: 1,
                background: T.previewLine,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Card ───────────────────────────────────────────────────────────
// The Default View card (id "v-default") is the permanent system baseline.
// It must never be renamed, deleted, or modified via the action menu.
const DEFAULT_VIEW_CARD_ID = "v-default";

function DashboardCardItem({
  card,
  onStar,
  onDelete,
  onOpen,
  onDuplicate
}: {
  card: DashboardCard;
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Is this the permanent Default View? If so, restrict destructive actions.
  const isDefaultView = card.id === DEFAULT_VIEW_CARD_ID;

  const relativeTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div
      onClick={() => onOpen(card.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      style={{
        background: hovered ? T.cardHover : T.surface,
        border: card.isActive
          ? `2px solid ${T.activeRing}`
          : `1px solid ${T.border}`,
        borderRadius: 12,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 30px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.18s, border-color 0.15s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {card.isActive && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            background: T.activeRing,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "2px 7px",
            borderRadius: 99,
          }}
        >
          ACTIVE
        </div>
      )}

      <div style={{ padding: "14px 14px 10px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 650,
            color: T.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "85%",
            lineHeight: 1.3,
          }}
        >
          {card.name}
        </div>
      </div>

      <div style={{ padding: "0 10px", display: "flex", flex: 1 }}>
        <DashboardPreview widgets={card.previewWidgets} />
      </div>

      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${T.border}`,
          marginTop: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: card.ownerColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {card.ownerInitials}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.textMuted,
              fontStyle: "italic",
              maxWidth: 110,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.owner}
          </span>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              fontSize: 9,
              color: T.textFaint,
              background: T.inputBg,
              padding: "2px 6px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {card.widgetCount}W · {card.kpiCount}K
          </span>
          <button
            onClick={() => onStar(card.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
            }}
          >
            <Star
              size={14}
              fill={card.isStarred ? T.starActive : "none"}
              color={card.isStarred ? T.starActive : T.starInactive}
            />
          </button>
          <div style={{ color: T.textFaint, display: "flex" }}>
            {card.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                color: T.textFaint,
              }}
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 6px)",
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "4px 0",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
                  zIndex: 50,
                  minWidth: 150,
                }}
              >
                {[
                  {
                    icon: Edit3,
                    label: "Open & Edit",
                    action: () => onOpen(card.id),
                    hidden: false,
                  },
                  {
                    icon: Copy,
                    label: "Duplicate",
                    action: () => {
                      onDuplicate(card.id);
                      setMenuOpen(false);
                    },
                    hidden: false,
                  },
                  {
                    icon: Star,
                    label: card.isStarred ? "Unstar" : "Star",
                    action: () => {
                      onStar(card.id);
                      setMenuOpen(false);
                    },
                    hidden: false,
                  },
                  {
                    icon: Trash2,
                    label: "Delete",
                    action: () => {
                      onDelete(card.id);
                      setMenuOpen(false);
                    },
                    danger: true,
                    // Default View must never be deleted
                    hidden: isDefaultView,
                  },
                ].filter((item) => !item.hidden).map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      width: "100%",
                      padding: "8px 14px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                      color: (item as any).danger ? "#ef4444" : T.text,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        T.inputBg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "none";
                    }}
                  >
                    <item.icon size={13} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "0 14px 10px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Clock size={10} color={T.textFaint} />
        <span style={{ fontSize: 10, color: T.textFaint }}>
          {relativeTime(card.lastModified)}
        </span>
        <span style={{ fontSize: 10, color: T.textFaint, marginLeft: 6 }}>
          {card.permission === "owner"
            ? "Owner"
            : card.permission === "editor"
              ? "Editor"
              : "Viewer"}
        </span>
      </div>
    </div>
  );
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_CARDS: DashboardCard[] = [
  {
    id: "v-default",
    name: "Default View",
    owner: "Kantharaja M P",
    ownerInitials: "KM",
    ownerColor: "#2563eb",
    workspace: "Resource Management",
    workspaceIcon: "RM",
    isStarred: true,
    isLocked: false,
    permission: "owner",
    lastModified: new Date(Date.now() - 1 * 86400000),
    widgetCount: 12,
    kpiCount: 7,
    previewWidgets: [
      "capTrendLine",
      "utilDonut",
      "utilDept",
      "allocPortfolio",
      "allocByFn",
      "forecastBar",
    ],
    isActive: true,
  },
  {
    id: "v-leadership",
    name: "Leadership View",
    owner: "Kantharaja M P",
    ownerInitials: "KM",
    ownerColor: "#2563eb",
    workspace: "Resource Management",
    workspaceIcon: "RM",
    isStarred: false,
    isLocked: true,
    permission: "owner",
    lastModified: new Date(Date.now() - 9 * 86400000),
    widgetCount: 12,
    kpiCount: 7,
    previewWidgets: ["capTrendLine", "allocPortfolio", "forecastBar"],
    isActive: false,
  },
  {
    id: "v-myteam",
    name: "My Team View",
    owner: "Kantharaja M P",
    ownerInitials: "KM",
    ownerColor: "#2563eb",
    workspace: "Resource Management",
    workspaceIcon: "RM",
    isStarred: false,
    isLocked: false,
    permission: "owner",
    lastModified: new Date(Date.now() - 12 * 86400000),
    widgetCount: 12,
    kpiCount: 7,
    previewWidgets: ["utilTrend", "demandPriority", "resourceRisk"],
    isActive: false,
  },
  {
    id: "v-weekly",
    name: "Weekly Planning",
    owner: "Kantharaja M P",
    ownerInitials: "KM",
    ownerColor: "#2563eb",
    workspace: "Resource Management",
    workspaceIcon: "RM",
    isStarred: true,
    isLocked: false,
    permission: "owner",
    lastModified: new Date(Date.now() - 15 * 86400000),
    widgetCount: 12,
    kpiCount: 7,
    previewWidgets: ["utilDept", "staffing", "forecastAcc"],
    isActive: false,
  },
  {
    id: "v-finance",
    name: "Finance View",
    owner: "Kantharaja M P",
    ownerInitials: "KM",
    ownerColor: "#2563eb",
    workspace: "Resource Management",
    workspaceIcon: "RM",
    isStarred: false,
    isLocked: true,
    permission: "editor",
    lastModified: new Date(Date.now() - 30 * 86400000),
    widgetCount: 12,
    kpiCount: 7,
    previewWidgets: ["forecastBar", "allocTrend", "forecastAcc"],
    isActive: false,
  },
];

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "6px 12px",
          background: T.surface,
          fontSize: 12,
          fontWeight: 600,
          color: value !== "All" ? "#2563eb" : T.textMuted,
          cursor: "pointer",
          boxShadow: open ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
        }}
      >
        {label} {value !== "All" ? `· ${value}` : ""}
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "4px 0",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            zIndex: 40,
            minWidth: 160,
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 14px",
                background: "none",
                border: "none",
                fontSize: 12,
                fontWeight: o === value ? 700 : 500,
                color: o === value ? "#2563eb" : T.text,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  T.inputBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Mydashboard() {
  // useDark() only triggers re-renders when theme changes.
  const dark = useDark();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ─── Load cards from both seed data and DashboardService ────────────────
  function buildCards(): DashboardCard[] {
    if (!user) return SEED_CARDS;
    const saved = DashboardService.getForUser(user.id);
    if (saved.length === 0) return SEED_CARDS;

    // Always include the Default View card at the top
    const defaultCard: DashboardCard = {
      ...SEED_CARDS[0],
      isActive: false,
    };

    // Convert saved dashboards to card format
    const savedCards: DashboardCard[] = saved.map((d) => ({
      id: d.id,
      name: d.name,
      owner: d.username,
      ownerInitials: d.username.slice(0, 2).toUpperCase(),
      ownerColor: "#2563eb",
      workspace: "Resource Management",
      workspaceIcon: "RM",
      isStarred: d.isStarred,
      isLocked: false,
      permission: "owner" as const,
      lastModified: new Date(d.lastModifiedAt),
      widgetCount: d.widgetConfig.filter((w) => w.checked).length,
      kpiCount: d.kpiConfig.filter((k) => k.checked).length,
      previewWidgets: d.widgetConfig.filter((w) => w.checked).map((w) => w.id),
      isActive: d.isActive,
      isSharedWithMe: false,
    }));

    return [defaultCard, ...savedCards];
  }

  const [cards, setCards] = useState<DashboardCard[]>(() => buildCards());
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [notification, setNotification] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);
  const [savedDashName, setSavedDashName] = useState("");

  // ─── Rename modal state ───────────────────────────────────────────────────
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState("");

  // Detect navigation from Dashboard save flow
  useEffect(() => {
    const state = location.state as { fromSave?: boolean; dashboardId?: string; dashboardName?: string } | null;
    if (state?.fromSave) {
      setSavedBanner(true);
      setSavedDashName(state.dashboardName ?? "");
      // Reload cards to include newly saved dashboard
      setCards(buildCards());
      setTimeout(() => setSavedBanner(false), 6000);
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStar = (id: string) => {
    if (user) {
      DashboardService.toggleStar(id);
    }
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c)),
    );
  };

  const handleDelete = (id: string) => {
    // Default View is permanent and must never be deleted
    if (id === "v-default") return;
    const card = cards.find((c) => c.id === id);
    if (user) {
      DashboardService.delete(id);
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (card) showNotification(`"${card.name}" deleted`);
  };

  const handleOpen = (id: string) => {
    // For the Default View card, navigate with the special DEFAULT_VIEW_ID
    // so Dashboard resets to its system baseline.
    if (id === DEFAULT_VIEW_CARD_ID) {
      navigate("/", { state: { viewId: "default" } });
      return;
    }
    // Mark this dashboard as active so it loads its config
    if (user) {
      // Deactivate others for same user, activate this one
      const saved = DashboardService.getForUser(user.id);
      saved.forEach((d) => {
        if (d.id !== id && d.isActive) DashboardService.update(d.id, { isActive: false });
      });
      DashboardService.update(id, { isActive: true });
    }
    navigate("/", { state: { viewId: id } });
  };

  const handleDuplicate = (id: string) => {
    const src = cards.find((c) => c.id === id);
    if (!src) return;
    const baseName = src.name.replace(/ \(Copy(?: \d+)?\)$/, "");
    let copyName = `${baseName} (Copy)`;
    // Find a unique name
    let count = 1;
    while (user && DashboardService.nameExists(user.id, copyName)) {
      count++;
      copyName = `${baseName} (Copy ${count})`;
    }
    if (user) {
      const savedDash = DashboardService.getById(id);
      if (savedDash) {
        const dup = DashboardService.save(
          user.id, user.username, savedDash.persona, savedDash.role,
          copyName, savedDash.widgetConfig, savedDash.kpiConfig, savedDash.filterConfig
        );
        setCards(buildCards());
        showNotification(`"${dup.name}" created`);
        return;
      }
    }
    // Fallback for seed cards
    const copy: DashboardCard = {
      ...src,
      id: `v-${Date.now()}`,
      name: copyName,
      isActive: false,
      lastModified: new Date(),
    };
    setCards((prev) => [...prev, copy]);
    showNotification(`"${copy.name}" created`);
  };

  // ─── Rename handlers ──────────────────────────────────────────────────────
  const openRename = (id: string) => {
    // Default View is permanent and must never be renamed
    if (id === "v-default") return;
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setRenameId(id);
    setRenameName(card.name);
    setRenameError("");
  };

  const submitRename = () => {
    if (!renameId) return;
    const trimmed = renameName.trim();
    if (!trimmed) { setRenameError("Name cannot be blank."); return; }
    if (trimmed.toLowerCase() === "default view") {
      setRenameError("\"Default View\" is reserved. Please choose a different name.");
      return;
    }
    if (user && DashboardService.nameExists(user.id, trimmed, renameId)) {
      setRenameError(`"${trimmed}" already exists.`); return;
    }
    if (user) DashboardService.rename(renameId, trimmed);
    setCards((prev) => prev.map((c) => c.id === renameId ? { ...c, name: trimmed } : c));
    showNotification(`Renamed to "${trimmed}"`);
    setRenameId(null);
  };

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      const q = search.toLowerCase();
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.owner.toLowerCase().includes(q)
      )
        return false;
      if (ownerFilter !== "All" && c.owner !== ownerFilter) return false;
      return true;
    });
  }, [cards, search, ownerFilter]);

  const owners = ["All", ...Array.from(new Set(cards.map((c) => c.owner)))];

  return (
    <>
      <GlobalStyles />
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          background: T.bg,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Toast notification ── */}
        {notification && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 1000,
              background: dark ? "#1a1d27" : "#111827",
              color: "#f9fafb",
              padding: "12px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "slideIn 0.25s ease",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            {notification}
          </div>
        )}

        {/* ── Saved config banner ── */}
        {savedBanner && (
          <div
            style={{
              background: "#ecfdf5",
              borderBottom: "1px solid #a7f3d0",
              padding: "12px 32px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#065f46",
              fontWeight: 600,
            }}
          >
            <CheckCircle size={16} color="#10b981" />
            Dashboard configuration saved successfully. Your widgets and layout will reload on next visit.
            <button
              onClick={() => navigate("/", { state: { viewId: "default" } })}
              style={{ marginLeft: "auto", padding: "5px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              View Dashboard
            </button>
            <button
              onClick={() => setSavedBanner(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#065f46", fontSize: 16, lineHeight: 1 }}
            >×</button>
          </div>
        )}

        {/* ── Page Header ── */}
        <div
          style={{
            background: T.surface,
            borderBottom: `1px solid ${T.border}`,
            padding: "18px 32px 16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: T.text,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            My Dashboards
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>
            All your saved dashboard views — open, duplicate, or manage them
            here.
          </p>
        </div>

        {/* ── Filters Bar ── */}
        <div
          style={{
            background: T.surface,
            borderBottom: `1px solid ${T.border}`,
            padding: "10px 32px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              background: T.inputBg,
              minWidth: 240,
            }}
          >
            <Search size={13} color={T.textFaint} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in: My Dashboard"
              style={{
                border: "none",
                background: "none",
                outline: "none",
                fontSize: 12,
                color: T.text,
                flex: 1,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                <X size={12} color={T.textFaint} />
              </button>
            )}
          </div>

          <FilterDropdown
            label="Owner"
            options={owners}
            value={ownerFilter}
            onChange={setOwnerFilter}
          />

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => {
                navigate("/", { state: { viewId: "default" } });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none",
                borderRadius: 9,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
                transition: "filter 0.15s, transform 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(1.1)";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter = "none";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              <Plus size={14} />
              New Dashboard
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          style={{
            flex: 1,
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingTop: 80,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LayoutDashboard size={28} color="#2563eb" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
                No dashboards found
              </div>
              <div style={{ fontSize: 13, color: T.textMuted }}>
                {search
                  ? `No results for "${search}"`
                  : "Save a dashboard view to see it here."}
              </div>
              <button
                onClick={() => {
                  navigate("/", { state: { viewId: "default" } });
                }}
                style={{
                  marginTop: 8,
                  padding: "9px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {/* Create new card */}
              <div
                onClick={() => {
                  navigate("/", { state: { viewId: "default" } });
                }}
                style={{
                  border: `2px dashed ${T.border}`,
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: 24,
                  cursor: "pointer",
                  minHeight: 220,
                  color: T.textFaint,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#2563eb";
                  (e.currentTarget as HTMLDivElement).style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    T.border;
                  (e.currentTarget as HTMLDivElement).style.color = T.textFaint;
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: "2px dashed currentColor",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={20} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  New Dashboard
                </span>
              </div>

              {filtered.map((card) => (
                <DashboardCardItem
                  key={card.id}
                  card={card}
                  onStar={handleStar}
                  onDelete={handleDelete}
                  onOpen={handleOpen}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer stats ── */}
        <div
          style={{
            background: T.surface,
            borderTop: `1px solid ${T.border}`,
            padding: "10px 32px",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          {[
            {
              icon: LayoutDashboard,
              label: "Total Views",
              value: cards.length,
            },
            {
              icon: Star,
              label: "Starred",
              value: cards.filter((c) => c.isStarred).length,
            },
            {
              icon: TrendingUp,
              label: "Active",
              value: cards.filter((c) => c.isActive).length,
            },
            {
              icon: Lock,
              label: "Locked",
              value: cards.filter((c) => c.isLocked).length,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: T.textMuted,
              }}
            >
              <Icon size={12} color={T.textFaint} />
              <span>{label}:</span>
              <span style={{ fontWeight: 700, color: T.text }}>{value}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: T.textFaint }}>
            Showing {filtered.length} of {cards.length} views
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}