"use client";

import React from "react";

/* ── InspectorPanel ─────────────────────────────────── */

interface InspectorPanelProps {
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  actions?: React.ReactNode;
  collapsible?: boolean;
}

export function InspectorPanel({
  title,
  children,
  width = 320,
  actions,
  collapsible = false,
}: InspectorPanelProps) {
  const [open, setOpen] = React.useState(true);

  return (
    <div
      style={{
        width:       typeof width === "number" ? `${width}px` : width,
        flexShrink:  0,
        background:  "#ffffff",
        border:      "1px solid rgba(15, 23, 42, 0.07)",
        borderRadius:"12px",
        boxShadow:   "0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        display:     "flex",
        flexDirection:"column",
        overflow:    "hidden",
        height:      "fit-content",
        maxHeight:   "calc(100vh - 140px)",
      }}
    >
      {title && (
        <div
          style={{
            display:     "flex",
            alignItems:  "center",
            justifyContent: "space-between",
            padding:     "14px 16px",
            borderBottom:"1px solid rgba(15, 23, 42, 0.06)",
            flexShrink:  0,
          }}
        >
          <div
            style={{
              fontSize:   "12px",
              fontWeight:  600,
              color:      "#0f172a",
              textTransform: "uppercase",
              letterSpacing:"0.05em",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {actions}
            {collapsible && (
              <button
                onClick={() => setOpen(!open)}
                style={{
                  background:  "none",
                  border:      "none",
                  cursor:      "pointer",
                  color:       "#94a3b8",
                  fontSize:    "14px",
                  padding:     "2px 4px",
                  display:     "flex",
                  alignItems:  "center",
                }}
              >
                {open ? "▲" : "▼"}
              </button>
            )}
          </div>
        </div>
      )}
      {open && (
        <div
          style={{
            overflowY:  "auto",
            flex:       1,
            padding:    "12px 16px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ── InspectorSection ───────────────────────────────── */

interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function InspectorSection({ title, children, defaultOpen = true }: InspectorSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div style={{ marginBottom: "4px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display:      "flex",
          alignItems:   "center",
          justifyContent:"space-between",
          width:        "100%",
          background:   "none",
          border:       "none",
          padding:      "6px 0",
          cursor:       "pointer",
          borderBottom: "1px solid rgba(15, 23, 42, 0.05)",
          marginBottom: open ? "8px" : 0,
        }}
      >
        <span
          style={{
            fontSize:   "11px",
            fontWeight:  600,
            color:      "#94a3b8",
            textTransform:"uppercase",
            letterSpacing:"0.06em",
          }}
        >
          {title}
        </span>
        <span style={{ color: "#cbd5e1", fontSize: "10px", transition: "transform 150ms" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && children}
    </div>
  );
}

/* ── InspectorRow ──────────────────────────────────── */

interface InspectorRowProps {
  label: string;
  value?: string | React.ReactNode;
  mono?: boolean;
  warning?: boolean;
}

export function InspectorRow({ label, value, mono, warning }: InspectorRowProps) {
  return (
    <div
      style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
        padding:        "5px 0",
        borderBottom:   "1px solid rgba(15, 23, 42, 0.04)",
        gap:            "12px",
      }}
    >
      <span
        style={{
          fontSize:   "12px",
          color:      "#94a3b8",
          flexShrink: 0,
          minWidth:   "90px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize:     "12px",
          color:        warning ? "#d97706" : "#334155",
          fontFamily:   mono ? "var(--font-mono)" : undefined,
          wordBreak:    "break-all",
          textAlign:    "right",
          fontWeight:   mono ? 500 : 400,
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
