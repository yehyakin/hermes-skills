"use client";

import React from "react";

/* ── MetricCard ─────────────────────────────────────── */

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "green" | "blue" | "amber" | "red" | "violet";
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  color = "default",
  icon,
}: MetricCardProps) {
  const VALUE_COLORS = {
    default: "#0f172a",
    green:  "#16a34a",
    blue:   "#0284c7",
    amber:  "#d97706",
    red:    "#dc2626",
    violet: "#7c3aed",
  };

  const TREND_COLORS = {
    up:      "#16a34a",
    down:    "#dc2626",
    neutral: "#94a3b8",
  };

  return (
    <div
      style={{
        background:    "#ffffff",
        border:        "1px solid rgba(15, 23, 42, 0.07)",
        borderRadius:  "12px",
        boxShadow:     "0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        padding:      "20px",
        display:      "flex",
        flexDirection:"column",
        gap:           "8px",
        minWidth:      0,
      }}
    >
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize:   "12px",
            fontWeight: 600,
            color:      "#94a3b8",
            textTransform: "uppercase",
            letterSpacing:"0.05em",
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              color:      "#cbd5e1",
              display:    "flex",
              alignItems: "center",
              fontSize:   "16px",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div
        style={{
          display:    "flex",
          alignItems: "baseline",
          gap:        "8px",
          flexWrap:   "wrap",
        }}
      >
        <span
          style={{
            fontSize:   "28px",
            fontWeight: 700,
            color:      VALUE_COLORS[color],
            lineHeight: 1.1,
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {trendValue && trend && (
          <span
            style={{
              fontSize:    "12px",
              fontWeight:  500,
              color:       TREND_COLORS[trend],
              display:     "flex",
              alignItems:  "center",
              gap:         "2px",
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>

      {sub && (
        <span
          style={{
            fontSize: "12px",
            color:    "#94a3b8",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

/* ── MetricGrid ─────────────────────────────────────── */

interface MetricGridProps {
  children: React.ReactNode;
  columns?: number;
}

export function MetricGrid({ children, columns = 4 }: MetricGridProps) {
  return (
    <div
      style={{
        display:               "grid",
        gridTemplateColumns:   `repeat(${columns}, minmax(0, 1fr))`,
        gap:                   "12px",
      }}
    >
      {children}
    </div>
  );
}
