import CohortHeatmap from "@/components/CohortHeatmap";
import {
  aging,
  availTrend,
  billableNonBillableData,
  budgetMonthly,
  byRole,
  byRoleReportDetail16,
  capDemand2026,
  COLORS,
  compliance,
  compTrend,
  crossPillarData,
  data,
  DEFAULT_EXEC_FILTERS,
  DEFAULT_GENERIC_FILTERS,
  DEFAULT_UTIL_FILTERS,
  demand,
  demandByPriority,
  demandStatusData,
  DONUT_COLORS,
  EXEC_FILTER_DEFS,
  execCapDemandData,
  execKpis,
  forecastData,
  GENERIC_FILTER_DEFS,
  header,
  items,
  keyInsights,
  main,
  nonCompReasons,
  operational,
  overutilizedResources,
  pendingApprovals,
  planning,
  portfolioVar,
  reportCards,
  reportDetails15,
  rows,
  sharedProjects,
  skillsGapData,
  spendByCat,
  spendTrend,
  staffingRiskProjects,
  strategicAlerts,
  tsData,
  underutilizedResources,
  UTIL_FILTER_DEFS,
  utilByDeptData,
  utilByWorkType,
  utilization,
  utilizationDistribution,
  utilKpiTiles,
  utilTrendData,
  varianceByPortfolioHeader,
  varianceByTypedData,
  vendorData,
  vendors,
} from "@/mocks/ReportingAnalytics";
import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── CSS custom properties (light + dark) ────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --ra-bg:           #f3f4f6;
        --ra-surface:      #ffffff;
        --ra-surface-alt:  #f9fafb;
        --ra-border:       #e5e7eb;
        --ra-border-light: #f3f4f6;
        --ra-text-primary: #111827;
        --ra-text-sec:     #374151;
        --ra-text-muted:   #6b7280;
        --ra-text-faint:   #9ca3af;
        --ra-input-bg:     #ffffff;
        --ra-th-bg:        #f9fafb;
        --ra-row-hover:    #f9fafb;
        --ra-row-alert:    #fff5f5;
        --ra-insight-text: #374151;
        --ra-badge-bg:     #f3f4f6;
        --ra-blue:    #3b82f6;
        --ra-green:   #10b981;
        --ra-red:     #ef4444;
        --ra-orange:  #f97316;
        --ra-amber:   #f59e0b;
        --ra-teal:    #14b8a6;
        --ra-purple:  #8b5cf6;
        --ra-gray:    #6b7280;
      }

      .dark {
        --ra-bg:           #0f1117;
        --ra-surface:      #1a1d27;
        --ra-surface-alt:  #1f2231;
        --ra-border:       #2d3148;
        --ra-border-light: #252838;
        --ra-text-primary: #f1f5f9;
        --ra-text-sec:     #cbd5e1;
        --ra-text-muted:   #8b99b5;
        --ra-text-faint:   #4f5b73;
        --ra-input-bg:     #1f2231;
        --ra-th-bg:        #151823;
        --ra-row-hover:    #1e2235;
        --ra-row-alert:    #2a1a1a;
        --ra-insight-text: #cbd5e1;
        --ra-badge-bg:     #252838;
      }

      .dark .recharts-tooltip-wrapper .recharts-default-tooltip {
        background: #1a1d27 !important;
        border-color: #2d3148 !important;
        color: #f1f5f9 !important;
      }

      * { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease; }

      /* Date Picker Styles */
      .ra-date-picker-container {
        position: relative;
        display: inline-block;
        height: 36;
        cursor: pointer;
      }

      .ra-date-picker-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--ra-surface);
        border: 1px solid var(--ra-border);
        border-radius: 8px;
        padding: "0 12px";
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        width: 160px;
        color: var(--ra-text-sec);
        white-space: nowrap;
        user-select: none;
        cursor: "pointer";
        outline: "none";
        background: "var(--ra-input-bg)";
        color: "var(--ra-text-sec)";
 
      }

      .ra-date-picker-chip .chip-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .ra-date-picker-popup {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 9999;
        background: var(--ra-surface);
        border: 1px solid var(--ra-border);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.14);
        padding: 16px;
        min-width: 300px;
        animation: ra-popup-in 0.15s ease;
      }

      @keyframes ra-popup-in {
        from { opacity: 0; transform: translateY(-6px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .ra-cal-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .ra-cal-nav-btn {
        background: none;
        border: 1px solid var(--ra-border);
        border-radius: 8px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 14px;
        color: var(--ra-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.1s;
      }

      .ra-cal-nav-btn:hover {
        background: var(--ra-surface-alt);
      }

      .ra-cal-month-year {
        font-size: 14px;
        font-weight: 700;
        color: var(--ra-text-primary);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.1s;
      }

      .ra-cal-month-year:hover {
        background: var(--ra-surface-alt);
      }

      .ra-cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .ra-cal-dow {
        text-align: center;
        font-size: 10px;
        font-weight: 600;
        color: var(--ra-text-faint);
        padding: 4px 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .ra-cal-day {
        text-align: center;
        font-size: 12px;
        padding: 6px 2px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--ra-text-sec);
        transition: background 0.1s, color 0.1s;
      }

      .ra-cal-day:hover {
        background: var(--ra-surface-alt);
      }

      .ra-cal-day.in-range {
        background: rgba(99,102,241,0.10);
        border-radius: 0;
      }

      .ra-cal-day.range-start, .ra-cal-day.range-end {
        background: #6366f1;
        color: #fff;
        border-radius: 6px;
        font-weight: 700;
      }

      .ra-cal-day.today {
        font-weight: 700;
        color: #6366f1;
      }

      .ra-cal-day.other-month {
        color: var(--ra-text-faint);
      }

      .ra-cal-day.disabled {
        pointer-events: none;
        opacity: 0.3;
      }

      .ra-month-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-top: 4px;
      }

      .ra-month-btn {
        padding: 8px 4px;
        border-radius: 8px;
        border: none;
        background: var(--ra-surface-alt);
        font-size: 12px;
        color: var(--ra-text-sec);
        cursor: pointer;
        font-weight: 500;
        transition: background 0.1s, color 0.1s;
      }

      .ra-month-btn:hover, .ra-month-btn.selected {
        background: #6366f1;
        color: #fff;
      }

      .ra-year-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-top: 4px;
        max-height: 160px;
        overflow-y: auto;
      }

      .ra-year-btn {
        padding: 8px 4px;
        border-radius: 8px;
        border: none;
        background: var(--ra-surface-alt);
        font-size: 12px;
        color: var(--ra-text-sec);
        cursor: pointer;
        font-weight: 500;
        transition: background 0.1s, color 0.1s;
      }

      .ra-year-btn:hover, .ra-year-btn.selected {
        background: #6366f1;
        color: #fff;
      }

      .ra-picker-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
        border-top: 1px solid var(--ra-border);
        padding-top: 12px;
      }

      .ra-picker-btn {
        padding: 6px 14px;
        border-radius: 8px;
        border: 1px solid var(--ra-border);
        background: var(--ra-surface);
        font-size: 12px;
        cursor: pointer;
        color: var(--ra-text-sec);
        font-weight: 500;
      }

      .ra-picker-btn.primary {
        background: #6366f1;
        color: #fff;
        border-color: #6366f1;
      }

      .ra-picker-btn:hover {
        opacity: 0.85;
      }

      .ra-picker-view-toggle {
        display: flex;
        gap: 4px;
        margin-bottom: 10px;
      }

      .ra-picker-view-tab {
        flex: 1;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid var(--ra-border);
        background: var(--ra-surface-alt);
        font-size: 11px;
        cursor: pointer;
        color: var(--ra-text-muted);
        font-weight: 500;
        text-align: center;
        transition: background 0.1s, color 0.1s;
      }

      .ra-picker-view-tab.active {
        background: #6366f1;
        color: #fff;
        border-color: #6366f1;
      }
    `}</style>
  );
}

// ─── Token shorthands ─────────────────────────────────────────────────────────

const T = {
  bg: "var(--ra-bg)",
  surface: "var(--ra-surface)",
  surfaceAlt: "var(--ra-surface-alt)",
  border: "var(--ra-border)",
  borderLight: "var(--ra-border-light)",
  text: "var(--ra-text-primary)",
  textSec: "var(--ra-text-sec)",
  textMuted: "var(--ra-text-muted)",
  textFaint: "var(--ra-text-faint)",
  inputBg: "var(--ra-input-bg)",
  thBg: "var(--ra-th-bg)",
  rowHover: "var(--ra-row-hover)",
  rowAlert: "var(--ra-row-alert)",
  insightText: "var(--ra-insight-text)",
  badgeBg: "var(--ra-badge-bg)",

  blue: "var(--ra-blue)",
  green: "var(--ra-green)",
  red: "var(--ra-red)",
  orange: "var(--ra-orange)",
  amber: "var(--ra-amber)",
  teal: "var(--ra-teal)",
  purple: "var(--ra-purple)",
  gray: "var(--ra-gray)",
};

// ─── Date Picker Component ────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface DateRange {
  start: Date | null;
  end: Date | null;
}

function formatDateRange(range: DateRange): string {
  if (!range.start) return "Select date range";
  const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if (!range.end || range.start.getTime() === range.end.getTime()) {
    return fmt(range.start);
  }
  // Same year
  const s = range.start;
  const e = range.end;
  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      return `${MONTHS[s.getMonth()]} ${s.getDate()} \u2013 ${e.getDate()}, ${s.getFullYear()}`;
    }
    return `${MONTHS[s.getMonth()]} ${s.getDate()} \u2013 ${MONTHS[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${fmt(s)} \u2013 ${fmt(e)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type PickerView = "day" | "month" | "year";

function DateRangePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PickerView>("day");
  const [calYear, setCalYear] = useState(() => value.start ? value.start.getFullYear() : new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => value.start ? value.start.getMonth() : new Date().getMonth());
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [hover, setHover] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  function handleDayClick(day: number) {
    const clicked = new Date(calYear, calMonth, day);
    if (selecting === "start") {
      onChange({ start: clicked, end: null });
      setSelecting("end");
    } else {
      const { start } = value;
      if (start && clicked < start) {
        onChange({ start: clicked, end: start });
      } else {
        onChange({ start: start, end: clicked });
      }
      setSelecting("start");
      setOpen(false);
    }
  }

  function handleMonthClick(m: number) {
    setCalMonth(m);
    setView("day");
    // Also set a full-month range
    const start = new Date(calYear, m, 1);
    const end = new Date(calYear, m + 1, 0);
    onChange({ start, end });
  }

  function handleYearClick(y: number) {
    setCalYear(y);
    setView("month");
  }

  function isInRange(day: number): boolean {
    const d = new Date(calYear, calMonth, day);
    const { start, end } = value;
    const hoverDate = hover;
    if (start && !end && hoverDate) {
      const lo = start < hoverDate ? start : hoverDate;
      const hi = start < hoverDate ? hoverDate : start;
      return d > lo && d < hi;
    }
    if (!start || !end) return false;
    return d > start && d < end;
  }

  function isRangeStart(day: number): boolean {
    if (!value.start) return false;
    const d = new Date(calYear, calMonth, day);
    return d.toDateString() === value.start.toDateString();
  }

  function isRangeEnd(day: number): boolean {
    if (!value.end) return false;
    const d = new Date(calYear, calMonth, day);
    return d.toDateString() === value.end.toDateString();
  }

  function isToday(day: number): boolean {
    const today = new Date();
    return calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const prevMonthDays = getDaysInMonth(calYear, calMonth === 0 ? 11 : calMonth - 1);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

  return (
    <div className="ra-date-picker-container" ref={ref}>
      <div
        className={`ra-date-picker-chip${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="chip-icon">🗓️</span>
        <span>{formatDateRange(value)}</span>
      </div>

      {open && (
        <div className="ra-date-picker-popup">
          <div className="ra-picker-view-toggle">
            <button className={`ra-picker-view-tab${view === "day" ? " active" : ""}`} onClick={() => setView("day")}>Day</button>
            <button className={`ra-picker-view-tab${view === "month" ? " active" : ""}`} onClick={() => setView("month")}>Month</button>
            <button className={`ra-picker-view-tab${view === "year" ? " active" : ""}`} onClick={() => setView("year")}>Year</button>
          </div>

          {view === "day" && (
            <>
              <div className="ra-cal-nav">
                <button className="ra-cal-nav-btn" onClick={prevMonth}>‹</button>
                <span
                  className="ra-cal-month-year"
                  onClick={() => setView("month")}
                >
                  {MONTHS_FULL[calMonth]} {calYear}
                </span>
                <button className="ra-cal-nav-btn" onClick={nextMonth}>›</button>
              </div>
              <div className="ra-cal-grid">
                {DOW.map(d => <div key={d} className="ra-cal-dow">{d}</div>)}
                {/* Leading days from previous month */}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`prev-${i}`} className="ra-cal-day other-month">
                    {prevMonthDays - firstDay + 1 + i}
                  </div>
                ))}
                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const cls = [
                    "ra-cal-day",
                    isRangeStart(day) ? "range-start" : "",
                    isRangeEnd(day) ? "range-end" : "",
                    isInRange(day) ? "in-range" : "",
                    isToday(day) ? "today" : "",
                  ].filter(Boolean).join(" ");
                  return (
                    <div
                      key={day}
                      className={cls}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHover(new Date(calYear, calMonth, day))}
                      onMouseLeave={() => setHover(null)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8, textAlign: "center" }}>
                {selecting === "start" ? "Select start date" : "Select end date"}
              </div>
            </>
          )}

          {view === "month" && (
            <>
              <div className="ra-cal-nav">
                <button className="ra-cal-nav-btn" onClick={() => setCalYear(y => y - 1)}>‹</button>
                <span className="ra-cal-month-year" onClick={() => setView("year")}>{calYear}</span>
                <button className="ra-cal-nav-btn" onClick={() => setCalYear(y => y + 1)}>›</button>
              </div>
              <div className="ra-month-grid">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    className={`ra-month-btn${calMonth === i ? " selected" : ""}`}
                    onClick={() => handleMonthClick(i)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}

          {view === "year" && (
            <>
              <div className="ra-cal-nav">
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Select Year</div>
              </div>
              <div className="ra-year-grid">
                {years.map(y => (
                  <button
                    key={y}
                    className={`ra-year-btn${calYear === y ? " selected" : ""}`}
                    onClick={() => handleYearClick(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="ra-picker-actions">
            <button className="ra-picker-btn" onClick={() => {
              onChange({ start: null, end: null });
              setSelecting("start");
            }}>Clear</button>
            <button className="ra-picker-btn primary" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: any }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.3 }}>
          {kpi.label}
        </span>
        <span style={{ fontSize: 18 }}>{kpi.icon}</span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: kpi.color,
          lineHeight: 1.1,
        }}
      >
        {kpi.value}
      </div>
      <div style={{ fontSize: 11, color: kpi.deltaUp ? T.green : T.red }}>
        {kpi.delta} <span style={{ color: T.textFaint }}>vs Jan 2026</span>
      </div>
    </div>
  );
}

function MiniBar({ value, max = 100, color = T.blue }: { value: number; max?: number; color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        height: 6,
        background: T.borderLight,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

function SmallDonut({ data, centerLabel, centerSub, size = 90 }: { data: any[]; centerLabel?: string; centerSub?: string; size?: number }) {
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2 - 1}
          cy={size / 2 - 1}
          innerRadius={size * 0.3}
          outerRadius={size * 0.47}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      {centerLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: T.text,
              lineHeight: 1,
            }}
          >
            {centerLabel}
          </div>
          {centerSub && (
            <div style={{ fontSize: 8, color: T.textMuted, lineHeight: 1.2 }}>
              {centerSub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ card, onView }: { card: any; onView: (card: any) => void }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 10,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 220,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: card.color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {card.icon}
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.text,
              lineHeight: 1.3,
            }}
          >
            {card.num}. {card.title}
          </div>
          <div
            style={{
              fontSize: 10,
              color: T.textFaint,
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {card.desc}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {card.stats && (
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            {card.stats.map((s: any, i: number) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: s.color || T.text,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
        {card.extra && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {card.extra.map((e: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: T.textSec,
                }}
              >
                <span>{e.label}</span>
                <span style={{ fontWeight: 600 }}>{e.value}</span>
              </div>
            ))}
          </div>
        )}
        {card.summaryStats && (
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            {card.summaryStats.map((s: any, i: number) => (
              <div key={i}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
        {card.barData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {card.barData.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                }}
              >
                <span style={{ color: T.textMuted, minWidth: 90, fontSize: 9 }}>
                  {r.name}
                </span>
                <MiniBar value={r.value} color={T.teal} />
                <span style={{ color: T.text, minWidth: 28, fontWeight: 600 }}>
                  {r.value}%
                </span>
              </div>
            ))}
          </div>
        )}
        {card.donut && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SmallDonut
              data={card.donut}
              centerLabel={card.centerLabel}
              centerSub={card.centerSub}
              size={80}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {card.donut.slice(0, 5).map((d: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 9,
                    color: T.textSec,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 2,
                      background: DONUT_COLORS[i],
                    }}
                  />
                  {d.name}{" "}
                  <span style={{ color: T.textFaint }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {card.overList && (
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: T.red,
                marginBottom: 4,
              }}
            >
              {card.highlight}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>
              Over Allocated Resources
            </div>
            {card.overList.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  padding: "2px 0",
                  borderBottom: `0.5px solid ${T.borderLight}`,
                }}
              >
                <span style={{ color: T.textSec }}>{r.name}</span>
                <span style={{ fontWeight: 700, color: r.color }}>
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
        {card.availability && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              {
                label: "Available",
                value: card.availability.available,
                color: T.green,
              },
              {
                label: "Shared",
                value: card.availability.shared,
                color: T.blue,
              },
              { label: "Bench", value: card.availability.bench, color: T.gray },
            ].map((r, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 700, color: r.color }}>
                  {r.value}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        )}
        {card.compliance !== undefined && (
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.green }}>
              {card.compliance}%
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>
              Overall Compliance
            </div>
            {card.items.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: T.textMuted, minWidth: 120 }}>
                  {r.label}
                </span>
                <MiniBar value={r.value} color={T.green} />
                <span style={{ fontWeight: 600, color: T.text }}>
                  {r.value}%
                </span>
              </div>
            ))}
          </div>
        )}
        {card.budget && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              {[
                { l: "Total Budget", v: card.budget.total, c: T.text },
                { l: "Total Actual", v: card.budget.actual, c: T.text },
                { l: "Variance", v: card.budget.variance, c: T.red },
              ].map((b, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: b.c }}>
                    {b.v}
                  </div>
                  <div style={{ fontSize: 9, color: T.textFaint }}>{b.l}</div>
                </div>
              ))}
            </div>
            {card.budgetRows.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: T.textSec,
                  padding: "2px 0",
                }}
              >
                <span>{r.name}</span>
                <span style={{ color: T.red, fontWeight: 600 }}>
                  ${r.variance}M
                </span>
              </div>
            ))}
          </div>
        )}
        {card.vendors && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "3px 8px",
                fontSize: 10,
                color: T.textMuted,
                marginBottom: 2,
              }}
            >
              <span>Vendor</span>
              <span>Spend</span>
              <span>Rank</span>
              <span>Score</span>
            </div>
            {card.vendors.map((v: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: "2px 8px",
                  fontSize: 10,
                  padding: "2px 0",
                  borderBottom: `0.5px solid ${T.borderLight}`,
                }}
              >
                <span style={{ color: T.textSec }}>{v.name}</span>
                <span style={{ fontWeight: 600, color: T.text }}>
                  {v.spend}
                </span>
                <span style={{ color: T.blue, fontWeight: 700 }}>
                  #{v.rank}
                </span>
                <span
                  style={{
                    color: v.score >= 85 ? T.green : T.orange,
                    fontWeight: 600,
                  }}
                >
                  {v.score}%
                </span>
              </div>
            ))}
          </div>
        )}
        {card.demandStats && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              {card.demandStats.map((d: any, i: number) => (
                <div key={i}>
                  <div
                    style={{ fontSize: 18, fontWeight: 800, color: d.color }}
                  >
                    {d.value}
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
            {card.demandByPriority.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: T.textMuted, minWidth: 50 }}>
                  {r.label}
                </span>
                <MiniBar
                  value={parseInt(r.pct)}
                  color={[T.red, T.orange, T.blue][i]}
                />
                <span style={{ color: T.textSec }}>
                  {r.value} ({r.pct})
                </span>
              </div>
            ))}
          </div>
        )}
        {card.forecastData && (
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={card.forecastData}
                margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 8, fill: T.textMuted }}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: T.textMuted }}
                  domain={[5, 11]}
                />
                <Tooltip
                  contentStyle={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    fontSize: 10,
                    color: T.text,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cap"
                  stroke={T.green}
                  strokeWidth={1.5}
                  dot={false}
                  name="Capacity"
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke={T.blue}
                  strokeWidth={1.5}
                  dot={false}
                  name="Demand"
                />
                <Line
                  type="monotone"
                  dataKey="gap"
                  stroke={T.red}
                  strokeWidth={1.5}
                  dot={false}
                  name="Gap"
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {card.utilOverall && (
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.teal }}>
              {card.utilOverall}%
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>
              Overall Utilization
            </div>
            {card.utilByType.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  marginBottom: 3,
                }}
              >
                <span
                  style={{ color: T.textMuted, minWidth: 110, fontSize: 9 }}
                >
                  {r.label}
                </span>
                <MiniBar value={r.value} color={T.teal} />
                <span style={{ fontWeight: 600, color: T.text }}>
                  {r.value}%
                </span>
              </div>
            ))}
          </div>
        )}
        {card.tsCompliance && (
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.green }}>
                {card.tsCompliance}%
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>
                TS Compliance
              </div>
              {card.tsBreakdown.map((r: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 2,
                      background: r.color,
                    }}
                  />
                  <span style={{ color: T.textMuted }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: T.text }}>
                    {r.pct}%
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.blue }}>
                {card.actualFTE}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>Actual FTE</div>
            </div>
          </div>
        )}
        {card.pending !== undefined && !card.tsCompliance && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.orange }}>
                  {card.pending}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  Pending Approvals
                </div>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.red }}>
                  {card.overdue}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  Overdue Approvals
                </div>
              </div>
            </div>
            {card.byType.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  padding: "2px 0",
                  color: T.textSec,
                }}
              >
                <span>{r.label}</span>
                <span style={{ fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {card.execStats && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 4,
            }}
          >
            {card.execStats.map((s: any, i: number) => (
              <div
                key={i}
                style={{
                  background: s.color + "11",
                  border: `0.5px solid ${s.color}44`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {card.hub && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 4,
            }}
          >
            {["All Reports", "Favorites", "Recent", "Scheduled"].map((l, i) => (
              <div
                key={i}
                style={{
                  background: T.surfaceAlt,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px",
                  textAlign: "center",
                  fontSize: 11,
                  color: T.textSec,
                  fontWeight: 500,
                }}
              >
                {["📊", "⭐", "🕐", "📅"][i]} {l}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onView(card)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 11,
          color: card.color,
          fontWeight: 600,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: "auto",
        }}
      >
        View Report →
      </button>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function DetailMiniBar({ value, max = 100, color = T.blue }: { value: number; max?: number; color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        height: 7,
        background: T.borderLight,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min((value / max) * 100, 100)}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: "12px 16px",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: T.textSec,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 10,
        marginTop: 18,
        borderBottom: `0.5px solid ${T.border}`,
        paddingBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function DetailCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 10,
        padding: "16px 18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DetailTable({ headers, rows }: { headers: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: "left",
                padding: "6px 8px",
                fontSize: 10,
                color: T.textMuted,
                borderBottom: `0.5px solid ${T.border}`,
                fontWeight: 600,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `0.5px solid ${T.borderLight}` }}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{ padding: "7px 8px", fontSize: 11, color: T.textSec }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Filter bars ──────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  height: 36,
  border: `1px solid var(--ra-border)`,
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  background: "var(--ra-input-bg)",
  color: "var(--ra-text-sec)",
  cursor: "pointer",
  outline: "none",
};

// Default date range: May 1 – May 31, 2026
const DEFAULT_DATE_RANGE: DateRange = {
  start: new Date(2026, 4, 1),
  end: new Date(2026, 4, 31),
};

function UtilFilterBar({ filters, setFilters }: { filters: any; setFilters: (fn: (p: any) => any) => void }) {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);

  // non-date filters from UTIL_FILTER_DEFS (skip Time Period which is index 0)
  const otherFilters = UTIL_FILTER_DEFS.filter(f => f.key !== "timePeriod");

  return (
    <div
      style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2
            style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}
          >
            4. Utilization Dashboard
          </h2>
          <span
            style={{
              background: "#e8f5ef",
              color: "#1f9d67",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Measure workforce efficiency & workload distribution
          </span>
        </div>
        <a
          href="https://app.powerbi.com/groups/me/reports/9581f32e-5e45-4655-8705-d94c63ef7ae7/637a9c8a3b634ab2b3bb?experience=power-bi"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 16px",
            background: "#F2C811",
            color: "#1a1a1a",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="5" height="18" rx="1.2" fill="#1a1a1a" opacity="0.75"/>
            <rect x="9.5" y="7" width="5" height="14" rx="1.2" fill="#1a1a1a" opacity="0.75"/>
            <rect x="17" y="11" width="5" height="10" rx="1.2" fill="#1a1a1a" opacity="0.75"/>
          </svg>
          View in Power BI
        </a>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* Date Range Picker */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 120 }}>
          <label style={{ fontSize: 11, color: T.textFaint, marginBottom: 4 }}>
            Time Period
          </label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Other filters */}
        {otherFilters.map((f) => (
          <div
            key={f.key}
            style={{ display: "flex", flexDirection: "column", minWidth: 120 }}
          >
            <label
              style={{ fontSize: 11, color: T.textFaint, marginBottom: 4 }}
            >
              {f.label}
            </label>
            <select
              value={filters[f.key]}
              onChange={(e) =>
                setFilters((p: any) => ({ ...p, [f.key]: e.target.value }))
              }
              style={selectStyle}
            >
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecFilterBar({ filters, setFilters }: { filters: any; setFilters: (fn: (p: any) => any) => void }) {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);

  const otherFilters = EXEC_FILTER_DEFS.filter(f => f.key !== "timePeriod");

  return (
    <div
      style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "14px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>
            Executive Leadership Report
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
            Strategic overview of resource planning, utilization, and
            performance
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Date Range Picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label
            style={{
              fontSize: 9,
              color: T.textFaint,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Time Period
          </label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Other filters */}
        {otherFilters.map((f) => (
          <div
            key={f.key}
            style={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <label
              style={{
                fontSize: 9,
                color: T.textFaint,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {f.label}
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                background: T.inputBg,
                paddingLeft: 8,
              }}
            >
              <select
                value={filters[f.key]}
                onChange={(e) =>
                  setFilters((p: any) => ({ ...p, [f.key]: e.target.value }))
                }
                style={{
                  fontSize: 12,
                  border: "none",
                  background: "transparent",
                  padding: "5px 4px 5px 0",
                  color: T.textSec,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericFilterBar({ filters, setFilters }: { filters: any; setFilters: (fn: (p: any) => any) => void }) {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);

  const otherFilters = GENERIC_FILTER_DEFS.filter(f => f.key !== "date");

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Date Range Picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <label style={{ fontSize: 9, color: T.textFaint }}>Date Range</label>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Other filters */}
      {otherFilters.map((f) => (
        <div
          key={f.key}
          style={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <label style={{ fontSize: 9, color: T.textFaint }}>{f.label}</label>
          <select
            value={filters[f.key]}
            onChange={(e) =>
              setFilters((p: any) => ({ ...p, [f.key]: e.target.value }))
            }
            style={{
              fontSize: 11,
              borderRadius: 6,
              border: `0.5px solid ${T.border}`,
              padding: "4px 8px",
              background: T.inputBg,
              color: T.textSec,
              cursor: "pointer",
              height: 36,
            }}
          >
            {f.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}

      <div style={{ display: "flex", gap: 6 }}>
        {["Refresh", "Export"].map((l) => (
          <button
            key={l}
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
              color: T.textSec,
              height: 36,
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Utilization-specific helpers ─────────────────────────────────────────────

function heatCell(val: number) {
  // RAG: Green 0–60, Amber 65–85, Red 90–100
  if (val >= 90) return { bg: "#DC2626", color: "#ffffff" };
  if (val >= 65) return { bg: "#D97706", color: "#ffffff" };
  return { bg: "#16A34A", color: "#ffffff" };
}

// ─── Utilization Dashboard (Report #12) ──────────────────────────────────────

function ReportDetail12() {
  const [filters, setFilters] = useState(DEFAULT_UTIL_FILTERS);
  const tooltipStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: T.bg,
        minHeight: "100vh",
      }}
    >
      <UtilFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* KPI Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 8,
          }}
        >
          {utilKpiTiles.map((k, i) => (
            <div
              key={i}
              style={{
                background: k.bg,
                border: `1px solid ${k.color}22`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.3 }}
                >
                  {k.label}
                </span>
                <span style={{ fontSize: 16 }}>{k.icon}</span>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: k.color,
                  lineHeight: 1.1,
                  marginBottom: 2,
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 10, color: k.up ? T.green : T.red }}>
                {k.delta}{" "}
                <span style={{ color: T.textFaint }}>vs Jan 2026</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 0.7fr",
            gap: 12,
          }}
        >
          {/* Utilization Trend */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
              }}
            >
              1. Utilization Trend Over Time (%)
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
              {[
                ["Overall Utilization %", T.blue],
                ["Billable Utilization %", T.green],
              ].map(([l, c]) => (
                <span
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    color: T.textMuted,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 2,
                      background: c,
                      display: "inline-block",
                      borderRadius: 1,
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={utilTrendData}
                margin={{ top: 5, right: 10, bottom: 5, left: -15 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 8, fill: T.textMuted }}
                  angle={-20}
                  textAnchor="end"
                  height={36}
                />
                <YAxis
                  domain={[40, 100]}
                  tick={{ fontSize: 9, fill: T.textMuted }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: any) => `${v}%`}
                />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke={T.blue}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Overall Utilization %"
                />
                <Line
                  type="monotone"
                  dataKey="billable"
                  stroke={T.green}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Billable Utilization %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Utilization by Department */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
              }}
            >
              2. Utilization by Department (%)
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              {[
                ["Overall Utilization %", T.blue],
                ["Billable Utilization %", T.green],
                ["Capacity Utilization %", T.orange],
              ].map(([l, c]) => (
                <span
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 9,
                    color: T.textMuted,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 2,
                      background: c,
                      display: "inline-block",
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {utilByDeptData.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span
                    style={{ fontSize: 10, color: T.textSec, minWidth: 110 }}
                  >
                    {d.dept}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {[
                      { v: d.overall, c: T.blue },
                      { v: d.billable, c: T.green },
                      { v: d.capacity, c: T.orange },
                    ].map(({ v, c }, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          gap: 3,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: `${v}%`,
                            height: 6,
                            background: c,
                            borderRadius: 2,
                            minWidth: 2,
                            opacity: j === 2 ? 0.6 : 1,
                          }}
                        />
                        <span style={{ fontSize: 9, color: c }}>{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 6,
                fontSize: 9,
                color: T.textFaint,
              }}
            >
              {[0, 25, 50, 75, 100].map((v) => (
                <span key={v} style={{ flex: 1 }}>
                  {v}%
                </span>
              ))}
            </div>
          </div>

          {/* Utilization by Work Type */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
              }}
            >
              3. Utilization by Work Type (Actual Hours)
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ position: "relative", width: 140, height: 140 }}>
                <PieChart width={140} height={140}>
                  <Pie
                    data={utilByWorkType}
                    cx={69}
                    cy={69}
                    innerRadius={42}
                    outerRadius={64}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {utilByWorkType.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
                    118K
                  </div>
                  <div style={{ fontSize: 8, color: T.textMuted }}>
                    Total Hours
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {utilByWorkType.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: d.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 9, color: T.textSec, flex: 1 }}>
                    {d.name}
                  </span>
                  <span
                    style={{ fontSize: 9, fontWeight: 700, color: d.color }}
                  >
                    {(d.hours / 1000).toFixed(1)}K ({d.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* Top 10 Underutilized */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 8,
              }}
            >
              4. Top 10 Underutilized Resources
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Resource",
                    "Department",
                    "Utilization %",
                    "Available Hours",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {underutilizedResources.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `0.5px solid ${T.borderLight}` }}
                  >
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 10,
                        color: T.textSec,
                        fontWeight: 500,
                      }}
                    >
                      {r.name}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 9.5,
                        color: T.textMuted,
                      }}
                    >
                      {r.dept}
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            r.util < 40
                              ? T.red
                              : r.util < 50
                                ? T.orange
                                : T.amber,
                          background:
                            (r.util < 40
                              ? T.red
                              : r.util < 50
                                ? T.orange
                                : T.amber) + "18",
                          padding: "1px 6px",
                          borderRadius: 3,
                        }}
                      >
                        {r.util}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 10,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {r.hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top 10 Overutilized */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 8,
              }}
            >
              5. Top 10 Overutilized Resources
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Resource",
                    "Department",
                    "Utilization %",
                    "Overtime Hours",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overutilizedResources.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `0.5px solid ${T.borderLight}`,
                      background: r.util >= 95 ? T.rowAlert : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 10,
                        color: T.textSec,
                        fontWeight: 500,
                      }}
                    >
                      {r.name}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 9.5,
                        color: T.textMuted,
                      }}
                    >
                      {r.dept}
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            r.util >= 95
                              ? T.red
                              : r.util >= 90
                                ? "#c0392b"
                                : T.orange,
                          background: (r.util >= 95 ? T.red : T.orange) + "18",
                          padding: "1px 6px",
                          borderRadius: 3,
                        }}
                      >
                        {r.util}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.red,
                      }}
                    >
                      {r.overtime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.55fr 1.6fr 0.65fr",
            gap: 12,
          }}
        >
          {/* Operational vs Strategic */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 8,
              }}
            >
              6. Operational vs Strategic Work (%)
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ position: "relative", width: 130, height: 130 }}>
                <PieChart width={130} height={130}>
                  <Pie
                    data={[{ value: 46.3 }, { value: 31.9 }, { value: 21.8 }]}
                    cx={64}
                    cy={64}
                    innerRadius={38}
                    outerRadius={58}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill={T.orange} />
                    <Cell fill={T.blue} />
                    <Cell fill={T.purple} />
                  </Pie>
                </PieChart>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                    118K
                  </div>
                  <div style={{ fontSize: 8, color: T.textMuted }}>
                    Total Hours
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {operational.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 5 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: d.color,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 9, color: T.textSec }}>
                      {d.label}
                    </div>
                    <div
                      style={{ fontSize: 10, fontWeight: 700, color: d.color }}
                    >
                      {d.hours}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap — Cohort Style */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 4,
              }}
            >
              7. Utilization Heatmap
            </div>
            <CohortHeatmap
              title=""
              pillarFilter={filters.pillar ?? "All"}
            />
          </div>

          {/* Key Insights */}
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
              }}
            >
              8. Key Insights
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {keyInsights.map((ins, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    background: ins.bg,
                    borderRadius: 8,
                    padding: "8px 10px",
                    border: `0.5px solid ${ins.color}33`,
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>
                    {ins.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: T.insightText,
                      lineHeight: 1.5,
                    }}
                  >
                    {ins.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: T.textFaint,
            paddingTop: 8,
            borderTop: `0.5px solid ${T.border}`,
          }}
        >
          ℹ️ All metrics are based on data as of May 15, 2026 10:30 AM &nbsp;|&nbsp;
          Historical data available from Jan 2026 &nbsp;|&nbsp; Data refreshed
          daily
        </div>
      </div>
    </div>
  );
}

// ─── Shared card/table helpers ────────────────────────────────────────────────

function heatColor(val: number) {
  // RAG: Green 0–60, Amber 65–85, Red 90+
  if (val >= 90) return { bg: "#DC2626", text: "#ffffff", fw: 700 };
  if (val >= 65) return { bg: "#D97706", text: "#ffffff", fw: 600 };
  return { bg: "#16A34A", text: "#ffffff", fw: 500 };
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: T.text,
        marginBottom: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

function ViewAllLink({ label = "View All →" }: { label?: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <span
        style={{
          fontSize: 11,
          color: T.blue,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function UtilBar({ value }: { value: number }) {
  const color = value >= 95 ? T.red : value >= 85 ? "#a16207" : T.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: T.borderLight,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(value, 100)}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
          }}
        />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 28 }}>
        {value}%
      </span>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    High: { bg: "#fde8e8", color: COLORS.red },
    Medium: { bg: "#fff4e0", color: COLORS.orange },
    Low: { bg: "#e8f5e9", color: COLORS.green },
    Info: { bg: "#e3f2fd", color: COLORS.blue },
    Critical: { bg: "#fde8e8", color: COLORS.red },
  };
  const s = map[level] || map.Info;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: s.color,
        background: s.bg,
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {level}
    </span>
  );
}

// ─── Executive Report (Report #1) ─────────────────────────────────────────────

function ReportDetail1() {
  const [execFilters, setExecFilters] = useState(DEFAULT_EXEC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: T.bg,
        minHeight: "100vh",
      }}
    >
      <ExecFilterBar filters={execFilters} setFilters={setExecFilters} />
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8,1fr)",
            gap: 8,
          }}
        >
          {execKpis.map((k, i) => (
            <div
              key={i}
              style={{
                background: T.surface,
                border: `0.5px solid ${T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.3 }}
                >
                  {k.label}
                </span>
                <span style={{ fontSize: 16 }}>{k.icon}</span>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: k.color,
                  lineHeight: 1.1,
                  marginBottom: 3,
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 10, color: k.up ? T.green : T.red }}>
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap — Cohort Style */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12 }}>
              1. Capacity Heatmap (Utilization %)
            </div>
            <CohortHeatmap
              title="Enterprise Capacity Utilization — Jan to Jun 2026"
              pillarFilter={execFilters.pillar ?? "All"}
            />
          </div>
        </div>

        {/* Demand Status + Vendor + Skills */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.7fr 1.1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>2. Demand by Status (FTE)</CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  flexShrink: 0,
                }}
              >
                <PieChart width={120} height={120}>
                  <Pie
                    data={demandStatusData}
                    cx={59}
                    cy={59}
                    innerRadius={36}
                    outerRadius={56}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {demandStatusData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
                    99
                  </div>
                  <div style={{ fontSize: 8, color: T.textMuted }}>Total</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {demandStatusData.map((d, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 10, color: T.textSec }}>
                      {d.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: d.color,
                        marginLeft: "auto",
                        paddingLeft: 8,
                      }}
                    >
                      {d.value} ({d.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>3. Vendor Overview</CardHeader>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Vendor",
                    "Utilization %",
                    "FTE",
                    "Spend (USD)",
                    "Open Demands",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendorData.map((v, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `0.5px solid ${T.borderLight}` }}
                  >
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.textSec,
                        fontWeight: 500,
                      }}
                    >
                      {v.name}
                    </td>
                    <td style={{ padding: "6px 6px", minWidth: 90 }}>
                      <UtilBar value={v.util} />
                    </td>
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {v.fte}
                    </td>
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.teal,
                        fontWeight: 600,
                      }}
                    >
                      {v.spend}
                    </td>
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.orange,
                        fontWeight: 600,
                      }}
                    >
                      {v.demands}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ViewAllLink label="View All Vendors →" />
          </div>

          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>4. Top 5 Skills by Demand Gap (FTE)</CardHeader>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Skill Set",
                    "Demand (FTE)",
                    "Available (FTE)",
                    "Gap (FTE)",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skillsGapData.map((s, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `0.5px solid ${T.borderLight}` }}
                  >
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.textSec,
                        fontWeight: 500,
                      }}
                    >
                      {s.skill}
                    </td>
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.text,
                        fontWeight: 600,
                      }}
                    >
                      {s.demand}
                    </td>
                    <td
                      style={{
                        padding: "6px 6px",
                        fontSize: 11,
                        color: T.green,
                        fontWeight: 600,
                      }}
                    >
                      {s.available}
                    </td>
                    <td style={{ padding: "6px 6px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 6,
                            background: "#fee2e2",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(Math.abs(s.gap) / 2, 100)}%`,
                              height: "100%",
                              background: T.red,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.red,
                          }}
                        >
                          {s.gap}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ViewAllLink label="View All Skills →" />
          </div>
        </div>

        {/* Cross-Pillar + Staffing Risk + Strategic Alerts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr 0.9fr",
            gap: 12,
          }}
        >
          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>
              5. Cross-Pillar Resource Flow (Top Borrowing)
            </CardHeader>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Borrowing Pillar",
                    "Borrowing From",
                    "FTE",
                    "Top Skills",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crossPillarData.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `0.5px solid ${T.borderLight}` }}
                  >
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 11,
                        color: T.textSec,
                        fontWeight: 600,
                      }}
                    >
                      {r.borrowing}
                    </td>
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 11,
                        color: T.textMuted,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 6,
                            background: `linear-gradient(to right, ${T.blue}, ${T.teal})`,
                            borderRadius: 3,
                          }}
                        />
                        {r.from}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: T.blue,
                      }}
                    >
                      {r.fte}
                    </td>
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 9.5,
                        color: T.textMuted,
                      }}
                    >
                      {r.skills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>6. Projects at Staffing Risk</CardHeader>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Project", "Pillar", "Risk Level", "Gap (FTE)"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: T.textMuted,
                        padding: "4px 6px",
                        textAlign: "left",
                        borderBottom: `0.5px solid ${T.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffingRiskProjects.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `0.5px solid ${T.borderLight}` }}
                  >
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 11,
                        color: T.textSec,
                        fontWeight: 600,
                      }}
                    >
                      {r.project}
                    </td>
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 10,
                        color: T.textMuted,
                      }}
                    >
                      {r.pillar}
                    </td>
                    <td style={{ padding: "7px 6px" }}>
                      <RiskBadge level={r.risk} />
                    </td>
                    <td
                      style={{
                        padding: "7px 6px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: T.red,
                      }}
                    >
                      {r.gap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ViewAllLink label="View All Projects →" />
          </div>

          <div
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <CardHeader>7. Strategic Alerts</CardHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {strategicAlerts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "8px 10px",
                    background: a.color + "0d",
                    border: `0.5px solid ${a.color}33`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                      {a.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.textSec,
                        lineHeight: 1.4,
                      }}
                    >
                      {a.text}
                    </span>
                  </div>
                  <RiskBadge level={a.level} />
                </div>
              ))}
            </div>
            <ViewAllLink label="View All Alerts →" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Generic detail views ─────────────────────────────────────────────────────

function ReportDetail2() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const byRoleData = [
    { role: "Developers", allocated: 32, capacity: 38, util: "85%", gap: -6 },
    { role: "Consultants", allocated: 19, capacity: 23, util: "83%", gap: -4 },
    { role: "Analysts", allocated: 11, capacity: 13, util: "84%", gap: -2 },
    { role: "Testers", allocated: 6, capacity: 7, util: "84%", gap: -1 },
    { role: "Architects", allocated: 3, capacity: 3, util: "85%", gap: 0 },
  ];
  const buUtil = [
    { name: "Engineering", util: 85, color: T.blue },
    { name: "Consulting", util: 81, color: T.teal },
    { name: "Data & Analytics", util: 84, color: T.purple },
    { name: "Products", util: 79, color: T.orange },
  ];
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Capacity" value="74" color={T.blue} />
        <StatTile label="Total Demand" value="80" color={T.orange} />
        <StatTile label="Allocated (FTE)" value="71" color={T.teal} />
        <StatTile label="Utilization" value="83%" color={T.purple} />
        <StatTile label="Capacity Gap" value="-6" color={T.red} />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}
      >
        <DetailCard>
          <SectionLabel>Capacity vs Demand Trend</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={capDemand2026}
              margin={{ top: 5, right: 5, bottom: 5, left: -15 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: T.textMuted }}
              />
              <YAxis tick={{ fontSize: 9, fill: T.textMuted }} />
              <Tooltip
                contentStyle={ttStyle}
                formatter={(v: any) => v.toLocaleString()}
              />
              <Bar dataKey="Capacity" fill={T.blue} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Demand" fill={T.teal} radius={[2, 2, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 9, color: T.textMuted }} />
            </BarChart>
          </ResponsiveContainer>
        </DetailCard>
        <DetailCard>
          <SectionLabel>Utilization by Business Unit</SectionLabel>
          {buUtil.map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11, color: T.textSec }}>{r.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>
                  {r.util}%
                </span>
              </div>
              <DetailMiniBar value={r.util} color={r.color} />
            </div>
          ))}
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Allocation by Role</SectionLabel>
        <DetailTable
          headers={[
            "Role",
            "Allocated (FTE)",
            "Capacity (FTE)",
            "Utilization",
            "Gap",
          ]}
          rows={byRoleData.map((r) => [
            <span style={{ color: T.textSec, fontWeight: 600 }}>{r.role}</span>,
            r.allocated.toLocaleString(),
            r.capacity.toLocaleString(),
            <span style={{ color: T.green, fontWeight: 700 }}>{r.util}</span>,
            <span style={{ color: T.red, fontWeight: 700 }}>{r.gap}</span>,
          ])}
        />
      </DetailCard>
    </div>
  );
}

function ReportDetail3() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const owners = [
    { name: "Sarah Johnson", total: 35, approved: 25, pending: 10, rate: "71%" },
    { name: "Michael Lee", total: 28, approved: 19, pending: 9, rate: "68%" },
    { name: "Emily Davis", total: 23, approved: 17, pending: 6, rate: "73%" },
    { name: "David Brown", total: 18, approved: 12, pending: 6, rate: "66%" },
    { name: "Olivia Martin", total: 14, approved: 9, pending: 5, rate: "67%" },
  ];
  const approvalTrend = [
    { month: "Jan 2026", Approved: 52, Pending: 24 },
    { month: "Feb 2026", Approved: 58, Pending: 28 },
    { month: "Mar 2026", Approved: 62, Pending: 30 },
    { month: "Apr 2026", Approved: 66, Pending: 33 },
    { month: "May 2026", Approved: 64, Pending: 22 },
  ];
  const byType = [
    { name: "Demand Inputs", value: 38 },
    { name: "Capacity Inputs", value: 24 },
    { name: "Allocation Inputs", value: 14 },
    { name: "Financial Inputs", value: 7 },
    { name: "Timesheet Inputs", value: 3 },
  ];
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Planning Inputs" value="86" color={T.blue} />
        <StatTile label="Approved" value="64" color={T.green} />
        <StatTile label="Pending" value="22" color={T.orange} />
        <StatTile label="Approval Rate" value="74.4%" color={T.teal} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Approval Trend (Last 5 Months)</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={approvalTrend}
              margin={{ top: 5, right: 5, bottom: 5, left: -15 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: T.textMuted }}
              />
              <YAxis tick={{ fontSize: 9, fill: T.textMuted }} />
              <Tooltip contentStyle={ttStyle} />
              <Area
                type="monotone"
                dataKey="Approved"
                stroke={T.green}
                fill={T.green + "33"}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Pending"
                stroke={T.orange}
                fill={T.orange + "33"}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: 9, color: T.textMuted }} />
            </AreaChart>
          </ResponsiveContainer>
        </DetailCard>
        <DetailCard>
          <SectionLabel>Planning Inputs by Type</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={byType}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 90 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke={T.borderLight}
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 9, fill: T.textMuted }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fill: T.textMuted }}
                width={90}
              />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Planning Inputs by Owner</SectionLabel>
        <DetailTable
          headers={[
            "Owner",
            "Total Inputs",
            "Approved",
            "Pending",
            "Approval Rate",
          ]}
          rows={owners.map((r) => [
            <span style={{ color: T.textSec, fontWeight: 600 }}>{r.name}</span>,
            r.total,
            <span style={{ color: T.green, fontWeight: 600 }}>
              {r.approved}
            </span>,
            <span style={{ color: T.orange, fontWeight: 600 }}>
              {r.pending}
            </span>,
            <span style={{ color: T.blue, fontWeight: 700 }}>{r.rate}</span>,
          ])}
        />
      </DetailCard>
    </div>
  );
}

function ReportDetail4() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const donutData = [
    { name: "Cloud Migration", value: 18, fte: 13 },
    { name: "Data Warehouse", value: 14, fte: 10 },
    { name: "Mobile App Revamp", value: 12, fte: 9 },
    { name: "ERP Implementation", value: 10, fte: 7 },
    { name: "AI Platform", value: 8, fte: 6 },
    { name: "Others", value: 38, fte: 27 },
  ];
  const byPortfolio = [
    { name: "Digital Transformation", fte: 22, pct: 31.6 },
    { name: "Product Engineering", fte: 18, pct: 25.9 },
    { name: "Cloud Services", fte: 14, pct: 19.2 },
    { name: "Data & Analytics", fte: 10, pct: 14.5 },
    { name: "Business Applications", fte: 7, pct: 8.9 },
  ];
  const allocationTrend = [
    { month: "Jan 2026", fte: 60 },
    { month: "Feb 2026", fte: 63 },
    { month: "Mar 2026", fte: 65 },
    { month: "Apr 2026", fte: 68 },
    { month: "May 2026", fte: 71 },
  ];
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Allocated (FTE)" value="71" color={T.blue} />
        <StatTile label="Active Projects" value="24" color={T.teal} />
        <StatTile label="Avg Allocation %" value="81%" color={T.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Allocation by Project (Top 6)</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                position: "relative",
                width: 160,
                height: 160,
                flexShrink: 0,
              }}
            >
              <PieChart width={160} height={160}>
                <Pie
                  data={donutData}
                  cx={79}
                  cy={79}
                  innerRadius={48}
                  outerRadius={72}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                  71
                </div>
                <div style={{ fontSize: 9, color: T.textMuted }}>Total FTE</div>
              </div>
            </div>
            <div>
              {donutData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: DONUT_COLORS[i],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 10, color: T.textSec, flex: 1 }}>
                    {d.name}
                  </span>
                  <span
                    style={{ fontSize: 10, fontWeight: 700, color: T.text }}
                  >
                    {d.value}%
                  </span>
                  <span style={{ fontSize: 10, color: T.textFaint }}>
                    {d.fte}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DetailCard>
        <DetailCard>
          <SectionLabel>Allocation by Portfolio</SectionLabel>
          {byPortfolio.map((p, i) => (
            <div key={i} style={{ marginBottom: 11 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, color: T.textSec }}>{p.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: DONUT_COLORS[i],
                  }}
                >
                  {p.fte} ({p.pct}%)
                </span>
              </div>
              <DetailMiniBar value={p.pct} max={35} color={DONUT_COLORS[i]} />
            </div>
          ))}
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Allocation Trend</SectionLabel>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={allocationTrend}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.textMuted }} />
            <YAxis tick={{ fontSize: 9, fill: T.textMuted }} />
            <Tooltip
              contentStyle={ttStyle}
              formatter={(v: any) => `${v} FTE`}
            />
            <Line
              type="monotone"
              dataKey="fte"
              stroke={T.blue}
              strokeWidth={2}
              dot={{ r: 3, fill: T.blue }}
              name="Allocated FTE"
            />
          </LineChart>
        </ResponsiveContainer>
      </DetailCard>
    </div>
  );
}

function ReportDetail5() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const overList = [
    { name: "John Smith", role: "Developer", alloc: 98, projects: 5 },
    { name: "Priya Patel", role: "Analyst", alloc: 95, projects: 4 },
    { name: "Ravi Kumar", role: "Developer", alloc: 92, projects: 4 },
    { name: "Anita Desai", role: "Tester", alloc: 90, projects: 3 },
    { name: "Carlos Martinez", role: "Consultant", alloc: 88, projects: 3 },
    { name: "Emily Clark", role: "Developer", alloc: 86, projects: 2 },
    { name: "David Lee", role: "Architect", alloc: 84, projects: 2 },
    { name: "Sophie Wilson", role: "Analyst", alloc: 82, projects: 5 },
    { name: "James Thomas", role: "Developer", alloc: 80, projects: 3 },
    { name: "Maria Garcia", role: "Tester", alloc: 78, projects: 3 },
  ];
  const byRoleOver = [
    { role: "Developer", count: 19 },
    { role: "Consultant", count: 4 },
    { role: "Analyst", count: 4 },
    { role: "Tester", count: 3 },
    { role: "Architect", count: 1 },
  ];
  const byProject = [
    { name: "Cloud Migration", count: 8 },
    { name: "Data Warehouse", count: 7 },
    { name: "Mobile App Revamp", count: 6 },
    { name: "AI Platform", count: 5 },
    { name: "ERP Implementation", count: 5 },
  ];
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        <StatTile
          label="Over Allocated Resources"
          value="31 FTE"
          color={T.red}
        />
        <StatTile label="Over Allocation %" value="12.3%" color={T.orange} />
        <StatTile label="Projects Impacted" value="17" color={T.amber} />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}
      >
        <DetailCard>
          <SectionLabel>Over-Allocated Resources (Top 10)</SectionLabel>
          <DetailTable
            headers={["Resource", "Role", "Allocation %", "Projects"]}
            rows={overList.map((r) => [
              <span style={{ color: T.textSec, fontWeight: 600 }}>
                {r.name}
              </span>,
              <span style={{ color: T.textMuted }}>{r.role}</span>,
              <span
                style={{
                  fontWeight: 800,
                  color:
                    r.alloc >= 95
                      ? T.red
                      : r.alloc >= 90
                        ? T.orange
                        : T.amber,
                }}
              >
                {r.alloc}%
              </span>,
              r.projects,
            ])}
          />
        </DetailCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DetailCard>
            <SectionLabel>Over Allocation by Role</SectionLabel>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={byRoleOver}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 65 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke={T.borderLight}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: T.textMuted }}
                />
                <YAxis
                  type="category"
                  dataKey="role"
                  tick={{ fontSize: 9, fill: T.textMuted }}
                  width={65}
                />
                <Tooltip contentStyle={ttStyle} />
                <Bar
                  dataKey="count"
                  fill={T.red}
                  radius={[0, 3, 3, 0]}
                  name="Over-Allocated"
                />
              </BarChart>
            </ResponsiveContainer>
          </DetailCard>
          <DetailCard>
            <SectionLabel>Over Allocation by Project</SectionLabel>
            {byProject.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 10, color: T.textSec, minWidth: 120 }}>
                  {p.name}
                </span>
                <DetailMiniBar value={p.count} max={10} color={T.red} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.red,
                    minWidth: 22,
                  }}
                >
                  {p.count}
                </span>
              </div>
            ))}
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

function ReportDetail6() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Resources (FTE)" value="92" color={T.blue} />
        <StatTile label="Available (FTE)" value="18" color={T.green} />
        <StatTile label="Shared Resources" value="23" color={T.teal} />
        <StatTile
          label="Bench Resources"
          value="18 (24.8%)"
          color={T.gray}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Availability by Role</SectionLabel>
          <DetailTable
            headers={[
              "Role",
              "Total (FTE)",
              "Available (FTE)",
              "Availability %",
            ]}
            rows={byRoleReportDetail16.map((r) => [
              <span style={{ color: T.textSec }}>{r.role}</span>,
              r.total.toLocaleString(),
              <span style={{ color: T.green, fontWeight: 600 }}>
                {r.avail}
              </span>,
              <span style={{ color: T.teal, fontWeight: 700 }}>{r.pct}</span>,
            ])}
          />
        </DetailCard>
        <DetailCard>
          <SectionLabel>Shared Resources by Project (Top 9)</SectionLabel>
          {sharedProjects.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 10, color: T.textSec, minWidth: 150 }}>
                {p.name}
              </span>
              <DetailMiniBar value={p.shared} max={25} color={T.teal} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.teal,
                  minWidth: 28,
                }}
              >
                {p.shared}
              </span>
            </div>
          ))}
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Availability Trend</SectionLabel>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart
            data={availTrend}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.textMuted }} />
            <YAxis
              domain={[18, 26]}
              tick={{ fontSize: 9, fill: T.textMuted }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip contentStyle={ttStyle} formatter={(v: any) => `${v}%`} />
            <Area
              type="monotone"
              dataKey="pct"
              stroke={T.green}
              fill={T.green + "33"}
              strokeWidth={2}
              name="Availability %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </DetailCard>
    </div>
  );
}

function ReportDetail7() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Overall Compliance" value="92%" color={T.green} />
        <StatTile label="Timesheet Compliance" value="96%" color={T.teal} />
        <StatTile label="Allocation Adherence" value="91%" color={T.blue} />
        <StatTile label="Manager Approval" value="93%" color={T.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Compliance by Area</SectionLabel>
          {items.map((r, i) => (
            <div key={i} style={{ marginBottom: 11 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11, color: T.textSec }}>
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: r.value >= r.target ? T.green : T.red,
                  }}
                >
                  {r.value}%
                </span>
              </div>
              <DetailMiniBar
                value={r.value}
                color={r.value >= r.target ? T.green : T.red}
              />
            </div>
          ))}
        </DetailCard>
        <DetailCard>
          <SectionLabel>Non-Compliance by Reason</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                position: "relative",
                width: 130,
                height: 130,
                flexShrink: 0,
              }}
            >
              <PieChart width={130} height={130}>
                <Pie
                  data={nonCompReasons}
                  cx={64}
                  cy={64}
                  innerRadius={38}
                  outerRadius={60}
                  dataKey="value"
                >
                  {nonCompReasons.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div>
              {nonCompReasons.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: d.color,
                    }}
                  />
                  <span style={{ fontSize: 10, color: T.textSec }}>
                    {d.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: d.color,
                      marginLeft: 4,
                    }}
                  >
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Compliance Trend</SectionLabel>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={compTrend}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.textMuted }} />
            <YAxis
              domain={[85, 100]}
              tick={{ fontSize: 9, fill: T.textMuted }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip contentStyle={ttStyle} formatter={(v: any) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={T.green}
              strokeWidth={2}
              dot={{ r: 3, fill: T.green }}
              name="Compliance %"
            />
          </LineChart>
        </ResponsiveContainer>
      </DetailCard>
    </div>
  );
}

function ReportDetail8() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Budget" value="$24.80M" color={T.blue} />
        <StatTile label="Total Actual" value="$20.36M" color={T.teal} />
        <StatTile label="Variance" value="-$4.44M" color={T.red} />
        <StatTile label="Variance %" value="-17.9%" color={T.red} />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}
      >
        <DetailCard>
          <SectionLabel>Budget vs Actual — Monthly</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={budgetMonthly}
              margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: T.textMuted }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: T.textMuted }}
                tickFormatter={(v) => `$${v}M`}
              />
              <Tooltip contentStyle={ttStyle} formatter={(v: any) => `$${v}M`} />
              <Bar
                dataKey="budget"
                fill={T.blue}
                radius={[2, 2, 0, 0]}
                name="Budget"
              />
              <Bar
                dataKey="actual"
                fill={T.orange}
                radius={[2, 2, 0, 0]}
                name="Actual"
              />
              <Legend wrapperStyle={{ fontSize: 9, color: T.textMuted }} />
            </BarChart>
          </ResponsiveContainer>
        </DetailCard>
        <DetailCard>
          <SectionLabel>Variance by Type</SectionLabel>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: 220,
            }}
          >
            <PieChart width={260} height={200}>
              <Pie
                data={varianceByTypedData}
                cx="50%"
                cy="42%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {[T.red, T.orange, T.amber].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={ttStyle}
                formatter={(v: any) => `${v}%`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  fontSize: 10,
                  color: T.textMuted,
                  paddingTop: 8,
                }}
              />
            </PieChart>
          </div>
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Variance by Portfolio</SectionLabel>
        <DetailTable
          headers={varianceByPortfolioHeader}
          rows={portfolioVar.map((r) => [
            <span style={{ color: T.textSec }}>{r.name}</span>,
            `$${r.budget}M`,
            `$${r.actual}M`,
            <span style={{ color: T.red, fontWeight: 700 }}>
              ${r.variance}M
            </span>,
            <span style={{ color: T.red, fontWeight: 700 }}>{r.pct}%</span>,
          ])}
        />
      </DetailCard>
    </div>
  );
}

function ReportDetail9() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Vendor Spend" value="$8.12M" color={T.blue} />
        <StatTile label="Active Vendors" value="56" color={T.teal} />
        <StatTile label="Avg Performance Score" value="87%" color={T.green} />
        <StatTile label="On-Time Delivery" value="92%" color={T.purple} />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}
      >
        <DetailCard>
          <SectionLabel>Vendor Ranking by Spend</SectionLabel>
          <DetailTable
            headers={[
              "#",
              "Vendor",
              "Spend ($M)",
              "% of Total",
              "Score",
              "On-Time",
            ]}
            rows={vendors.map((v, i) => [
              <span
                style={{
                  fontWeight: 800,
                  color: i < 3 ? T.amber : T.textFaint,
                }}
              >
                #{i + 1}
              </span>,
              <span style={{ color: T.textSec, fontWeight: 600 }}>
                {v.name}
              </span>,
              `$${v.spend}M`,
              `${v.pct}%`,
              <span
                style={{
                  fontWeight: 700,
                  color: v.score >= 85 ? T.green : T.orange,
                }}
              >
                {v.score}%
              </span>,
              `${v.onTime}%`,
            ])}
          />
        </DetailCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DetailCard>
            <SectionLabel>Spend by Category</SectionLabel>
            <div style={{ display: "flex",justifyContent: "center", alignItems: "center", width: "100%", }}>
              <PieChart width={260} height={220}>
                <Pie
                  data={spendByCat}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                >
                  {spendByCat.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v: any) => `${v}%`}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconSize={10}
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 10,
                  }}
                />
              </PieChart>
            </div>
          </DetailCard>
          <DetailCard>
            <SectionLabel>Spend Trend</SectionLabel>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart
                data={spendTrend}
                margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: T.textMuted }}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: T.textMuted }}
                  tickFormatter={(v) => `$${v}M`}
                />
                <Tooltip contentStyle={ttStyle} formatter={(v: any) => `$${v}M`} />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke={T.amber}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Vendor Spend"
                />
              </LineChart>
            </ResponsiveContainer>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

function ReportDetail10() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Open Demands" value="41" color={T.red} />
        <StatTile label="In Progress (FTE)" value="18" color={T.orange} />
        <StatTile label="Fulfilled (FTE)" value="23" color={T.green} />
        <StatTile label="Avg Days to Fulfill" value="23" color={T.teal} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Demands by Priority</SectionLabel>
          {demandByPriority.map((d, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 11, color: T.textSec, fontWeight: 600 }}
                >
                  {d.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>
                  {d.value} ({d.pct}%)
                </span>
              </div>
              <DetailMiniBar value={d.pct} color={d.color} />
            </div>
          ))}
          <SectionLabel>Demands Aging</SectionLabel>
          {aging.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: `0.5px solid ${T.borderLight}`,
              }}
            >
              <span style={{ fontSize: 11, color: T.textSec }}>{d.range}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>
                  {d.pct}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: d.color }}>
                  {d.count}
                </span>
              </div>
            </div>
          ))}
        </DetailCard>
        <DetailCard>
          <SectionLabel>Demands by Role (Top 5)</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={byRole}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 65 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke={T.borderLight}
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 9, fill: T.textMuted }} />
              <YAxis
                type="category"
                dataKey="role"
                tick={{ fontSize: 9, fill: T.textMuted }}
                width={65}
              />
              <Tooltip contentStyle={ttStyle} />
              <Bar
                dataKey="value"
                fill={T.blue}
                radius={[0, 3, 3, 0]}
                name="Demands"
              />
            </BarChart>
          </ResponsiveContainer>
          <SectionLabel>Demand Fulfillment Status</SectionLabel>
          <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
            {demand.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: T.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </DetailCard>
      </div>
    </div>
  );
}

function ReportDetail11() {
  const [filters, setFilters] = useState(DEFAULT_EXEC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        <StatTile
          label="Forecast Capacity (Jun)"
          value="78 FTE"
          color={T.blue}
        />
        <StatTile
          label="Forecast Demand (Jun)"
          value="84 FTE"
          color={T.orange}
        />
        <StatTile label="Projected Gap (Jun)" value="-6" color={T.red} />
      </div>
      <DetailCard>
        <SectionLabel>6-Month Capacity vs Demand Forecast</SectionLabel>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={forecastData}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.textMuted }} />
            <YAxis
              domain={[4, 12]}
              tick={{ fontSize: 9, fill: T.textMuted }}
              tickFormatter={(v) => `${v}K`}
            />
            <Tooltip contentStyle={ttStyle} formatter={(v: any) => `${v}K FTE`} />
            <Line
              type="monotone"
              dataKey="cap"
              stroke={T.green}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Capacity"
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke={T.blue}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Demand"
            />
            <Line
              type="monotone"
              dataKey="gap"
              stroke={T.red}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
              name="Gap"
            />
            <Legend wrapperStyle={{ fontSize: 9, color: T.textMuted }} />
          </LineChart>
        </ResponsiveContainer>
      </DetailCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Gap Analysis by Month</SectionLabel>
          <DetailTable
            headers={["Month", "Capacity (K)", "Demand (K)", "Gap (K)", "Risk"]}
            rows={forecastData.map((r) => [
              <span style={{ fontWeight: 600, color: T.textSec }}>
                {r.month}
              </span>,
              r.cap,
              r.demand,
              <span style={{ color: T.red, fontWeight: 700 }}>{r.gap}</span>,
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: r.gap < -1.5 ? T.red : T.orange,
                  background: (r.gap < -1.5 ? T.red : T.orange) + "18",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                {r.gap < -1.5 ? "Critical" : "High"}
              </span>,
            ])}
          />
        </DetailCard>
        <DetailCard>
          <SectionLabel>Planning Recommendations</SectionLabel>
          {planning.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: `0.5px solid ${T.borderLight}`,
              }}
            >
              <span style={{ fontSize: 11, color: T.textSec, flex: 1 }}>
                {r.action}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: r.color,
                  background: r.color + "18",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {r.priority}
              </span>
            </div>
          ))}
        </DetailCard>
      </div>
    </div>
  );
}

function ReportDetail13() {
  const [filters, setFilters] = useState(DEFAULT_EXEC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="TS Compliance" value="96%" color={T.green} />
        <StatTile label="Actual FTE" value="29" color={T.blue} />
        <StatTile label="Planned FTE" value="29" color={T.teal} />
        <StatTile label="Variance" value="0%" color={T.gray} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Planned vs Actual Effort (FTE)</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={tsData}
              margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: T.textMuted }}
              />
              <YAxis tick={{ fontSize: 9, fill: T.textMuted }} />
              <Tooltip contentStyle={ttStyle} />
              <Bar
                dataKey="planned"
                fill={T.blue}
                radius={[2, 2, 0, 0]}
                name="Planned"
              />
              <Bar
                dataKey="actual"
                fill={T.green}
                radius={[2, 2, 0, 0]}
                name="Actual"
              />
              <Legend wrapperStyle={{ fontSize: 9, color: T.textMuted }} />
            </BarChart>
          </ResponsiveContainer>
        </DetailCard>
        <DetailCard>
          <SectionLabel>Timesheet Breakdown</SectionLabel>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 120,
                height: 120,
                flexShrink: 0,
              }}
            >
              <PieChart width={120} height={120}>
                <Pie
                  data={[
                    { value: 66 },
                    { value: 20 },
                    { value: 10 },
                    { value: 4 },
                  ]}
                  cx={59}
                  cy={59}
                  innerRadius={34}
                  outerRadius={54}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {[T.green, T.red, T.orange, T.gray].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div>
              {[
                ["On Track", "66%", T.green],
                ["Over", "20%", T.red],
                ["Under", "10%", T.orange],
                ["Absent", "4%", T.gray],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: c,
                    }}
                  />
                  <span style={{ fontSize: 11, color: T.textSec }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <SectionLabel>Compliance by Department</SectionLabel>
          {compliance.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 10, color: T.textSec, minWidth: 130 }}>
                {d.dept}
              </span>
              <DetailMiniBar
                value={d.v}
                color={d.v >= 95 ? T.green : T.orange}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.text,
                  minWidth: 30,
                }}
              >
                {d.v}%
              </span>
            </div>
          ))}
        </DetailCard>
      </div>
    </div>
  );
}

function ReportDetail14() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const ttStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    color: T.text,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Pending Approvals" value="27" color={T.orange} />
        <StatTile label="Overdue Approvals" value="12" color={T.red} />
        <StatTile label="Approved (This Month)" value="60" color={T.green} />
        <StatTile label="Avg Approval Time" value="2.4 days" color={T.teal} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DetailCard>
          <SectionLabel>Pending Approvals by Type</SectionLabel>
          {pendingApprovals.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: `0.5px solid ${T.borderLight}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: r.color,
                  }}
                />
                <span style={{ fontSize: 12, color: T.textSec }}>
                  {r.label}
                </span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: r.color }}>
                {r.value}
              </span>
            </div>
          ))}
        </DetailCard>
        <DetailCard>
          <SectionLabel>Approval Workflow Status</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={T.borderLight} />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 9, fill: T.textMuted }}
              />
              <YAxis tick={{ fontSize: 9, fill: T.textMuted }} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {[T.blue, T.orange, T.green, T.red].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DetailCard>
      </div>
      <DetailCard>
        <SectionLabel>Overdue Approvals Detail</SectionLabel>
        <DetailTable
          headers={header}
          rows={rows.map((r) => [
            <span
              style={{ color: T.blue, fontFamily: "monospace", fontSize: 10 }}
            >
              {r.id}
            </span>,
            r.type,
            <span style={{ color: T.textMuted }}>{r.req}</span>,
            <span
              style={{
                color: r.days >= 12 ? T.red : T.orange,
                fontWeight: 700,
              }}
            >
              {r.days} days
            </span>,
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: r.col,
                background: r.col + "18",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {r.pri}
            </span>,
          ])}
        />
      </DetailCard>
    </div>
  );
}

function ReportDetail15() {
  const [filters, setFilters] = useState(DEFAULT_GENERIC_FILTERS);
  const allReports = reportCards.filter((r) => !r.hub);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GenericFilterBar filters={filters} setFilters={setFilters} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
        }}
      >
        <StatTile label="Total Reports" value="14" color={T.blue} />
        <StatTile label="Scheduled Reports" value="8" color={T.teal} />
        <StatTile label="Favorites" value="5" color={T.amber} />
        <StatTile label="Recently Viewed" value="7" color={T.purple} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 8,
        }}
      >
        {reportDetails15.map((type, i) => (
          <div
            key={i}
            style={{
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 10,
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: DONUT_COLORS[i % DONUT_COLORS.length],
              }}
            >
              {type}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: T.text,
                marginTop: 2,
              }}
            >
              {type === "All" ? allReports.length : [3, 2, 4, 3, 2, 3, 2][i % 7]}
            </div>
            <div style={{ fontSize: 10, color: T.textFaint }}>reports</div>
          </div>
        ))}
      </div>
      <DetailCard>
        <SectionLabel>All Reports</SectionLabel>
        <DetailTable
          headers={["#", "Report", "Description", "Last Run", "Status"]}
          rows={allReports.map((r) => [
            <span style={{ color: T.textFaint, fontWeight: 600 }}>
              {r.num}
            </span>,
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              <span style={{ color: T.textSec, fontWeight: 600 }}>
                {r.title}
              </span>
            </div>,
            <span style={{ color: T.textFaint }}>{r.desc}</span>,
            <span style={{ color: T.textMuted }}>May 15, 2026</span>,
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.green,
                background: T.green + "18",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              Active
            </span>,
          ])}
        />
      </DetailCard>
    </div>
  );
}

// ─── Detail view registry ─────────────────────────────────────────────────────

const DETAIL_VIEWS = {
  1: ReportDetail1,
  2: ReportDetail2,
  3: ReportDetail3,
  4: ReportDetail4,
  5: ReportDetail5,
  6: ReportDetail6,
  7: ReportDetail7,
  8: ReportDetail8,
  9: ReportDetail9,
  10: ReportDetail10,
  11: ReportDetail11,
  12: ReportDetail12,
  13: ReportDetail13,
  14: ReportDetail14,
  15: ReportDetail15,
};

// ─── Back bar ─────────────────────────────────────────────────────────────────

function BackBar({ onBack }) {
  return (
    <div
      style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 13,
          cursor: "pointer",
          color: T.textSec,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Back
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportingAnalytics() {
  const [activeReport, setActiveReport] = useState(null);
  const [filters, setFilters] = useState(main);

  // Full-page detail for reports 1 and 12 (have their own filter bars)
  if (activeReport && (activeReport.num === 1 || activeReport.num === 12)) {
    const DetailView = DETAIL_VIEWS[activeReport.num];
    return (
      <>
        <GlobalStyles />
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            background: T.bg,
            minHeight: "100vh",
          }}
        >
          <BackBar onBack={() => setActiveReport(null)} />
          <DetailView />
        </div>
      </>
    );
  }

  // Padded detail for all other reports
  if (activeReport) {
    const DetailView = DETAIL_VIEWS[activeReport.num];
    return (
      <>
        <GlobalStyles />
        <div
          style={{
            padding: "20px",
            fontFamily: "system-ui, sans-serif",
            background: T.bg,
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setActiveReport(null)}
              style={{
                background: T.surface,
                border: `0.5px solid ${T.border}`,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                cursor: "pointer",
                color: T.textSec,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back
            </button>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: T.text,
              }}
            >
              {activeReport.num}. {activeReport.title}
            </h2>
            <span
              style={{
                fontSize: 11,
                background: activeReport.color + "18",
                color: activeReport.color,
                borderRadius: 6,
                padding: "3px 10px",
              }}
            >
              {activeReport.desc}
            </span>
            <div style={{ marginLeft: "auto" }}></div>
          </div>
          {DetailView ? <DetailView /> : null}
        </div>
      </>
    );
  }

  // Main grid
  return (
    <>
      <GlobalStyles />
      <div
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          background: T.bg,
          minHeight: "100vh",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Resource Management Reports
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {reportCards.map((card) => (
            <ReportCard key={card.num} card={card} onView={setActiveReport} />
          ))}
        </div>
      </div>
    </>
  );
}