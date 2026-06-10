// ─── SaveDashboardDialog.tsx ─────────────────────────────────────────────────
// Modal dialog shown when user clicks "Save & View Dashboard".
// Collects dashboard name, validates, checks for duplicates, then saves.

import { useState, useEffect, useRef } from "react";
import { DashboardService } from "@/components/DashboardService";
import type { WidgetConfig, KpiConfig } from "@/hooks/useDashboardConfig";
import type { FilterConfig } from "@/components/DashboardService";

const T = {
  overlay: "rgba(0,0,0,0.45)",
  surface: "var(--db-surface, #ffffff)",
  border: "var(--db-border, #e5e7eb)",
  text: "var(--db-text-primary, #111827)",
  textSec: "var(--db-text-sec, #374151)",
  textMuted: "var(--db-text-muted, #6b7280)",
  textFaint: "var(--db-text-faint, #9ca3af)",
  inputBg: "var(--db-input-bg, #ffffff)",
  surfaceAlt: "var(--db-surface-alt, #f9fafb)",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#10b981",
};

interface SaveDashboardDialogProps {
  userId: string;
  username: string;
  persona: string;
  role: string;
  widgets: WidgetConfig[];
  kpiCards: KpiConfig[];
  filters: FilterConfig[];
  onSaved: (dashboardId: string, dashboardName: string) => void;
  onCancel: () => void;
}

export function SaveDashboardDialog({
  userId,
  username,
  persona,
  role,
  widgets,
  kpiCards,
  filters,
  onSaved,
  onCancel,
}: SaveDashboardDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input when dialog opens
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Dashboard name is required.";
    if (trimmed.length < 2) return "Name must be at least 2 characters.";
    if (trimmed.length > 80) return "Name must be 80 characters or fewer.";
    if (trimmed.toLowerCase() === "default view") {
      return "\"Default View\" is reserved. Please choose a different name.";
    }
    if (DashboardService.nameExists(userId, trimmed)) {
      return `A dashboard named "${trimmed}" already exists. Please choose a different name.`;
    }
    return "";
  }

  function handleSave() {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const saved = DashboardService.save(
        userId,
        username,
        persona,
        role,
        name.trim(),
        widgets,
        kpiCards,
        filters
      );
      onSaved(saved.id, saved.name);
    } catch {
      setError("Failed to save dashboard. Please try again.");
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  }

  return (
    // Overlay
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.overlay,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Dialog box */}
      <div
        style={{
          background: T.surface,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.01em" }}
            >
              Save Dashboard
            </div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
              Give your current layout a name to save it.
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: T.textMuted,
              lineHeight: 1,
              padding: 4,
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary row */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              gap: 16,
              fontSize: 11,
              color: T.textMuted,
            }}
          >
            <span>
              <span style={{ fontWeight: 700, color: T.text }}>
                {widgets.filter((w) => w.checked).length}
              </span>{" "}
              widgets
            </span>
            <span>
              <span style={{ fontWeight: 700, color: T.text }}>
                {kpiCards.filter((k) => k.checked).length}
              </span>{" "}
              KPI cards
            </span>
            <span>
              <span style={{ fontWeight: 700, color: T.text }}>
                {filters.filter((f) => f.checked).length}
              </span>{" "}
              filters
            </span>
          </div>

          {/* Name field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.textSec,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Dashboard Name
              <span style={{ color: T.red, fontSize: 11 }}>*</span>
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. My PMO View, Q3 Planning..."
              maxLength={80}
              style={{
                padding: "9px 12px",
                fontSize: 13,
                border: `1px solid ${error ? T.red : T.border}`,
                borderRadius: 9,
                background: T.inputBg,
                color: T.text,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = T.blue;
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = T.border;
              }}
            />
            {error && (
              <div
                style={{
                  fontSize: 11,
                  color: T.red,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ⚠ {error}
              </div>
            )}
            <div
              style={{ fontSize: 10, color: T.textFaint, textAlign: "right" }}
            >
              {name.trim().length}/80
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px 18px",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              fontSize: 12,
              fontWeight: 600,
              color: T.textSec,
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = T.surfaceAlt;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 22px",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              background: saving
                ? "#93c5fd"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              border: "none",
              borderRadius: 8,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {saving ? "Saving…" : "Save Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}