"use client";

import { ReactNode } from "react";

type DockMode = "dark" | "light";

interface DockItem {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}

interface LiquidDockProps {
  items: DockItem[];
  mode?: DockMode;
  className?: string;
}

const DOCK_STYLES: Record<
  DockMode,
  {
    container: { bg: string; border: string; shadow: string };
    item: { default: { bg: string; border: string; text: string } };
    itemActive: { bg: string; border: string; text: string };
    itemDanger: { bg: string; border: string; text: string };
  }
> = {
  dark: {
    container: {
      bg: "rgba(8, 12, 22, 0.68)",
      border: "rgba(148, 163, 184, 0.14)",
      shadow:
        "0 24px 80px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(255,255,255,0.03)",
    },
    item: {
      default: {
        bg: "rgba(8, 12, 22, 0.48)",
        border: "rgba(148, 163, 184, 0.12)",
        text: "#e2e8f0",
      },
    },
    itemActive: {
      bg: "rgba(56, 189, 248, 0.12)",
      border: "rgba(125, 211, 252, 0.36)",
      text: "#7dd3fc",
    },
    itemDanger: {
      bg: "rgba(248, 113, 113, 0.12)",
      border: "rgba(248, 113, 113, 0.28)",
      text: "#f87171",
    },
  },
  light: {
    container: {
      bg: "rgba(255, 255, 255, 0.72)",
      border: "rgba(255, 255, 255, 0.90)",
      shadow:
        "0 24px 80px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(255,255,255,0.40)",
    },
    item: {
      default: {
        bg: "rgba(255, 255, 255, 0.60)",
        border: "rgba(255, 255, 255, 0.80)",
        text: "#374151",
      },
    },
    itemActive: {
      bg: "rgba(37, 99, 235, 0.10)",
      border: "rgba(37, 99, 235, 0.28)",
      text: "#3b82f6",
    },
    itemDanger: {
      bg: "rgba(239, 68, 68, 0.10)",
      border: "rgba(239, 68, 68, 0.28)",
      text: "#ef4444",
    },
  },
};

export default function LiquidDock({
  items,
  mode = "dark",
  className = "",
}: LiquidDockProps) {
  const s = DOCK_STYLES[mode];

  return (
    <div
      className={`flex items-center justify-center gap-3 p-3 rounded-2xl ${className}`}
      style={{
        background: s.container.bg,
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: `1px solid ${s.container.border}`,
        boxShadow: s.container.shadow,
      }}
    >
      {items.map((item, i) => {
        const isActive = item.active;
        const isDanger = item.danger;

        const itemBg = isActive
          ? s.itemActive.bg
          : isDanger
          ? s.itemDanger.bg
          : s.item.default.bg;
        const itemBorder = isActive
          ? s.itemActive.border
          : isDanger
          ? s.itemDanger.border
          : s.item.default.border;
        const itemText = isActive
          ? s.itemActive.text
          : isDanger
          ? s.itemDanger.text
          : s.item.default.text;

        return (
          <button
            key={i}
            onClick={item.onClick}
            className="
              flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl
              transition-all duration-200 ease-out
              hover:translate-y-[-2px] hover:scale-[1.04]
              active:translate-y-[0px] active:scale-[0.98]
            "
            style={{
              background: itemBg,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${itemBorder}`,
              boxShadow: isActive
                ? "0 8px 32px rgba(56,189,248,0.20), inset 0 1px 0 rgba(255,255,255,0.16)"
                : "0 4px 16px rgba(0,0,0,0.16)",
              color: itemText,
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium opacity-80">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
