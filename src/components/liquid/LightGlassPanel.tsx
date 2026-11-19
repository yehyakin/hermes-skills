"use client";

import { ReactNode } from "react";
import LiquidGlass from "liquid-glass-react";
import styles from "./LightGlassPanel.module.css";

// ─── DESIGN.md token-aligned Light Liquid Glass Panel ─────────────────────────
// Powered by liquid-glass-react (iOS 26 physics-based refraction)
// External API unchanged — drop-in replacement for the old CSS-blur version
//
// DESIGN.md ref: components.glass-panel
//   background: rgba(255,255,255,0.72)
//   backdropFilter: blur(28px) saturate(160%)
//   borderRadius: 16px
//   boxShadow: 0 24px 80px rgba(15,23,42,0.08), inset highlights

type PanelVariant = "chrome" | "dark" | "panel" | "light" | "lightStrong" | "subtle" | "strong";
type Intensity = "low" | "medium" | "high";

interface LightGlassPanelProps {
  title?: string;
  rightElement?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: PanelVariant;   // backward compat with LiquidPanel
  intensity?: Intensity;     // backward compat (maps to blur/displacement scale)
  interactive?: boolean;     // backward compat (ignored in light theme)
  selected?: boolean;        // backward compat (ignored in light theme)
}

// Map dark LiquidPanel variants → light theme equivalents
const VARIANT_BASE = {
  chrome:   { blur: 0.06, scale: 60, sat: 160 },
  dark:     { blur: 0.04, scale: 50, sat: 150 },
  panel:    { blur: 0.04, scale: 50, sat: 150 },
  light:    { blur: 0.03, scale: 40, sat: 140 },
  lightStrong: { blur: 0.05, scale: 55, sat: 155 },
  subtle:   { blur: 0.02, scale: 25, sat: 120 },
  strong:   { blur: 0.05, scale: 55, sat: 155 },
};

// Intensity multiplies the variant's values
const INTENSITY_MULT = {
  low:    { blur: 0.7, scale: 0.7, sat: 0.9 },
  medium: { blur: 1.0, scale: 1.0, sat: 1.0 },
  high:   { blur: 1.3, scale: 1.3, sat: 1.1 },
};

const HEADER_TOKENS = {
  borderBottom: "1px solid rgba(15,23,42,0.07)",
  font: {
    fontSize: "13px",
    fontWeight: 600 as const,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
} as const;

export function LightGlassPanel({
  title,
  rightElement,
  children,
  style,
  className = "",
  variant = "panel",
  intensity = "medium",
}: LightGlassPanelProps) {
  const vb = VARIANT_BASE[variant] ?? VARIANT_BASE.panel;
  const im = INTENSITY_MULT[intensity] ?? INTENSITY_MULT.medium;
  return (
    <div className={`${styles.surface} ${className}`} style={style}>
      <LiquidGlass
        className={styles.panel}
        padding="0"
        blurAmount={vb.blur * im.blur}
        displacementScale={vb.scale * im.scale}
        saturation={vb.sat * im.sat}
        elasticity={0.15}
        cornerRadius={16}
        overLight
        mode="standard"
        style={{ overflow: "hidden" }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: HEADER_TOKENS.borderBottom,
            }}
          >
            <span style={HEADER_TOKENS.font}>{title}</span>
            {rightElement}
          </div>
        )}
        <div>{children}</div>
      </LiquidGlass>
    </div>
  );
}

// ─── Nested card (inside glass panels) ────────────────────────────────────────
// DESIGN.md: components.glass-card
// Lighter liquid glass for nested content — less blur, more transparent

interface GlassCardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function GlassCard({ children, style, onClick }: GlassCardProps) {
  return (
    <div className={styles.surface} style={style} onClick={onClick}>
      <LiquidGlass
        className={styles.panel}
        padding="0"
        blurAmount={0.02}
        displacementScale={25}
        saturation={120}
        elasticity={0.1}
        cornerRadius={10}
        overLight
        mode="standard"
      >
        <div style={{ padding: "10px 12px" }}>{children}</div>
      </LiquidGlass>
    </div>
  );
}
