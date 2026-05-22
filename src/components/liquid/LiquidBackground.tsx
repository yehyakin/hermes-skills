"use client";

import { ReactNode } from "react";

type BackgroundMode = "dark" | "light";

interface LiquidBackgroundProps {
  mode?: BackgroundMode;
  children: ReactNode;
  className?: string;
}

const DARK_STYLES = {
  bg: "#05070a",
  aurora: `
    radial-gradient(circle at 18% 14%, rgba(56,189,248,0.12) 0%, transparent 34%),
    radial-gradient(circle at 82% 16%, rgba(167,139,250,0.12) 0%, transparent 36%),
    radial-gradient(circle at 56% 92%, rgba(244,114,182,0.06) 0%, transparent 42%),
    linear-gradient(135deg, #05070a 0%, #07111f 46%, #05070a 100%)
  `,
  grid: `
    linear-gradient(rgba(148,163,184,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,0.035) 1px, transparent 1px)
  `,
  gridSize: "72px 72px",
  gridOpacity: 0.35,
};

const LIGHT_STYLES = {
  bg: "#eef3f6",
  aurora: `
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,255,255,0.80) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 30%, rgba(37,99,235,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 40% 50% at 50% 80%, rgba(139,92,246,0.04) 0%, transparent 70%)
  `,
  grid: `
    linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)
  `,
  gridSize: "72px 72px",
  gridOpacity: 0.5,
};

export default function LiquidBackground({
  mode = "dark",
  children,
  className = "",
}: LiquidBackgroundProps) {
  const s = mode === "dark" ? DARK_STYLES : LIGHT_STYLES;

  return (
    <div
      className={`relative ${className}`}
      style={{ background: s.bg }}
    >
      {/* Aurora glow layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: s.aurora }}
      />

      {/* Grid with radial mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: s.gridOpacity,
          backgroundImage: s.grid,
          backgroundSize: s.gridSize,
          maskImage:
            mode === "dark"
              ? "radial-gradient(circle at 50% 45%, black, transparent 76%)"
              : undefined,
          WebkitMaskImage:
            mode === "dark"
              ? "radial-gradient(circle at 50% 45%, black, transparent 76%)"
              : undefined,
        }}
      />

      {/* Bottom ambient glow for dark mode */}
      {mode === "dark" && (
        <div
          className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(125,211,252,0.06) 0%, transparent 100%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
