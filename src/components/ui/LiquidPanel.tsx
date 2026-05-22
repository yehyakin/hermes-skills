"use client";

import LiquidGlassCmp from "liquid-glass-react";
import { ReactNode } from "react";

type Variant = "panel" | "sidebar" | "modal" | "pill" | "inspector" | "command";

interface LiquidPanelProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<Variant, {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  elasticity: number;
  cornerRadius: number;
}> = {
  panel: {
    displacementScale: 32,
    blurAmount: 0.07,
    saturation: 145,
    aberrationIntensity: 1.2,
    elasticity: 0.08,
    cornerRadius: 24,
  },
  sidebar: {
    displacementScale: 26,
    blurAmount: 0.08,
    saturation: 150,
    aberrationIntensity: 1,
    elasticity: 0.1,
    cornerRadius: 28,
  },
  modal: {
    displacementScale: 42,
    blurAmount: 0.09,
    saturation: 160,
    aberrationIntensity: 1.4,
    elasticity: 0.14,
    cornerRadius: 32,
  },
  pill: {
    displacementScale: 18,
    blurAmount: 0.06,
    saturation: 140,
    aberrationIntensity: 0.8,
    elasticity: 0.12,
    cornerRadius: 999,
  },
  inspector: {
    displacementScale: 28,
    blurAmount: 0.07,
    saturation: 145,
    aberrationIntensity: 1.1,
    elasticity: 0.09,
    cornerRadius: 20,
  },
  command: {
    displacementScale: 36,
    blurAmount: 0.08,
    saturation: 155,
    aberrationIntensity: 1.3,
    elasticity: 0.11,
    cornerRadius: 18,
  },
};

const CSS_FALLBACK: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.72)",
};

export default function LiquidPanel({
  variant = "panel",
  children,
  className = "",
  disabled = false,
}: LiquidPanelProps) {
  const style = VARIANT_STYLES[variant];

  if (disabled) {
    return (
      <div className={className} style={CSS_FALLBACK}>
        {children}
      </div>
    );
  }

  return (
    <LiquidGlassCmp className={className} {...style}>
      {children}
    </LiquidGlassCmp>
  );
}
