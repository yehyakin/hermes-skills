"use client";

import React from "react";

/* ── Badge ───────────────────────────────────────────── */

type BadgeColor = "green" | "blue" | "amber" | "red" | "violet" | "slate" | "cyan";

const COLOR_MAP: Record<BadgeColor, { text: string; bg: string; border: string; dot: string }> = {
  green:  { text: "#16a34a", bg: "rgba(22, 163, 74, 0.07)",  border: "rgba(22, 163, 74, 0.18)",  dot: "#16a34a" },
  blue:   { text: "#0284c7", bg: "rgba(2, 132, 199, 0.07)",  border: "rgba(2, 132, 199, 0.18)",  dot: "#0284c7" },
  cyan:   { text: "#0891b2", bg: "rgba(8, 145, 178, 0.07)", border: "rgba(8, 145, 178, 0.18)", dot: "#0891b2" },
  amber:  { text: "#d97706", bg: "rgba(217, 119, 6, 0.07)",  border: "rgba(217, 119, 6, 0.18)",  dot: "#d97706" },
  red:    { text: "#dc2626", bg: "rgba(220, 38, 38, 0.07)", border: "rgba(220, 38, 38, 0.18)", dot: "#dc2626" },
  violet: { text: "#7c3aed", bg: "rgba(124, 58, 237, 0.07)",border: "rgba(124, 58, 237, 0.18)",dot: "#7c3aed" },
  slate:  { text: "#475569", bg: "rgba(71, 85, 105, 0.07)", border: "rgba(71, 85, 105, 0.18)", dot: "#475569" },
};

interface BadgeProps {
  color: BadgeColor;
  label: string;
  dot?: boolean;
  size?: "sm" | "md";
}

export function Badge({ color, label, dot = true, size = "sm" }: BadgeProps) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.slate;

  return (
    <span
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "5px",
        padding:      size === "sm" ? "2px 7px" : "3px 9px",
        fontSize:     size === "sm" ? "11px" : "12px",
        fontWeight:   500,
        fontFamily:   "var(--font-sans)",
        borderRadius: "4px",
        border:       `1px solid ${c.border}`,
        background:   c.bg,
        color:        c.text,
        whiteSpace:   "nowrap",
        letterSpacing: "0.01em",
        lineHeight:   1.4,
      }}
    >
      {dot && (
        <span
          style={{
            width:        "5px",
            height:       "5px",
            borderRadius: "50%",
            background:   c.dot,
            flexShrink:   0,
          }}
        />
      )}
      {label}
    </span>
  );
}

/* ── StatusBadge ────────────────────────────────────── */

// Maps common status strings → Badge props
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  if (s === "completed" || s === "success") return <Badge color="green"  label={status} />;
  if (s === "running" || s === "processing" || s === "external_polling") return <Badge color="cyan"  label={status} />;
  if (s === "pending" || s === "queued" || s === "submitted") return <Badge color="amber"  label={status} />;
  if (s === "failed" || s === "error") return <Badge color="red"  label={status} />;
  if (s === "review" || s === "needs_review" || s === "dry_run" || s === "dry run") return <Badge color="violet" label={status} />;
  if (s === "cancelled" || s === "canceled" || s === "skipped") return <Badge color="slate" label={status} />;

  return <Badge color="slate" label={status} />;
}

/* ── Tag ────────────────────────────────────────────── */

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <span
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "4px",
        padding:      "2px 6px 2px 8px",
        fontSize:     "11px",
        fontWeight:   500,
        borderRadius: "var(--radius-full, 9999px)",
        background:   "#f0f3f7",
        color:        "#475569",
        border:       "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background:  "none",
            border:      "none",
            padding:     0,
            cursor:      "pointer",
            color:       "#94a3b8",
            display:      "flex",
            alignItems:  "center",
            fontSize:    "12px",
            lineHeight:   1,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

/* ── CountBadge ─────────────────────────────────────── */

export function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      style={{
        minWidth:      "18px",
        height:        "18px",
        padding:       "0 5px",
        fontSize:      "10px",
        fontWeight:    600,
        borderRadius: "var(--radius-full, 9999px)",
        background:    "rgba(15, 23, 42, 0.08)",
        color:        "#64748b",
        display:      "inline-flex",
        alignItems:   "center",
        justifyContent:"center",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
