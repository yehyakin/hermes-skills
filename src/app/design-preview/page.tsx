"use client";

import LiquidPanel from "@/components/liquid/LiquidPanel";
import LiquidDock from "@/components/liquid/LiquidDock";
import LiquidBadge from "@/components/liquid/LiquidBadge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const topBarStatus = {
  os: "SUPERCOLOR AI OS",
  agentsOnline: 4,
  agentsTotal: 6,
  externalPoll: "Active",
  billingRisk: "LOW" as "LOW" | "MED" | "HIGH",
  lastSync: "2s ago",
};

const navIcons = [
  { icon: "◈", label: "Dashboard" },
  { icon: "▣", label: "Tasks" },
  { icon: "◉", label: "Agents" },
  { icon: "✉", label: "Comms" },
  { icon: "◻", label: "Menswear" },
  { icon: "◎", label: "Memory" },
];

const sidebarItems = [
  { icon: "◈", label: "Command Center", active: true },
  { icon: "◻", label: "Menswear Studio", active: false },
  { icon: "✉", label: "Communications", active: false },
  { icon: "◎", label: "Obsidian Memory", active: false },
  { icon: "⬡", label: "External API", active: false },
];

const taskStats = [
  { label: "Running", value: 3, color: "#a78bfa" },
  { label: "Completed", value: 47, color: "#22c55e" },
  { label: "Failed", value: 2, color: "#f87171" },
  { label: "Queued", value: 12, color: "#fbbf24" },
];

const commMessages = [
  { from: "Codex", to: "Hermes", content: "accepted · P3-4B-2 Real Image2", status: "ok" as const, time: "2s ago" },
  { from: "Hermes", to: "Codex", content: "needs review · Menswear workflow", status: "review" as const, time: "8s ago" },
  { from: "OpenClaw", to: "Hermes", content: "needs review · Dream report", status: "review" as const, time: "23s ago" },
  { from: "Router", to: "Hermes", content: "routed · Image2 task", status: "ok" as const, time: "45s ago" },
  { from: "Hermes", to: "OpenClaw", content: "completed · Health check", status: "ok" as const, time: "1m ago" },
];

const inspectorFields = [
  { label: "Workflow ID", value: "WF-20260521-003" },
  { label: "Provider", value: "toapis / gpt-image-2" },
  { label: "Size", value: "9:16 · 720×1280" },
  { label: "Billing Risk", value: "LOW", risk: true, status: "ok" as const },
  { label: "Idempotency Key", value: "idem_9f3b2a1c" },
  { label: "Parent Assets", value: "2 assets" },
  { label: "External Task ID", value: "tsk_img_01Kx..." },
];

const workerStatus = [
  { name: "Hermes Worker", status: "running" as const, tasks: 3 },
  { name: "Codex Worker", status: "ok" as const, tasks: 1 },
  { name: "OpenClaw Agent", status: "ok" as const, tasks: 0 },
  { name: "External Poller", status: "warning" as const, tasks: 2 },
];

// ─── Components ───────────────────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "#05070a" }}>
      {/* Aurora Layer — soft colored glow, not white haze */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 18% 14%, rgba(56,189,248,0.12) 0%, transparent 34%),
            radial-gradient(circle at 82% 16%, rgba(167,139,250,0.12) 0%, transparent 36%),
            radial-gradient(circle at 56% 92%, rgba(244,114,182,0.06) 0%, transparent 42%),
            linear-gradient(135deg, #05070a 0%, #07111f 46%, #05070a 100%)
          `,
        }}
      />
      {/* Grid — slate low-opacity with radial mask */}
      <div className="absolute inset-0" style={{
        opacity: 0.35,
        backgroundImage: `
          linear-gradient(rgba(148,163,184,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(circle at 50% 45%, black, transparent 76%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black, transparent 76%)',
      }} />
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-64" style={{
        background: "linear-gradient(to top, rgba(125,211,252,0.06) 0%, transparent 100%)"
      }} />
    </div>
  );
}

function FloatingTopBar() {
  return (
    <LiquidPanel variant="chrome" className="w-full h-12 flex items-center px-5 gap-6 rounded-xl !rounded-b-none">
      <span className="text-sm font-semibold tracking-wide" style={{ color: "#f8fafc" }}>
        {topBarStatus.os}
      </span>

      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
        <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>LIVE</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: "#94a3b8" }}>Agents</span>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
          {topBarStatus.agentsOnline}/{topBarStatus.agentsTotal}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: "#94a3b8" }}>Poll</span>
        <span className="text-xs" style={{ color: "#7dd3fc" }}>{topBarStatus.externalPoll}</span>
      </div>

      <div className="flex-1" />

      <LiquidBadge tone={topBarStatus.billingRisk === "LOW" ? "green" : topBarStatus.billingRisk === "MED" ? "amber" : "red"} label={`Risk ${topBarStatus.billingRisk}`} size="sm" />

      <span className="text-xs" style={{ color: "#64748b" }}>Sync {topBarStatus.lastSync}</span>
    </LiquidPanel>
  );
}

function IconRail() {
  return (
    <LiquidPanel variant="chrome" className="w-14 flex flex-col items-center py-4 gap-2 rounded-xl !rounded-none">
      {navIcons.map((item) => (
        <button
          key={item.label}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 hover:translate-y-[-1px] hover:scale-[1.05]"
          style={{
            background: "transparent",
            color: "#64748b",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(8, 12, 22, 0.48)";
            (e.currentTarget as HTMLButtonElement).style.color = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
          }}
        >
          {item.icon}
        </button>
      ))}
    </LiquidPanel>
  );
}

function Sidebar() {
  return (
    <LiquidPanel variant="dark" intensity="medium" className="w-56 flex flex-col gap-1 p-3 rounded-xl !rounded-none">
      <div className="px-3 py-2 mb-1">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>Workspace</span>
      </div>
      {sidebarItems.map((item) => (
        <button
          key={item.label}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:translate-x-[2px]"
          style={{
            background: item.active ? "rgba(10, 15, 28, 0.48)" : "rgba(8, 12, 22, 0.20)",
            color: item.active ? "#7dd3fc" : "#94a3b8",
            border: item.active ? "1px solid rgba(125,211,252,0.18)" : "1px solid rgba(148,163,184,0.06)",
          }}
        >
          <span>{item.icon}</span>
          <span className="font-medium">{item.label}</span>
          {item.active && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#7dd3fc", boxShadow: "0 0 6px #7dd3fc" }} />
          )}
        </button>
      ))}
    </LiquidPanel>
  );
}

function TaskStats() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {taskStats.map((stat) => (
        <LiquidPanel key={stat.label} variant="dark" interactive className="p-4">
          <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
          <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>{stat.label}</div>
        </LiquidPanel>
      ))}
    </div>
  );
}

function CommStream() {
  return (
    <LiquidPanel variant="dark" intensity="medium" className="flex-1 flex flex-col min-h-0 rounded-xl">
      <div className="px-4 py-3 border-b"        style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>Communications</span>
        <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(125,211,252,0.15)", color: "#7dd3fc" }}>
          {commMessages.filter(m => m.status === "review").length} needs review
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {commMessages.map((msg, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:translate-x-[2px]"
            style={{
              background: msg.status === "review" ? "rgba(10, 15, 28, 0.40)" : "rgba(8, 12, 22, 0.28)",
              border: `1px solid ${msg.status === "review" ? "rgba(125,211,252,0.14)" : "rgba(148,163,184,0.08)"}`,
            }}
          >
            <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
              <span className="text-xs font-medium" style={{ color: "#f8fafc" }}>{msg.from}</span>
              <span className="text-xs" style={{ color: "#64748b" }}>→</span>
              <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{msg.to}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ color: "#f8fafc" }}>{msg.content}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{msg.time}</div>
            </div>
            <LiquidBadge tone={msg.status === "review" ? "cyan" : "green"} size="sm" />
          </div>
        ))}
      </div>
    </LiquidPanel>
  );
}

function Inspector() {
  return (
    <LiquidPanel variant="dark" intensity="high" className="w-72 flex flex-col rounded-xl">
      <div className="px-4 py-3 border-b"        style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>Inspector</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {inspectorFields.map((field) => (
          <div key={field.label}>
            <div className="text-xs mb-1" style={{ color: "#64748b" }}>{field.label}</div>
            <div
              className="text-sm font-mono px-2.5 py-1.5 rounded-lg"
              style={{
                background: field.risk
                  ? field.status === "ok"
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(248,113,113,0.10)"
                  : "rgba(8, 12, 22, 0.40)",
                color: field.risk
                  ? field.status === "ok"
                    ? "#22c55e"
                    : "#f87171"
                  : "#f8fafc",
                border: `1px solid ${field.risk
                  ? field.status === "ok"
                    ? "rgba(34,197,94,0.20)"
                    : "rgba(248,113,113,0.20)"
                  : "rgba(148,163,184,0.08)"}`,
              }}
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2"        style={{ borderColor: "rgba(148,163,184,0.08)" }}>
        <button
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-y-[-1px]"
          style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.30)",
            color: "#22c55e",
          }}
        >
          Accept
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-y-[-1px]"
          style={{
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.24)",
            color: "#f87171",
          }}
        >
          Reject
        </button>
      </div>
    </LiquidPanel>
  );
}

function WorkerHealth() {
  return (
    <LiquidPanel variant="dark" interactive className="p-4">
      <div className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: "#64748b" }}>Worker Health</div>
      <div className="flex flex-col gap-2">
        {workerStatus.map((w) => (
          <div key={w.name} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#f8fafc" }}>{w.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#64748b" }}>{w.tasks} tasks</span>
              <LiquidBadge
                tone={
                  w.status === "running"
                    ? "violet"
                    : w.status === "ok"
                    ? "green"
                    : "slate"
                }
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </LiquidPanel>
  );
}

function DarkCommandCenter() {
  return (
    <section className="relative z-10 flex flex-col h-full">
      {/* Floating Top Bar */}
      <FloatingTopBar />

      {/* Main content row */}
      <div className="flex flex-1 min-h-0">
        {/* Icon Rail */}
        <IconRail />

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col gap-4 p-5 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#f8fafc" }}>Command Center</h1>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>SUPERCOLOR AI OS · Dark Liquid Workspace</p>
            </div>
            <LiquidBadge tone="violet" label="4 Active Workflows" />
          </div>

          {/* Stats */}
          <TaskStats />

          {/* Comm stream + Inspector */}
          <div className="flex gap-4 flex-1 min-h-0">
            <CommStream />
            <Inspector />
          </div>

          {/* Worker health */}
          <WorkerHealth />
        </div>
      </div>
    </section>
  );
}

// ─── Light Frosted Menswear Studio ──────────────────────────────────────────

function LightBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ background: "#eef3f6" }}>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,255,255,0.80) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 30%, rgba(37,99,235,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 50% 80%, rgba(139,92,246,0.04) 0%, transparent 70%)
          `,
        }}
      />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.50) 80px, rgba(255,255,255,0.50) 81px),
          repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.50) 80px, rgba(255,255,255,0.50) 81px)
        `
      }} />
    </div>
  );
}

function StudioHeader() {
  return (
    <LiquidPanel variant="light" intensity="medium" className="w-full h-14 flex items-center px-6 gap-5 rounded-xl !rounded-b-none">
      <span className="text-base font-semibold" style={{ color: "#111827" }}>Menswear Workflow</span>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(37,99,235,0.08)" }}>
        <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
        <span className="text-sm font-medium" style={{ color: "#111827" }}>Real API</span>
      </div>
      <div className="flex-1" />
      <LiquidBadge tone="green" label="Billing OK" size="sm" />
    </LiquidPanel>
  );
}

function AssetStrip() {
  const assets = [
    { label: "Model", icon: "👤", color: "#7dd3fc" },
    { label: "Top", icon: "👕", color: "#a78bfa" },
    { label: "Pants", icon: "👖", color: "#22c55e" },
    { label: "Ref Image", icon: "🖼", color: "#fbbf24" },
    { label: "Ref Video", icon: "🎬", color: "#f472b6" },
  ];

  return (
    <LiquidPanel variant="light" intensity="medium" className="flex items-center gap-4 p-4 rounded-xl">
      <span className="text-sm font-medium shrink-0" style={{ color: "#64748b" }}>Assets</span>
      {assets.map((asset) => (
        <div
          key={asset.label}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(255,255,255,0.88)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <span className="text-xl">{asset.icon}</span>
          <span className="text-xs font-medium" style={{ color: asset.color }}>{asset.label}</span>
        </div>
      ))}
    </LiquidPanel>
  );
}

function PreviewStage() {
  return (
    <LiquidPanel variant="light" intensity="high" className="flex-1 flex items-center justify-center rounded-xl min-h-64">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl" style={{ background: "rgba(37,99,235,0.08)", border: "2px dashed rgba(37,99,235,0.20)" }}>
          👕
        </div>
        <div className="text-base font-medium" style={{ color: "#111827" }}>Try-on Result</div>
        <div className="text-sm mt-1" style={{ color: "#64748b" }}>Upload assets to preview</div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full" style={{ background: "#8b93a7" }} />
          <span className="text-xs" style={{ color: "#64748b" }}>empty state</span>
        </div>
      </div>
    </LiquidPanel>
  );
}

function StudioInspector() {
  const fields = [
    { label: "Size Ratio", value: "9:16" },
    { label: "Prompt", value: "Default studio prompt" },
    { label: "Provider", value: "toapis / gpt-image-2" },
    { label: "Workflow ID", value: "WF-MW-001" },
  ];

  return (
    <LiquidPanel variant="light" intensity="medium" className="w-64 flex flex-col rounded-xl">
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <span className="text-sm font-medium" style={{ color: "#111827" }}>Parameters</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="text-xs mb-1" style={{ color: "#64748b" }}>{f.label}</div>
            <div
              className="text-sm px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.80)", color: "#111827", border: "1px solid rgba(255,255,255,0.88)" }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </LiquidPanel>
  );
}

function StudioDock() {
  const items = [
    { icon: "⬆", label: "Upload", active: false },
    { icon: "✨", label: "Generate", active: true },
    { icon: "▶", label: "Dry Run", active: false },
    { icon: "↺", label: "Reset", danger: true, active: false },
    { icon: "↗", label: "Open Task", active: false },
  ];

  return (
    <LiquidDock items={items} mode="dark" />
  );
}

function LightMenswearStudio() {
  return (
    <section className="relative z-10 flex flex-col h-full">
      <StudioHeader />
      <div className="flex flex-col gap-4 p-5 flex-1">
        <AssetStrip />
        <div className="flex gap-4 flex-1 min-h-0">
          <PreviewStage />
          <StudioInspector />
        </div>
        <StudioDock />
      </div>
    </section>
  );
}

// ─── Glass Comparison ─────────────────────────────────────────────────────────

function GlassComparison() {
  return (
    <section className="relative z-10 py-8 px-5">
      <div className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
        Liquid Glass Intensity Comparison
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* CSS Glass (plain) */}
        <div className="space-y-2">
          <div className="text-xs text-center font-medium" style={{ color: "#64748b" }}>CSS Glass</div>
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
              color: "#e5e7eb",
            }}
          >
            <div className="text-sm font-medium">Standard blur</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>Plain backdrop-filter</div>
          </div>
          <div className="text-xs text-center px-4" style={{ color: "#64748b" }}>
            Simple CSS blur, no edge highlights, no reflection layer, no depth shadow
          </div>
        </div>

        {/* Liquid Glass (medium) */}
        <div className="space-y-2">
          <div className="text-xs text-center font-medium" style={{ color: "#7dd3fc" }}>Liquid Glass · Medium</div>
          <LiquidPanel variant="dark" intensity="medium" className="p-6 text-center">
            <div className="text-sm font-medium">blur + highlight</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>Edge + shadow + reflection</div>
          </LiquidPanel>
          <div className="text-xs text-center px-4" style={{ color: "#64748b" }}>
            Inset highlight, reflection layer, layered shadow, chromatic border
          </div>
        </div>

        {/* Liquid Glass Strong (high) */}
        <div className="space-y-2">
          <div className="text-xs text-center font-medium" style={{ color: "#a78bfa" }}>Liquid Glass · Strong</div>
          <LiquidPanel variant="strong" intensity="high" className="p-6 text-center">
            <div className="text-sm font-medium">Max intensity</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>Full glow + ring</div>
          </LiquidPanel>
          <div className="text-xs text-center px-4" style={{ color: "#64748b" }}>
            Outer glow, active ring, maximum highlight, strongest shadow depth
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignPreviewPage() {
  return (
    <div className="relative" style={{ background: "#05070a" }}>
      {/* Section A: Dark Liquid Command Center */}
      <div className="h-screen flex flex-col" style={{ background: "#05070a" }}>
        <AmbientBackground />
        <DarkCommandCenter />
      </div>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-4 px-5 py-6">
        <div className="flex-1 h-px" style={{ background: "rgba(148,163,184,0.10)" }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>Light Studio</span>
        <div className="flex-1 h-px" style={{ background: "rgba(148,163,184,0.10)" }} />
      </div>

      {/* Section B: Light Frosted Menswear Studio */}
      <div className="h-screen flex flex-col" style={{ background: "#eef3f6" }}>
        <LightBackground />
        <LightMenswearStudio />
      </div>

      {/* Glass Comparison */}
      <div style={{ background: "#070b12" }}>
        <div className="max-w-5xl mx-auto">
          <GlassComparison />
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-8" style={{ background: "#070b12" }} />
    </div>
  );
}
