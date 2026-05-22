"use client";

type BadgeTone = "green" | "cyan" | "violet" | "amber" | "red" | "slate";
type BadgeSize = "sm" | "md";

interface LiquidBadgeProps {
  tone: BadgeTone;
  size?: BadgeSize;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const TONE_CONFIG: Record<
  BadgeTone,
  { bg: string; border: string; text: string; dot: string }
> = {
  green: {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.24)",
    text: "#4ade80",
    dot: "#22c55e",
  },
  cyan: {
    bg: "rgba(125, 211, 252, 0.12)",
    border: "rgba(125, 211, 252, 0.24)",
    text: "#7dd3fc",
    dot: "#0ea5e9",
  },
  violet: {
    bg: "rgba(167, 139, 250, 0.12)",
    border: "rgba(167, 139, 250, 0.24)",
    text: "#a78bfa",
    dot: "#8b5cf6",
  },
  amber: {
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.24)",
    text: "#fbbf24",
    dot: "#f59e0b",
  },
  red: {
    bg: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.24)",
    text: "#f87171",
    dot: "#ef4444",
  },
  slate: {
    bg: "rgba(100, 116, 139, 0.12)",
    border: "rgba(100, 116, 139, 0.20)",
    text: "#94a3b8",
    dot: "#64748b",
  },
};

export default function LiquidBadge({
  tone,
  size = "md",
  label,
  pulse = false,
  className = "",
}: LiquidBadgeProps) {
  const config = TONE_CONFIG[tone];
  const isSmall = size === "sm";

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      } rounded-full ${className}`}
      style={{
        background: config.bg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      {/* Optional pulsing dot */}
      {pulse && (
        <span
          className={`rounded-full ${
            isSmall ? "w-1.5 h-1.5" : "w-2 h-2"
          } ${pulse ? "animate-pulse" : ""}`}
          style={{ background: config.dot, boxShadow: `0 0 6px ${config.dot}` }}
        />
      )}
      {label}
    </div>
  );
}
