"use client";

import { ReactNode } from "react";

type ShellMode = "dark" | "light";

interface LiquidShellProps {
  mode?: ShellMode;
  children: ReactNode;
  className?: string;
}

// Sub-components for future extensibility
LiquidShell.TopBar = function TopBar({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full flex items-center px-5 gap-6 ${className}`}
      style={{
        background: "rgba(5, 7, 14, 0.72)",
        backdropFilter: "blur(26px) saturate(160%)",
        WebkitBackdropFilter: "blur(26px) saturate(160%)",
        borderBottom: "1px solid rgba(148,163,184,0.10)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
      }}
    >
      {children}
    </div>
  );
};

LiquidShell.Rail = function Rail({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center py-4 gap-2 ${className}`}
      style={{
        background: "rgba(5, 7, 14, 0.72)",
        backdropFilter: "blur(26px) saturate(160%)",
        WebkitBackdropFilter: "blur(26px) saturate(160%)",
        borderRight: "1px solid rgba(148,163,184,0.10)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
      }}
    >
      {children}
    </div>
  );
};

LiquidShell.Sidebar = function Sidebar({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 p-3 ${className}`}
      style={{
        background: "rgba(8, 12, 22, 0.58)",
        backdropFilter: "blur(26px) saturate(160%)",
        WebkitBackdropFilter: "blur(26px) saturate(160%)",
        border: "1px solid rgba(148,163,184,0.12)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.60)",
      }}
    >
      {children}
    </div>
  );
};

LiquidShell.Main = function Main({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 overflow-auto ${className}`}>
      {children}
    </div>
  );
};

export default function LiquidShell({
  mode = "dark",
  children,
  className = "",
}: LiquidShellProps) {
  return (
    <div
      className={`relative flex flex-col ${className}`}
      style={{
        background: mode === "dark" ? "#05070a" : "#eef3f6",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
