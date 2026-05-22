"use client";

import React from "react";

// ─── DESIGN.md token-aligned Status Pill ──────────────────────────────────────
// DESIGN.md ref: components.status-pill
//   borderRadius: pill (9999px)
//   fontSize: caption-strong (12px / 600)
//   padding: 2px 10px
//   Colors: DESIGN.md status-{color} tokens

type StatusColor = "green" | "cyan" | "amber" | "red" | "violet" | "slate";

const COLOR_MAP: Record<StatusColor, { text: string; bg: string }> = {
  green:  { text: "#22c55e", bg: "rgba(34, 197, 94, 0.10)" },
  cyan:   { text: "#0891b2", bg: "rgba(8, 145, 178, 0.10)" },
  amber:  { text: "#d97706", bg: "rgba(217, 119, 6, 0.10)" },
  red:    { text: "#dc2626", bg: "rgba(220, 38, 38, 0.10)" },
  violet: { text: "#8b5cf6", bg: "rgba(139, 92, 246, 0.10)" },
  slate:  { text: "#94a3b8", bg: "rgba(148, 163, 184, 0.10)" },
};

interface StatusPillProps {
  type: StatusColor;
  label: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ type, label }) => {
  const cfg = COLOR_MAP[type] ?? COLOR_MAP.slate;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "system-ui, -apple-system, sans-serif",
        borderRadius: "9999px",
        color: cfg.text,
        backgroundColor: cfg.bg,
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </span>
  );
};

export default StatusPill;
