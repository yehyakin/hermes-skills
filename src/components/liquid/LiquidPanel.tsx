"use client";

import { ReactNode } from "react";

type LiquidPanelVariant =
  | "dark"
  | "panel"
  | "chrome"
  | "strong"
  | "light"
  | "lightStrong"
  | "subtle";

type Intensity = "low" | "medium" | "high";

interface LiquidPanelProps {
  variant?: LiquidPanelVariant;
  intensity?: Intensity;
  interactive?: boolean;
  selected?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Variant base styles (approved v4 material values) ────────────────────────

const VARIANT_STYLES: Record<
  LiquidPanelVariant,
  { bg: string; border: string; shadow: string; highlight: string }
> = {
  // Dark: base dark glass for sidebar, stats, secondary panels
  dark: {
    bg: "rgba(8, 12, 22, 0.58)",
    border: "rgba(148, 163, 184, 0.12)",
    shadow:
      "0 28px 90px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.05)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, transparent 100%)",
  },
  // Panel: main content panels, cards
  panel: {
    bg: "rgba(10, 15, 28, 0.64)",
    border: "rgba(148, 163, 184, 0.14)",
    shadow:
      "0 32px 110px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.06)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)",
  },
  // Chrome / Strong: top bar, inspector, active panels
  chrome: {
    bg: "rgba(5, 7, 14, 0.72)",
    border: "rgba(148, 163, 184, 0.10)",
    shadow:
      "0 36px 130px rgba(0,0,0,0.58), 0 0 0 1px rgba(125,211,252,0.08), inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(255,255,255,0.08)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
  },
  // Strong: alias for chrome (same material, different semantic name)
  strong: {
    bg: "rgba(5, 7, 14, 0.72)",
    border: "rgba(148, 163, 184, 0.10)",
    shadow:
      "0 36px 130px rgba(0,0,0,0.58), 0 0 0 1px rgba(125,211,252,0.08), inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(255,255,255,0.08)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
  },
  // Light: Menswear Studio content panels
  light: {
    bg: "rgba(255, 255, 255, 0.68)",
    border: "rgba(255, 255, 255, 0.82)",
    shadow:
      "0 30px 90px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(255,255,255,0.34)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.30) 100%)",
  },
  // LightStrong: active/selected light panels
  lightStrong: {
    bg: "rgba(255, 255, 255, 0.84)",
    border: "rgba(255, 255, 255, 0.92)",
    shadow:
      "0 32px 100px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(255,255,255,0.40)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.50) 100%)",
  },
  // Subtle: low-key panels, dividers
  subtle: {
    bg: "rgba(8, 12, 22, 0.32)",
    border: "rgba(148, 163, 184, 0.06)",
    shadow: "0 8px 32px rgba(0,0,0,0.30)",
    highlight:
      "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
  },
};

// Intensity overrides alpha for dark/panel/chrome/strong variants
const INTENSITY_ALPHA: Record<
  Intensity,
  Record<LiquidPanelVariant, { bg: string; border: string }>
> = {
  low: {
    dark: { bg: "rgba(8, 12, 22, 0.36)", border: "rgba(148,163,184,0.08)" },
    panel: { bg: "rgba(10, 15, 28, 0.40)", border: "rgba(148,163,184,0.10)" },
    chrome: { bg: "rgba(5, 7, 14, 0.50)", border: "rgba(148,163,184,0.06)" },
    strong: { bg: "rgba(5, 7, 14, 0.50)", border: "rgba(148,163,184,0.06)" },
    light: { bg: "rgba(255,255,255,0.48)", border: "rgba(255,255,255,0.52)" },
    lightStrong: {
      bg: "rgba(255,255,255,0.64)",
      border: "rgba(255,255,255,0.72)",
    },
    subtle: {
      bg: "rgba(8, 12, 22, 0.20)",
      border: "rgba(148,163,184,0.04)",
    },
  },
  medium: {
    dark: { bg: "rgba(8, 12, 22, 0.58)", border: "rgba(148,163,184,0.12)" },
    panel: { bg: "rgba(10, 15, 28, 0.64)", border: "rgba(148,163,184,0.14)" },
    chrome: { bg: "rgba(5, 7, 14, 0.72)", border: "rgba(148,163,184,0.10)" },
    strong: { bg: "rgba(5, 7, 14, 0.72)", border: "rgba(148,163,184,0.10)" },
    light: { bg: "rgba(255,255,255,0.68)", border: "rgba(255,255,255,0.72)" },
    lightStrong: {
      bg: "rgba(255,255,255,0.84)",
      border: "rgba(255,255,255,0.92)",
    },
    subtle: {
      bg: "rgba(8, 12, 22, 0.32)",
      border: "rgba(148,163,184,0.06)",
    },
  },
  high: {
    dark: { bg: "rgba(8, 12, 22, 0.78)", border: "rgba(148,163,184,0.18)" },
    panel: { bg: "rgba(10, 15, 28, 0.82)", border: "rgba(148,163,184,0.20)" },
    chrome: { bg: "rgba(5, 7, 14, 0.88)", border: "rgba(148,163,184,0.16)" },
    strong: { bg: "rgba(5, 7, 14, 0.88)", border: "rgba(148,163,184,0.16)" },
    light: { bg: "rgba(255,255,255,0.84)", border: "rgba(255,255,255,0.90)" },
    lightStrong: {
      bg: "rgba(255,255,255,0.96)",
      border: "rgba(255,255,255,0.98)",
    },
    subtle: {
      bg: "rgba(8, 12, 22, 0.48)",
      border: "rgba(148,163,184,0.10)",
    },
  },
};

// Variants that support intensity alpha overrides
const INTENSITY_VARIANTS: LiquidPanelVariant[] = [
  "dark",
  "panel",
  "chrome",
  "strong",
  "light",
  "lightStrong",
  "subtle",
];

export default function LiquidPanel({
  variant = "dark",
  intensity = "medium",
  interactive = false,
  selected = false,
  children,
  className = "",
  style,
}: LiquidPanelProps) {
  const base = VARIANT_STYLES[variant];
  const alpha = INTENSITY_ALPHA[intensity][variant];
  const supportsIntensity = INTENSITY_VARIANTS.includes(variant);

  const activeBg = supportsIntensity ? alpha.bg : base.bg;
  const activeBorder = supportsIntensity ? alpha.border : base.border;

  const interactiveStyle = interactive
    ? "cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_32px_100px_rgba(0,0,0,0.40),inset_0_1px_1px_rgba(255,255,255,0.36),inset_0_-1px_1px_rgba(255,255,255,0.08)]"
    : "";

  const selectedStyle = selected
    ? "shadow-[0_32px_100px_rgba(0,0,0,0.48),inset_0_1px_1px_rgba(255,255,255,0.40),inset_0_-1px_1px_rgba(255,255,255,0.12)] ring-1 ring-[rgba(255,255,255,0.24)]"
    : "";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${interactiveStyle} ${selectedStyle} ${className}`}
      style={{
        background: activeBg,
        backdropFilter: "blur(26px) saturate(160%)",
        WebkitBackdropFilter: "blur(26px) saturate(160%)",
        border: `1px solid ${activeBorder}`,
        boxShadow: base.shadow,
        ...style,
      }}
    >
      {/* Inset top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
      />
      {/* Reflection layer — pointer-events-none so clicks pass through */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: base.highlight }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
