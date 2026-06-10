// ─── DashboardHeader.tsx ──────────────────────────────────────────────────────
// Shared header used by all persona dashboards.
// Row 1: "Dashboard" bold title | Active View pill | Customize button (right)
// Row 2: Full-width filter bar — Pillars, Portfolio, Region, Department,
//         Resource Type (select dropdowns) + Time Period date-range picker

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Star } from "lucide-react";
import type { FilterConfig } from "@/hooks/useDashboardConfig";
import type { SavedDashboard } from "@/components/DashboardService";

const T = {
  surface:    "var(--db-surface,    #ffffff)",
  border:     "var(--db-border,     #e5e7eb)",
  text:       "var(--db-text-primary, #111827)",
  textSec:    "var(--db-text-sec,   #374151)",
  textMuted:  "var(--db-text-muted, #6b7280)",
  textFaint:  "var(--db-text-faint, #9ca3af)",
  inputBg:    "var(--db-input-bg,   #ffffff)",
  surfaceAlt: "var(--db-surface-alt,#f9fafb)",
  blue:       "#3b82f6",
};

// ─── Filter options per filter id ─────────────────────────────────────────────
const FILTER_OPTIONS: Record<string, string[]> = {
  filter_pillar:        ["All", "Hi-tech", "Banking", "Healthcare", "Retail", "Insurance"],
  filter_portfolio:     ["All", "Global", "APAC", "EMEA", "Americas", "India"],
  filter_region:        ["All", "North America", "Europe", "Asia Pacific", "India", "Middle East"],
  filter_department:    ["All", "Engineering", "QA", "Data", "Design", "DevOps", "PMO"],
  filter_resource_type: ["All", "Permanent", "Contract", "Intern", "Consultant"],
};

// ─── Individual filter select box ─────────────────────────────────────────────
function FilterSelect({ label, filterId }: { label: string; filterId: string }) {
  const [value, setValue] = useState("All");
  const options = FILTER_OPTIONS[filterId] ?? ["All"];
  const active = value !== "All";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${active ? `${T.blue}50` : T.border}`,
        borderRadius: 7,
        background: active ? `${T.blue}08` : T.inputBg,
        overflow: "hidden",
        height: 30,
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 11,
          color: active ? T.blue : T.textFaint,
          fontWeight: 600,
          padding: "0 9px",
          borderRight: `1px solid ${active ? `${T.blue}30` : T.border}`,
          whiteSpace: "nowrap",
          flexShrink: 0,
          lineHeight: "30px",
        }}
      >
        {label}
      </span>

      {/* Native select — invisible but interactive */}
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            width: "100%",
          }}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        {/* Visible value + chevron */}
        <span
          style={{
            fontSize: 11,
            color: active ? T.blue : T.textSec,
            fontWeight: active ? 600 : 400,
            padding: "0 6px 0 8px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {value}
        </span>
        <ChevronDown size={11} color={active ? T.blue : T.textFaint} style={{ marginRight: 7, flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isBetween(d: Date, s: Date, e: Date) {
  return d > s && d < e;
}
const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Single month grid ────────────────────────────────────────────────────────
interface MonthGridProps {
  year: number;
  month: number;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
}
function MonthGrid({ year, month, rangeStart, rangeEnd, hoverDate, onDayClick, onDayHover }: MonthGridProps) {
  const totalDays = daysInMonth(year, month);
  const startDay  = startDayOfMonth(year, month);
  const today     = new Date(2026, 5, 3);

  // effective end for live range preview while hovering
  const effEnd = rangeEnd ?? (rangeStart && hoverDate && hoverDate >= rangeStart ? hoverDate : null);

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ width: 224, flexShrink: 0 }}>
      {/* Month + year heading */}
      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>
        {MONTH_NAMES[month]} {year}
      </div>
      {/* Day-of-week header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)", marginBottom: 2 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: T.textFaint, height: 24, lineHeight: "24px" }}>
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ height: 32 }} />;
          const d = new Date(year, month, day);
          const isStart  = rangeStart ? sameDay(d, rangeStart) : false;
          const isEnd    = effEnd     ? sameDay(d, effEnd)     : false;
          const inRange  = rangeStart && effEnd ? isBetween(d, rangeStart, effEnd) : false;
          const isToday  = sameDay(d, today);
          const col      = i % 7; // 0=Sun … 6=Sat

          // Range bar fills behind the pill
          const showBarLeft  = isEnd   && rangeStart && d > rangeStart;
          const showBarRight = isStart && effEnd     && effEnd > d;
          const showBarFull  = inRange;

          const pillBg    = isStart || isEnd ? T.blue : "transparent";
          const pillColor = isStart || isEnd ? "#fff"
                          : inRange           ? T.blue
                          : isToday           ? T.blue
                          : T.textSec;
          const pillFw    = isStart || isEnd || isToday ? 700 : 400;
          const pillBorder = !isStart && !isEnd && hoverDate && sameDay(d, hoverDate)
                           ? `1px solid ${T.blue}60` : "1px solid transparent";

          return (
            <div key={`d-${day}`} style={{ position: "relative", height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={() => onDayHover(d)}>
              {/* Range highlight bar */}
              {(showBarFull || showBarLeft || showBarRight) && (
                <div style={{
                  position: "absolute",
                  top: 4, bottom: 4,
                  left:  showBarLeft  ? 0         : showBarRight ? "50%" : 0,
                  right: showBarRight ? 0         : showBarLeft  ? "50%" : 0,
                  background: `${T.blue}18`,
                  pointerEvents: "none",
                  // don't overflow on week edges
                  borderRadius: col === 0 || isStart ? "8px 0 0 8px"
                              : col === 6 || isEnd   ? "0 8px 8px 0"
                              : 0,
                }} />
              )}
              <button
                onClick={() => onDayClick(d)}
                style={{
                  position: "relative", zIndex: 1,
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%",
                  border: pillBorder,
                  background: pillBg,
                  color: pillColor,
                  fontSize: 12, fontWeight: pillFw,
                  cursor: "pointer",
                  outline: "none",
                  transition: "background 0.1s",
                }}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Period picker — full calendar date range ────────────────────────────
function TimePeriodPicker() {
  const [open,       setOpen]       = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(new Date(2026, 4, 1));
  const [rangeEnd,   setRangeEnd]   = useState<Date | null>(new Date(2026, 4, 31));
  const [hoverDate,  setHoverDate]  = useState<Date | null>(null);
  const [leftYear,   setLeftYear]   = useState(2026);
  const [leftMonth,  setLeftMonth]  = useState(4); // May → Jun
  const ref = useRef<HTMLDivElement>(null);

  // Right calendar is always leftMonth + 1
  const rightMonth = leftMonth === 11 ? 0  : leftMonth + 1;
  const rightYear  = leftMonth === 11 ? leftYear + 1 : leftYear;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function prevMonth() {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
    else setLeftMonth(m => m - 1);
  }
  function nextMonth() {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
    else setLeftMonth(m => m + 1);
  }

  function handleDayClick(d: Date) {
    // First click sets start; second sets end; third resets
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d); setRangeEnd(null);
    } else {
      if (d < rangeStart) { setRangeEnd(rangeStart); setRangeStart(d); }
      else { setRangeEnd(d); }
    }
  }

  const fmtFull  = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const triggerLabel = rangeStart && rangeEnd
    ? `${fmtShort(rangeStart)} – ${fmtFull(rangeEnd)}`
    : rangeStart ? `${fmtFull(rangeStart)} – …`
    : "Select range";

  const navBtn: React.CSSProperties = {
    width: 30, height: 30,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    color: T.textMuted,
    flexShrink: 0,
    lineHeight: 1,
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1.6, minWidth: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          border: `1px solid ${open ? T.blue : T.border}`,
          borderRadius: 7, background: T.inputBg, height: 30,
          padding: "0 9px", cursor: "pointer", outline: "none",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{ fontSize: 11, color: T.textFaint, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>Time Period</span>
        <span style={{ width: 1, height: 16, background: T.border, margin: "0 9px", flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 11, color: T.textSec, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
          {triggerLabel}
        </span>
        <span style={{ fontSize: 14, marginLeft: 8, flexShrink: 0 }}>📅</span>
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          onMouseLeave={() => setHoverDate(null)}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "16px 20px 14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
            zIndex: 300,
          }}
        >
          {/* Nav row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
            <button style={navBtn} onClick={prevMonth}>‹</button>
            <div style={{ flex: 1, display: "flex", gap: 32, justifyContent: "center" }}>
              {/* titles live inside MonthGrid; spacers keep layout */}
              <div style={{ width: 224 }} />
              <div style={{ width: 1, background: T.border }} />
              <div style={{ width: 224 }} />
            </div>
            <button style={navBtn} onClick={nextMonth}>›</button>
          </div>

          {/* Two grids */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <MonthGrid
              year={leftYear}  month={leftMonth}
              rangeStart={rangeStart} rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onDayClick={handleDayClick} onDayHover={setHoverDate}
            />
            <div style={{ width: 1, background: T.border, alignSelf: "stretch" }} />
            <MonthGrid
              year={rightYear} month={rightMonth}
              rangeStart={rangeStart} rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onDayClick={handleDayClick} onDayHover={setHoverDate}
            />
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: T.textMuted, minWidth: 180 }}>
              {rangeStart && rangeEnd
                ? `${fmtFull(rangeStart)} → ${fmtFull(rangeEnd)}`
                : rangeStart ? "Now select an end date" : "Select a start date"}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setRangeStart(null); setRangeEnd(null); }}
                style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, color: T.textSec, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer" }}
              >
                Clear
              </button>
              <button
                onClick={() => { if (rangeStart && rangeEnd) setOpen(false); }}
                disabled={!(rangeStart && rangeEnd)}
                style={{
                  padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#fff",
                  background: rangeStart && rangeEnd ? T.blue : "#93c5fd",
                  border: "none", borderRadius: 8,
                  cursor: rangeStart && rangeEnd ? "pointer" : "not-allowed",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active View Selector (Default View pill + dropdown) ──────────────────────
const DEFAULT_VIEW_ID = "default";

interface ActiveViewSelectorProps {
  activeViewId: string;
  activeViewName: string;
  savedViews: SavedDashboard[];
  onSelect: (id: string) => void;
}

function ActiveViewSelector({ activeViewId, activeViewName, savedViews, onSelect }: ActiveViewSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDefault = activeViewId === DEFAULT_VIEW_ID;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Pill button — matches screenshot: ☆ Default View */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 11px",
          fontSize: 12,
          fontWeight: 500,
          color: T.textSec,
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = T.surfaceAlt}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
      >
        <Star
          size={11}
          fill={isDefault ? "none" : T.blue}
          color={isDefault ? T.textFaint : T.blue}
          strokeWidth={2}
        />
        <span style={{ color: isDefault ? T.textSec : T.blue, fontWeight: isDefault ? 500 : 600 }}>
          {activeViewName}
        </span>
        <ChevronDown
          size={10}
          color={T.textFaint}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "6px 0",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            zIndex: 300,
            minWidth: 220,
          }}
        >
          {/* System section */}
          <div style={{ padding: "4px 14px 5px", fontSize: 10, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            System
          </div>
          <ViewOption id={DEFAULT_VIEW_ID} label="Default View" active={activeViewId === DEFAULT_VIEW_ID}
            onSelect={id => { onSelect(id); setOpen(false); }} />

          {/* Saved section */}
          {savedViews.length > 0 && (
            <>
              <div style={{ height: 1, background: T.border, margin: "5px 0" }} />
              <div style={{ padding: "4px 14px 5px", fontSize: 10, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                My Saved Views
              </div>
              {savedViews.map(v => (
                <ViewOption key={v.id} id={v.id} label={v.name} active={activeViewId === v.id}
                  onSelect={id => { onSelect(id); setOpen(false); }} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ViewOption({ id, label, active, onSelect }: { id: string; label: string; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "7px 14px", background: "none", border: "none",
        fontSize: 12, fontWeight: active ? 700 : 500,
        color: active ? T.blue : T.textSec, cursor: "pointer", gap: 8,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = T.surfaceAlt}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
    >
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {active && <Check size={12} color={T.blue} />}
    </button>
  );
}

// ─── Public props interface ───────────────────────────────────────────────────
export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  filters: FilterConfig[];
  onCustomize: () => void;
  showCustomize: boolean;
  activeViewId?: string;
  activeViewName?: string;
  savedViews?: SavedDashboard[];
  onSelectView?: (id: string) => void;
}

export const DEFAULT_VIEW_ID_EXPORT = DEFAULT_VIEW_ID;

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardHeader({
  title,
  subtitle,
  filters,
  onCustomize,
  showCustomize,
  activeViewId  = DEFAULT_VIEW_ID,
  activeViewName = "Default View",
  savedViews    = [],
  onSelectView,
}: DashboardHeaderProps) {
  // Determine which filter ids are visible (checked)
  const visibleFilters = filters.filter(f => f.checked);

  // Map the user's FilterConfig list to labelled select boxes,
  // excluding "filter_time_period" which has its own special picker.
  const selectFilters = visibleFilters.filter(f => f.id !== "filter_time_period");
  const hasTimePeriod = visibleFilters.some(f => f.id === "filter_time_period");

  return (
    <>
      {/* ── ROW 1 ── Title | Active View pill ··················· Customize ── */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 18px",
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        {/* Left: bold "Dashboard" + pipe + Active View pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: T.text,
              letterSpacing: "-0.01em",
            }}
          >
            Dashboard
          </span>
          <ActiveViewSelector
            activeViewId={activeViewId}
            activeViewName={activeViewName}
            savedViews={savedViews}
            onSelect={onSelectView ?? (() => {})}
          />
        </div>

        {/* Right: Customize button */}
        <button
          onClick={onCustomize}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: showCustomize ? "#1d4ed8" : T.blue,
            border: "none",
            borderRadius: 8,
            padding: "7px 16px",
            fontSize: 12,
            cursor: "pointer",
            color: "#fff",
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          ✦ Customize
        </button>
      </div>

      {/* ── ROW 2 ── Filter bar ──────────────────────────────────────────────── */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 18px",
          height: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {selectFilters.map(f => (
          <FilterSelect key={f.id} label={f.label} filterId={f.id} />
        ))}
        {hasTimePeriod && <TimePeriodPicker />}
      </div>
    </>
  );
}