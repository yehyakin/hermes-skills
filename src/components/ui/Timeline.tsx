"use client";

import React from "react";

/* ── Timeline ───────────────────────────────────────── */

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  description?: string;
  status?: "success" | "info" | "warning" | "error" | "neutral";
  duration?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  compact?: boolean;
}

export function Timeline({ events, compact = false }: TimelineProps) {
  const STATUS_COLORS = {
    success: { dot: "#16a34a", line: "rgba(22, 163, 74, 0.2)" },
    info:    { dot: "#0284c7", line: "rgba(2, 132, 199, 0.2)" },
    warning: { dot: "#d97706", line: "rgba(217, 119, 6, 0.2)" },
    error:   { dot: "#dc2626", line: "rgba(220, 38, 38, 0.2)" },
    neutral: { dot: "#94a3b8", line: "rgba(148, 163, 184, 0.2)" },
  };

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        gap:            0,
      }}
    >
      {events.map((event, idx) => {
        const color = STATUS_COLORS[event.status ?? "neutral"];
        const isLast = idx === events.length - 1;

        return (
          <div
            key={event.id}
            style={{
              display:   "flex",
              gap:       "12px",
              paddingLeft: compact ? "0" : "0",
              position:  "relative",
            }}
          >
            {/* Line + dot */}
            <div
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                width:          "16px",
                flexShrink:     0,
              }}
            >
              {!isLast && (
                <div
                  style={{
                    width:        "1px",
                    flex:         1,
                    background:   color.line,
                    minHeight:    compact ? "16px" : "20px",
                  }}
                />
              )}
              <div
                style={{
                  width:        "8px",
                  height:       "8px",
                  borderRadius: "50%",
                  background:   color.dot,
                  flexShrink:   0,
                  marginTop:    compact ? "4px" : "6px",
                  boxShadow:    `0 0 0 3px ${color.dot}18`,
                }}
              />
              {isLast && (
                <div
                  style={{
                    width:        "1px",
                    flex:         1,
                    background:   "rgba(15, 23, 42, 0.05)",
                    minHeight:    "20px",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                flex:          1,
                paddingBottom: compact ? "12px" : "16px",
                minWidth:      0,
              }}
            >
              <div
                style={{
                  display:    "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap:        "8px",
                  flexWrap:   "wrap",
                }}
              >
                <span
                  style={{
                    fontSize:   compact ? "12px" : "13px",
                    fontWeight: 600,
                    color:      "#0f172a",
                  }}
                >
                  {event.label}
                </span>
                <span
                  style={{
                    fontSize:    "11px",
                    color:       "#94a3b8",
                    fontFamily:  "var(--font-mono)",
                    flexShrink:  0,
                  }}
                >
                  {event.time}
                </span>
              </div>
              {event.description && (
                <div
                  style={{
                    fontSize:   compact ? "11px" : "12px",
                    color:      "#64748b",
                    marginTop:  "2px",
                    lineHeight: 1.5,
                  }}
                >
                  {event.description}
                </div>
              )}
              {event.duration && (
                <span
                  style={{
                    fontSize:  "11px",
                    color:     "#94a3b8",
                    fontFamily:"var(--font-mono)",
                  }}
                >
                  {event.duration}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── TimelineCollapsible ────────────────────────────── */

interface TimelineCollapsibleProps {
  events: TimelineEvent[];
  maxVisible?: number;
}

export function TimelineCollapsible({ events, maxVisible = 5 }: TimelineCollapsibleProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (events.length <= maxVisible) {
    return <Timeline events={events} />;
  }

  const visible = expanded ? events : events.slice(0, maxVisible);

  return (
    <div>
      <Timeline events={visible} />
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background:  "none",
          border:      "none",
          padding:     "8px 0",
          fontSize:    "12px",
          color:       "#64748b",
          cursor:      "pointer",
          fontWeight:  500,
        }}
      >
        {expanded ? "Show less" : `Show all ${events.length} events`} ›
      </button>
    </div>
  );
}
