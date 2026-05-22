"use client";

import React from "react";

/* ── EmptyState ──────────────────────────────────────── */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "60px 24px",
        textAlign:      "center",
        gap:            "12px",
      }}
    >
      {icon && (
        <div
          style={{
            fontSize:    "36px",
            marginBottom:"4px",
            opacity:     0.5,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize:   "14px",
          fontWeight: 600,
          color:      "#334155",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: "13px",
            color:    "#94a3b8",
            maxWidth: "320px",
            lineHeight: 1.6,
          }}
        >
          {description}
        </div>
      )}
      {action && (
        <div style={{ marginTop: "8px" }}>
          {action}
        </div>
      )}
    </div>
  );
}

/* ── LoadingState ────────────────────────────────────── */

interface LoadingStateProps {
  rows?: number;
  height?: number | string;
  message?: string;
}

export function LoadingState({ rows = 3, height, message }: LoadingStateProps) {
  return (
    <div
      style={{
        padding: height !== undefined ? `${height}px` : "24px",
      }}
    >
      {message && (
        <div
          style={{
            fontSize:   "13px",
            color:      "#94a3b8",
            textAlign:  "center",
            marginBottom: "16px",
          }}
        >
          {message}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} width={i === rows - 1 ? "60%" : "100%"} />
        ))}
      </div>
    </div>
  );
}

function SkeletonRow({ width = "100%" }: { width?: string }) {
  return (
    <div
      style={{
        height:       "14px",
        width,
        borderRadius: "var(--radius-sm, 4px)",
        background:   "linear-gradient(90deg, #f0f3f7 25%, #e8ecf0 50%, #f0f3f7 75%)",
        backgroundSize: "200% 100%",
        animation:    "shimmer 1.5s infinite",
      }}
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

/* ── SkeletonText ───────────────────────────────────── */

interface SkeletonTextProps {
  lines?: number;
  lastWidth?: string;
}

export function SkeletonText({ lines = 3, lastWidth = "60%" }: SkeletonTextProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height:       "12px",
            width:        i === lines - 1 ? lastWidth : "100%",
            borderRadius: "4px",
            background:   "linear-gradient(90deg, #f0f3f7 25%, #e8ecf0 50%, #f0f3f7 75%)",
            backgroundSize: "200% 100%",
            animation:    "shimmer 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

/* ── ErrorState ─────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  details?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  details,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "48px 24px",
        textAlign:      "center",
        gap:            "10px",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "4px" }}>⚠️</div>
      <div
        style={{
          fontSize:   "14px",
          fontWeight: 600,
          color:      "#dc2626",
        }}
      >
        {title}
      </div>
      {message && (
        <div
          style={{
            fontSize:   "13px",
            color:      "#64748b",
            maxWidth:   "360px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </div>
      )}
      {details && (
        <details
          style={{
            marginTop:  "8px",
            padding:    "12px",
            background: "#f8fafc",
            border:     "1px solid rgba(220, 38, 38, 0.10)",
            borderRadius:"8px",
            maxWidth:   "480px",
            width:      "100%",
            textAlign:  "left",
          }}
        >
          <summary
            style={{
              fontSize:  "11px",
              color:     "#94a3b8",
              cursor:    "pointer",
              fontWeight:600,
            }}
          >
            Error details
          </summary>
          <pre
            style={{
              fontSize:    "11px",
              color:       "#64748b",
              fontFamily:  "var(--font-mono)",
              marginTop:   "8px",
              whiteSpace:  "pre-wrap",
              wordBreak:   "break-all",
            }}
          >
            {details}
          </pre>
        </details>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop:   "8px",
            padding:     "7px 16px",
            fontSize:    "12px",
            fontWeight:  500,
            border:      "1px solid rgba(15, 23, 42, 0.15)",
            borderRadius:"var(--radius-sm, 4px)",
            background:  "#ffffff",
            color:       "#334155",
            cursor:      "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f6f8fb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
