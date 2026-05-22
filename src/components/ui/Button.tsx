"use client";

import React from "react";

/* ── Button ──────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; border: string; color: string; hoverBg: string; hoverBorder: string }> = {
  primary: {
    bg:         "#0f172a",
    border:     "#0f172a",
    color:      "#ffffff",
    hoverBg:    "#1e293b",
    hoverBorder:"#1e293b",
  },
  secondary: {
    bg:         "#ffffff",
    border:     "rgba(15, 23, 42, 0.15)",
    color:      "#334155",
    hoverBg:    "#f6f8fb",
    hoverBorder:"rgba(15, 23, 42, 0.22)",
  },
  ghost: {
    bg:         "transparent",
    border:     "transparent",
    color:      "#64748b",
    hoverBg:    "rgba(15, 23, 42, 0.05)",
    hoverBorder:"transparent",
  },
  danger: {
    bg:         "#ffffff",
    border:     "rgba(220, 38, 38, 0.25)",
    color:      "#dc2626",
    hoverBg:    "rgba(220, 38, 38, 0.04)",
    hoverBorder:"rgba(220, 38, 38, 0.40)",
  },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; px: number; fontSize: string; gap: number }> = {
  sm: { height: 28, px: 10, fontSize: "11px",  gap: 4  },
  md: { height: 34, px: 14, fontSize: "12px",  gap: 6  },
  lg: { height: 40, px: 18, fontSize: "13px",  gap: 8  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  onClick,
  type = "button",
  className = "",
  style: extraStyle,
  title,
}: ButtonProps) {
  const v  = VARIANT_STYLES[variant];
  const sz = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      className={className}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent:  "center",
        gap:            `${sz.gap}px`,
        height:         `${sz.height}px`,
        padding:        `0 ${sz.px}px`,
        fontSize:       sz.fontSize,
        fontWeight:      500,
        fontFamily:     "var(--font-sans)",
        borderRadius:   "var(--radius-sm, 4px)",
        border:         `1px solid ${isDisabled ? "rgba(15, 23, 42, 0.08)" : v.border}`,
        background:     isDisabled
          ? variant === "primary" ? "#94a3b8" : "#f6f8fb"
          : v.bg,
        color:          isDisabled
          ? variant === "primary" ? "#ffffff" : "#cbd5e1"
          : v.color,
        cursor:          isDisabled ? "not-allowed" : "pointer",
        transition:      "all 120ms var(--ease-default)",
        whiteSpace:      "nowrap",
        letterSpacing:   "0.01em",
        outline:         "none",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = v.hoverBg;
          e.currentTarget.style.borderColor = v.hoverBorder;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = v.bg;
          e.currentTarget.style.borderColor = v.border;
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {loading && (
        <LoadingSpinner size={size === "sm" ? 10 : 12} />
      )}
      {children}
    </button>
  );
}

function LoadingSpinner({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── IconButton ──────────────────────────────────────── */

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "secondary";
  size?: ButtonSize;
  title?: string;
  disabled?: boolean;
}

export function IconButton({ icon, onClick, variant = "ghost", size = "md", title, disabled }: IconButtonProps) {
  const sz = SIZE_STYLES[size];
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent:  "center",
        width:           `${sz.height}px`,
        height:          `${sz.height}px`,
        borderRadius:    "var(--radius-sm, 4px)",
        border:          "1px solid transparent",
        background:      "transparent",
        color:           "#94a3b8",
        cursor:          disabled ? "not-allowed" : "pointer",
        transition:      "all 120ms var(--ease-default)",
        padding:         0,
        flexShrink:      0,
        opacity:         disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.05)";
          e.currentTarget.style.color = "#334155";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      {icon}
    </button>
  );
}

/* ── ButtonGroup ────────────────────────────────────── */

interface ButtonGroupProps {
  children: React.ReactNode;
}

export function ButtonGroup({ children }: ButtonGroupProps) {
  return (
    <div
      style={{
        display:  "inline-flex",
        gap:      "2px",
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}
