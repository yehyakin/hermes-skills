"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Navigation items ──────────────────────────────── */

const NAV_ITEMS = [
  { label: "总览",       href: "/",              icon: "◈" },
  { label: "任务",       href: "/tasks",         icon: "⚡" },
  { label: "智能体",     href: "/agents",         icon: "◉" },
  { label: "男装工作流",  href: "/menswear",      icon: "▣" },
  { label: "素材库",     href: "/assets",         icon: "◫" },
  { label: "日志",       href: "/logs",           icon: "≡" },
  { label: "风险确认",   href: "/risks",          icon: "△" },
  { label: "通信",       href: "/codex-hermes",   icon: "◇" },
];

const NAV_BOTTOM = [
  { label: "设计实验室", href: "/visual-lab/light-ai-os", icon: "◦" },
];

/* ── AppShell ──────────────────────────────────────── */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      style={{
        display:     "flex",
        width:        "100vw",
        height:       "100vh",
        overflow:     "hidden",
        background:   "radial-gradient(circle at 20% 10%, rgba(96,165,250,0.14), transparent 32%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.10), transparent 30%), radial-gradient(circle at 50% 100%, rgba(20,184,166,0.08), transparent 34%), #f6f8fb",
        color:        "var(--text-primary)",
        fontFamily:   "var(--font-sans)",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        :root {
          --bg-base: #f6f8fb;
          --bg-surface: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --border: rgba(15, 23, 42, 0.08);
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --space-4: 16px;
          --space-5: 20px;
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .la-nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 120ms;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .la-nav-item:hover {
          background: rgba(15, 23, 42, 0.04);
          color: var(--text-primary);
        }
        .la-nav-item.active {
          background: rgba(15, 23, 42, 0.06);
          color: var(--text-primary);
          font-weight: 600;
        }
        .la-nav-item .nav-icon {
          font-size: 14px;
          opacity: 0.6;
          width: 16px;
          text-align: center;
          flex-shrink: 0;
        }
        .la-nav-item.active .nav-icon {
          opacity: 1;
        }
        .la-nav-section {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 12px 10px 4px;
        }
      `}</style>

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        style={{
          width:         "var(--sidebar-width, 240px)",
          height:        "100vh",
          flexShrink:    0,
          display:       "flex",
          flexDirection: "column",
          background:    "var(--bg-surface)",
          borderRight:   "1px solid var(--border)",
          overflow:      "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding:  "20px 16px 16px",
            borderBottom:"1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "10px",
            }}
          >
            <div
              style={{
                width:        "22px",
                height:       "22px",
                borderRadius: "6px",
                background:   "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                flexShrink:   0,
              }}
            />
            <span
              style={{
                fontSize:   "13px",
                fontWeight: 700,
                color:      "var(--text-primary)",
                letterSpacing:"0.01em",
              }}
            >
              SUPERCOLOR
            </span>
          </div>
          <div
            style={{
              fontSize:   "10px",
              color:      "var(--text-muted)",
              marginTop:  "4px",
              paddingLeft:"32px",
            }}
          >
            AI OS
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex:     1,
            overflowY:"auto",
            padding:  "8px 8px",
          }}
        >
          <div className="la-nav-section">Workspace</div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`la-nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="la-nav-section" style={{ marginTop: "8px" }}>Labs</div>
          {NAV_BOTTOM.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`la-nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding:   "12px 16px",
            borderTop: "1px solid var(--border)",
            flexShrink:0,
          }}
        >
          <div
            style={{
              fontSize:   "11px",
              color:      "var(--text-muted)",
              display:    "flex",
              alignItems: "center",
              justifyContent:"space-between",
            }}
          >
            <span>v5.1 · Light AI OS</span>
            <span>● 在线</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <div
        style={{
          flex:        1,
          display:    "flex",
          flexDirection:"column",
          overflow:    "hidden",
          minWidth:    0,
        }}
      >
        {/* TopBar */}
        <header
          style={{
            height:      "var(--topbar-height, 52px)",
            borderBottom:"1px solid var(--border)",
            display:     "flex",
            alignItems:  "center",
            justifyContent: "space-between",
            padding:     "0 24px",
            background:  "var(--bg-surface)",
            flexShrink:  0,
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "6px",
              fontSize:   "13px",
              color:      "var(--text-muted)",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>SUPERCOLOR</span>
            <span>/</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {NAV_ITEMS.find((n) => isActive(n.href))?.label ??
               NAV_BOTTOM.find((n) => isActive(n.href))?.label ?? "总览"}
            </span>
          </div>

          {/* Status indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <SystemStatusPill label="风险确认" value="安全" ok />
            <SystemStatusPill label="Hermes" value="在线" ok />
            <Clock />
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex:       1,
            overflowY:  "auto",
            padding:    "24px",
            background: "var(--bg-base)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Clock (client-only, avoids hydration mismatch) ── */

function Clock() {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTime(new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }));
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontSize:   "11px",
        color:      "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {time ?? "--:--"}
    </span>
  );
}

/* ── SystemStatusPill ──────────────────────────────── */

function SystemStatusPill({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         "5px",
        padding:     "3px 8px",
        borderRadius:"var(--radius-full, 9999px)",
        background:  ok ? "rgba(22, 163, 74, 0.07)" : "rgba(220, 38, 38, 0.07)",
        border:      `1px solid ${ok ? "rgba(22, 163, 74, 0.15)" : "rgba(220, 38, 38, 0.15)"}`,
      }}
    >
      <span
        style={{
          width:        "5px",
          height:       "5px",
          borderRadius: "50%",
          background:   ok ? "#16a34a" : "#dc2626",
          flexShrink:   0,
        }}
      />
      <span style={{ fontSize: "11px", fontWeight: 600, color: ok ? "#16a34a" : "#dc2626" }}>
        {value}
      </span>
    </div>
  );
}

export default AppShell;
