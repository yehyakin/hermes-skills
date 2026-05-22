"use client";

import React from "react";

/* ── Panel ─────────────────────────────────────────────── */

type PanelVariant = "default" | "subtle" | "elevated" | "danger";

interface PanelProps {
  children: React.ReactNode;
  variant?: PanelVariant;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
}

export function Panel({
  children,
  variant = "default",
  className = "",
  padding = true,
  style: extraStyle,
}: PanelProps) {
  const base: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.07)",
    borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
    ...extraStyle,
  };

  if (variant === "subtle") {
    base.background = "#f6f8fb";
    base.border = "1px solid rgba(15, 23, 42, 0.06)";
    base.boxShadow = "none";
  }

  if (variant === "elevated") {
    base.boxShadow = "0 8px 32px rgba(15, 23, 42, 0.10)";
  }

  if (variant === "danger") {
    base.border = "1px solid rgba(220, 38, 38, 0.20)";
    base.background = "rgba(220, 38, 38, 0.02)";
  }

  return (
    <div
      className={className}
      style={{
        ...base,
        padding: padding ? "var(--space-5, 20px)" : 0,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section ──────────────────────────────────────────── */

interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Section({ title, description, action, children, noPadding }: SectionProps) {
  return (
    <Panel padding={false}>
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginTop: "2px",
                }}
              >
                {description}
              </div>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : undefined }}>
        {children}
      </div>
    </Panel>
  );
}

/* ── Divider ──────────────────────────────────────────── */

export function Divider({ label }: { label?: string }) {
  if (label) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "4px 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "rgba(15, 23, 42, 0.06)" }} />
        <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ flex: 1, height: "1px", background: "rgba(15, 23, 42, 0.06)" }} />
      </div>
    );
  }
  return <div style={{ height: "1px", background: "rgba(15, 23, 42, 0.06)", margin: "4px 0" }} />;
}

/* ── SubtleRow ────────────────────────────────────────── */

interface SubtleRowProps {
  label: string;
  value?: string | React.ReactNode;
  mono?: boolean;
}

export function SubtleRow({ label, value, mono }: SubtleRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid rgba(15, 23, 42, 0.04)",
      }}
    >
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{label}</span>
      <span
        style={{
          fontSize: "12px",
          color: "#334155",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          wordBreak: "break-all",
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
