import { useState, useRef } from "react";
import {
  heatmapData,
  heatmapMonths,
  heatmapByProjects,
  heatmapByRoles,
  heatmapByCapabilityGroups,
  heatmapByTeams,
  heatmapByDemandCategories,
} from "@/mocks/ReportingAnalytics";

// ─── RAG color logic ─────────────────────────────────────────────────────────
// Green  0–60%   : healthy / low utilization
// Amber  65–85%  : moderate / attention required
// Red    90–100% : critical / over-allocation

function ragColor(val: number): { bg: string; text: string; label: string } {
  if (val >= 90)
    return { bg: "#DC2626", text: "#ffffff", label: "Critical" };
  if (val >= 65)
    return { bg: "#D97706", text: "#ffffff", label: "Moderate" };
  return { bg: "#16A34A", text: "#ffffff", label: "Healthy" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewType =
  | "pillars"
  | "projects"
  | "roles"
  | "capabilityGroups"
  | "teams"
  | "demandCategories";

interface FlatRow {
  rowLabel: string;
  subLabel: string;
  resourceCount: number;
  vals: number[];
  pillar?: string;
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
  thBg: "var(--ra-th-bg)",
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipInfo {
  x: number;
  y: number;
  val: number;
  rowLabel: string;
  period: string;
  subLabel: string;
  resourceCount: number;
  ragLabel: string;
}

function HeatTooltip({ info }: { info: TooltipInfo }) {
  const { bg, label } = ragColor(info.val);
  return (
    <div
      style={{
        position: "fixed",
        left: info.x + 12,
        top: info.y - 10,
        zIndex: 9999,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "10px 13px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
        minWidth: 180,
        pointerEvents: "none",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>
        {info.rowLabel}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          color: T.textSec,
        }}
      >
        <div>
          <span style={{ color: T.textMuted }}>Period: </span>
          <strong>{info.period}</strong>
        </div>
        <div>
          <span style={{ color: T.textMuted }}>Group: </span>
          {info.subLabel}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.textMuted }}>Utilization: </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 13,
              color: bg,
              background: bg + "18",
              padding: "1px 7px",
              borderRadius: 4,
            }}
          >
            {info.val}%
          </span>
        </div>
        {info.resourceCount > 0 && (
          <div>
            <span style={{ color: T.textMuted }}>Resources: </span>
            <strong>{info.resourceCount}</strong>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: bg,
              flexShrink: 0,
            }}
          />
          <span style={{ color: T.textMuted }}>Status: </span>
          <strong style={{ color: bg }}>{label}</strong>
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function HeatLegend() {
  const items = [
    { label: "Healthy (0–60%)", bg: "#16A34A" },
    { label: "Moderate (65–85%)", bg: "#D97706" },
    { label: "Critical (90–100%)", bg: "#DC2626" },
  ];
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
      {items.map((item) => (
        <span
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: T.textMuted,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: item.bg,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── View tab configs ─────────────────────────────────────────────────────────

const VIEW_TABS: { key: ViewType; label: string; icon: string }[] = [
  { key: "pillars", label: "Pillars", icon: "🏢" },
  { key: "projects", label: "Projects", icon: "📂" },
  { key: "roles", label: "Resource Roles", icon: "👤" },
  { key: "capabilityGroups", label: "Capability Groups", icon: "⚙️" },
  { key: "teams", label: "Teams", icon: "👥" },
  { key: "demandCategories", label: "Demand Categories", icon: "📋" },
];

// ─── Build flat rows from heatmapData (pillar view, with optional filter) ─────

function buildPillarRows(pillarFilter: string): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const pillar of heatmapData) {
    if (pillarFilter !== "All" && pillar.pillar !== pillarFilter) continue;
    for (const row of pillar.rows) {
      rows.push({
        rowLabel: row.team,
        subLabel: pillar.pillar,
        resourceCount: row.resourceCount ?? 0,
        vals: row.vals,
        pillar: pillar.pillar,
      });
    }
  }
  return rows;
}

// ─── Main CohortHeatmap component ─────────────────────────────────────────────

interface CohortHeatmapProps {
  /** When passed, filters the pillar view to a single pillar (or "All") */
  pillarFilter?: string;
  title?: string;
}

export default function CohortHeatmap({
  pillarFilter = "All",
  title = "Capacity Utilization Heatmap",
}: CohortHeatmapProps) {
  const [view, setView] = useState<ViewType>("pillars");
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [localPillarFilter, setLocalPillarFilter] = useState<string>(pillarFilter);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resolve rows for current view
  const effectivePillarFilter =
    pillarFilter !== "All" ? pillarFilter : localPillarFilter;

  function getRows(): FlatRow[] {
    switch (view) {
      case "pillars":
        return buildPillarRows(effectivePillarFilter);
      case "projects":
        return heatmapByProjects.map((r) => ({
          rowLabel: r.rowLabel,
          subLabel: r.subLabel,
          resourceCount: r.resourceCount,
          vals: r.vals,
        }));
      case "roles":
        return heatmapByRoles.map((r) => ({
          rowLabel: r.rowLabel,
          subLabel: r.subLabel,
          resourceCount: r.resourceCount,
          vals: r.vals,
        }));
      case "capabilityGroups":
        return heatmapByCapabilityGroups.map((r) => ({
          rowLabel: r.rowLabel,
          subLabel: r.subLabel,
          resourceCount: r.resourceCount,
          vals: r.vals,
        }));
      case "teams":
        return heatmapByTeams.map((r) => ({
          rowLabel: r.rowLabel,
          subLabel: r.subLabel,
          resourceCount: r.resourceCount,
          vals: r.vals,
        }));
      case "demandCategories":
        return heatmapByDemandCategories.map((r) => ({
          rowLabel: r.rowLabel,
          subLabel: r.subLabel,
          resourceCount: r.resourceCount,
          vals: r.vals,
        }));
    }
  }

  const rows = getRows();
  const months = heatmapMonths;
  const uniquePillars = ["All", ...heatmapData.map((p) => p.pillar)];

  // Compute summary stats
  const allVals = rows.flatMap((r) => r.vals);
  const avgUtil = allVals.length
    ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length)
    : 0;
  const criticalCells = allVals.filter((v) => v >= 90).length;
  const healthyCells = allVals.filter((v) => v < 65).length;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{ fontSize: 13, fontWeight: 700, color: T.text }}
          >
            {title}
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
            {rows.length} rows · {months.length} periods ·{" "}
            <span style={{ color: "#16A34A", fontWeight: 600 }}>
              {healthyCells} healthy
            </span>{" "}
            ·{" "}
            <span style={{ color: "#D97706", fontWeight: 600 }}>
              {allVals.filter((v) => v >= 65 && v < 90).length} moderate
            </span>{" "}
            ·{" "}
            <span style={{ color: "#DC2626", fontWeight: 600 }}>
              {criticalCells} critical
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "#DC262618",
              border: "1px solid #DC262633",
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 11,
              color: "#DC2626",
              fontWeight: 600,
            }}
          >
            Avg Utilization: {avgUtil}%
          </div>
          {/* Pillar filter only relevant for pillar view or parent passes All */}
          {view === "pillars" && pillarFilter === "All" && (
            <select
              value={localPillarFilter}
              onChange={(e) => setLocalPillarFilter(e.target.value)}
              style={{
                height: 32,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "0 10px",
                fontSize: 11,
                background: T.surface,
                color: T.textSec,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {uniquePillars.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* View tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {VIEW_TABS.map((tab) => {
          const active = tab.key === view;
          return (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 7,
                border: active ? "1.5px solid #6366f1" : `1px solid ${T.border}`,
                background: active ? "#6366f1" : T.surface,
                color: active ? "#fff" : T.textSec,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 12 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Heatmap grid */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "visible",
          borderRadius: 8,
          border: `1px solid ${T.border}`,
        }}
      >
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%",
            minWidth: 700,
          }}
        >
          <thead>
            <tr>
              {/* Row dimension header */}
              <th
                style={{
                  background: T.thBg,
                  padding: "8px 14px",
                  textAlign: "left",
                  fontSize: 10,
                  color: T.textMuted,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  borderBottom: `1.5px solid ${T.border}`,
                  borderRight: `1px solid ${T.border}`,
                  minWidth: 180,
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                }}
              >
                {VIEW_TABS.find((v) => v.key === view)?.label ?? "Row"}
              </th>
              {/* Sub-label header */}
              <th
                style={{
                  background: T.thBg,
                  padding: "8px 10px",
                  textAlign: "left",
                  fontSize: 10,
                  color: T.textMuted,
                  fontWeight: 700,
                  borderBottom: `1.5px solid ${T.border}`,
                  borderRight: `1px solid ${T.border}`,
                  minWidth: 110,
                  whiteSpace: "nowrap",
                }}
              >
                {view === "pillars" ? "Pillar" : "Group"}
              </th>
              {/* Month headers */}
              {months.map((m, i) => (
                <th
                  key={m}
                  style={{
                    background: T.thBg,
                    padding: "8px 6px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textSec,
                    borderBottom: `1.5px solid ${T.border}`,
                    borderRight:
                      i < months.length - 1
                        ? `1px solid ${T.borderLight}`
                        : undefined,
                    minWidth: 64,
                    whiteSpace: "nowrap",
                  }}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={`${row.rowLabel}-${ri}`}
                style={{
                  background:
                    ri % 2 === 0 ? T.surface : T.surfaceAlt,
                }}
              >
                {/* Row label */}
                <td
                  style={{
                    padding: "0 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.textSec,
                    borderBottom: `1px solid ${T.borderLight}`,
                    borderRight: `1px solid ${T.border}`,
                    height: 40,
                    whiteSpace: "nowrap",
                    background: ri % 2 === 0 ? T.surface : T.surfaceAlt,
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  {row.rowLabel}
                </td>
                {/* Sub-label */}
                <td
                  style={{
                    padding: "0 10px",
                    fontSize: 10,
                    color: T.textMuted,
                    borderBottom: `1px solid ${T.borderLight}`,
                    borderRight: `1px solid ${T.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.subLabel}
                </td>
                {/* Value cells */}
                {row.vals.map((val, vi) => {
                  const { bg, text } = ragColor(val);
                  return (
                    <td
                      key={vi}
                      style={{
                        padding: "4px 3px",
                        textAlign: "center",
                        borderBottom: `1px solid ${T.borderLight}`,
                        borderRight:
                          vi < row.vals.length - 1
                            ? `1px solid ${T.borderLight}`
                            : undefined,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        const rect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        setTooltip({
                          x: rect.right,
                          y: rect.top + rect.height / 2,
                          val,
                          rowLabel: row.rowLabel,
                          period: months[vi],
                          subLabel: row.subLabel,
                          resourceCount: row.resourceCount,
                          ragLabel: ragColor(val).label,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 52,
                          height: 30,
                          borderRadius: 5,
                          background: bg,
                          fontSize: 11,
                          fontWeight: 700,
                          color: text,
                          letterSpacing: "-0.02em",
                          userSelect: "none",
                        }}
                      >
                        {val}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={months.length + 2}
                  style={{
                    padding: "28px",
                    textAlign: "center",
                    color: T.textFaint,
                    fontSize: 12,
                  }}
                >
                  No data for selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <HeatLegend />

      {/* Tooltip */}
      {tooltip && <HeatTooltip info={tooltip} />}
    </div>
  );
}
