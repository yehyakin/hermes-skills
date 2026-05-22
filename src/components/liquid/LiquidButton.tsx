"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "dark" | "light" | "primary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface LiquidButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; border: string; text: string; hoverBg: string; hoverBorder: string }
> = {
  // Default dark glass button
  dark: {
    bg: "rgba(8, 12, 22, 0.48)",
    border: "rgba(148, 163, 184, 0.12)",
    text: "#e2e8f0",
    hoverBg: "rgba(10, 15, 28, 0.72)",
    hoverBorder: "rgba(148, 163, 184, 0.18)",
  },
  // Light frosted button for Menswear Studio
  light: {
    bg: "rgba(255, 255, 255, 0.72)",
    border: "rgba(255, 255, 255, 0.88)",
    text: "#111827",
    hoverBg: "rgba(255, 255, 255, 0.92)",
    hoverBorder: "rgba(255, 255, 255, 1.0)",
  },
  // Primary CTA: cyan accent glow
  primary: {
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(125, 211, 252, 0.28)",
    text: "#e0f2fe",
    hoverBg: "rgba(56, 189, 248, 0.20)",
    hoverBorder: "rgba(125, 211, 252, 0.44)",
  },
  // Danger: red accent for destructive actions
  danger: {
    bg: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.28)",
    text: "#fee2e2",
    hoverBg: "rgba(248, 113, 113, 0.22)",
    hoverBorder: "rgba(248, 113, 113, 0.44)",
  },
  // Ghost: transparent with subtle border
  ghost: {
    bg: "transparent",
    border: "rgba(148, 163, 184, 0.08)",
    text: "#94a3b8",
    hoverBg: "rgba(8, 12, 22, 0.32)",
    hoverBorder: "rgba(148, 163, 184, 0.12)",
  },
};

const SIZE_STYLES: Record<ButtonSize, { padding: string; text: string; radius: string }> = {
  sm: { padding: "px-3 py-1.5", text: "text-xs", radius: "rounded-lg" },
  md: { padding: "px-4 py-2", text: "text-sm", radius: "rounded-xl" },
  lg: { padding: "px-6 py-3", text: "text-base", radius: "rounded-2xl" },
};

export default function LiquidButton({
  variant = "dark",
  size = "md",
  children,
  className = "",
  onClick,
  disabled = false,
  active = false,
  ...rest
}: LiquidButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  const activeBg = active ? v.hoverBg : v.bg;
  const activeBorder = active ? v.hoverBorder : v.border;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${s.padding} ${s.text} ${s.radius}
        font-medium
        transition-all duration-200
        hover:translate-y-[-1px]
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)]
        active:translate-y-[0px]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
      style={{
        background: activeBg,
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        border: `1px solid ${activeBorder}`,
        color: v.text,
        boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
      }}
      {...rest}
    >
      {/* Top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-xl pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        }}
      />
      {children}
    </button>
  );
}
