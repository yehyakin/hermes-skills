"use client";

import { useState, useCallback } from "react";
import { usePolling } from "@/usePolling";
import { AppShell } from "@/components/AppShell";

import { LightGlassPanel as LiquidPanel } from "@/components/liquid/LightGlassPanel";
import LiquidBadge from "@/components/liquid/LiquidBadge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
  id: number;
  agent_name: string;
  status: string;
  derived_status: string;
  current_task_id: string | null;
  last_heartbeat: string | null;
  status_source: string;
  status_note: string;
  capabilities: string;
  version: string;
  runtime_host: string;
  today_completed: number;
  today_failed: number;
  avg_duration_seconds: number;
  worker_status: string;
  worker_last_poll: string;
  worker_stale: boolean;
}

// ─── Status Config ────────────────────────────────────────────────────────────

type StatusTone = "green" | "violet" | "amber" | "red" | "slate" | "cyan";

interface StatusConfig {
  tone: StatusTone;
  label: string;
  pulse: boolean;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  online:         { tone: "green",  label: "Online",          pulse: true  },
  busy:           { tone: "violet", label: "Busy",            pulse: true  },
  stale:          { tone: "amber",  label: "Stale",           pulse: false },
  worker_stalled: { tone: "amber",  label: "Worker Stalled",   pulse: false },
  worker_error:   { tone: "red",    label: "Worker Error",     pulse: false },
  offline:        { tone: "red",    label: "Offline",          pulse: false },
  webhook:        { tone: "cyan",  label: "Webhook",          pulse: false },
  external:       { tone: "cyan",  label: "External",         pulse: false },
  adapter:        { tone: "slate", label: "Adapter",          pulse: false },
  unmanaged:      { tone: "slate", label: "Unmanaged",        pulse: false },
  unknown:        { tone: "slate", label: "Unknown",          pulse: false },
};

function getStatusConfig(derived: string): StatusConfig {
  return STATUS_CONFIG[derived] ?? STATUS_CONFIG["unknown"];
}

function statusToneForCount(tone: StatusTone): StatusTone {
  return tone; // same mapping for summary cards
}

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all",          label: "All"          },
  { key: "online",       label: "Online"        },
  { key: "busy",         label: "Busy"          },
  { key: "stale",        label: "Stale"         },
  { key: "worker_issue", label: "Worker Issue"  },
  { key: "external",     label: "External"      },
  { key: "webhook",      label: "Webhook"       },
  { key: "adapter",      label: "Adapter"       },
  { key: "unmanaged",    label: "Unmanaged"     },
  { key: "offline",      label: "Offline"       },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isWorkerIssue(a: Agent): boolean {
  return a.derived_status === "worker_stalled" || a.derived_status === "worker_error";
}

function filterAgent(agent: Agent, filter: string): boolean {
  if (filter === "all")          return true;
  if (filter === "worker_issue") return isWorkerIssue(agent);
  if (filter === "external")      return agent.derived_status === "external";
  return agent.derived_status === filter;
}

// ─── Agent Card ──────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  selected,
  onClick,
}: {
  agent: Agent;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = getStatusConfig(agent.derived_status);

  const capabilities = agent.capabilities
    ? agent.capabilities.split(",").filter(Boolean)
    : [];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-200 select-none text-left w-full border ${
        selected ? "ring-1 ring-cyan-500/40" : "hover:ring-1 hover:ring-slate-300/60"
      }`}
      style={{
        background: selected
          ? "rgba(255, 255, 255, 0.88)"
          : "rgba(255, 255, 255, 0.60)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: selected
          ? "1px solid rgba(8, 145, 178, 0.30)"
          : "1px solid rgba(15, 23, 42, 0.06)",
        boxShadow: selected
          ? "0 0 24px rgba(8, 145, 178, 0.10), inset 0 1px 0 rgba(255,255,255,0.90)"
          : "inset 0 1px 0 rgba(255,255,255,0.50)",
      }}
    >
      {/* Pulse dot for live agents */}
      {cfg.pulse && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
          style={{
            background: cfg.tone === "green" ? "#22c55e" : "#a78bfa",
            boxShadow: cfg.tone === "green"
              ? "0 0 8px #22c55e"
              : "0 0 8px #a78bfa",
          }}
        />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-[#0f172a] leading-tight">
            {agent.agent_name}
          </div>
          <div className="mt-1.5">
            <LiquidBadge tone={cfg.tone} size="sm" label={cfg.label} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#64748b] font-mono">
            {agent.status_source}
          </div>
        </div>
      </div>

      {/* Status note */}
      {agent.status_note && agent.status_note !== agent.derived_status && (
        <div className="mb-3 text-xs text-[#64748b] leading-snug">
          {agent.status_note}
        </div>
      )}

      {/* Capabilities chips */}
      {capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {capabilities.slice(0, 6).map((cap) => (
            <span
              key={cap}
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(15, 23, 42, 0.06)",
                border: "1px solid rgba(15, 23, 42, 0.10)",
                color: "#64748b",
              }}
            >
              {cap.trim()}
            </span>
          ))}
          {capabilities.length > 6 && (
            <span className="text-xs px-1.5 py-0.5 rounded-md text-[#475569]">
              +{capabilities.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between text-xs text-[#64748b]">
        {agent.last_heartbeat ? (
          <span>♥ {formatRelative(agent.last_heartbeat)}</span>
        ) : agent.worker_last_poll ? (
          <span>⚙ {formatRelative(agent.worker_last_poll)}</span>
        ) : (
          <span>—</span>
        )}
        {agent.current_task_id ? (
          <span className="font-mono text-xs text-[#0891b2]/70 truncate max-w-[120px]">
            {agent.current_task_id.slice(0, 12)}…
          </span>
        ) : null}
      </div>

      {/* Worker warning strip for heartbeat agents */}
      {(agent.status_source === "heartbeat") && agent.worker_stale && (
        <div className="mt-3 flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
          style={{
            background: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.24)",
            color: "#fbbf24",
          }}>
          <span>⚠</span>
          <span>Worker stale · last poll {formatRelative(agent.worker_last_poll)}</span>
        </div>
      )}
    </button>
  );
}

// ─── Inspector ────────────────────────────────────────────────────────────────

function Inspector({ agent }: { agent: Agent | null }) {
  if (!agent) {
    return (
      <LiquidPanel variant="chrome" className="h-full flex items-center justify-center">
        <div className="text-center text-[#64748b] text-sm">
          <div className="text-2xl mb-2">◈</div>
          <div>Select an agent to inspect</div>
        </div>
      </LiquidPanel>
    );
  }

  const cfg = getStatusConfig(agent.derived_status);
  const capabilities = agent.capabilities
    ? agent.capabilities.split(",").filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto">
      {/* Agent name + status */}
      <div>
        <div className="text-base font-semibold text-[#0f172a] mb-2">
          {agent.agent_name}
        </div>
        <LiquidBadge tone={cfg.tone} label={cfg.label} pulse={cfg.pulse} />
      </div>

      {/* Status note */}
      {agent.status_note && (
        <div className="text-sm text-[#64748b] leading-relaxed">
          {agent.status_note}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/6" />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Source",       value: agent.status_source },
          { label: "Version",      value: agent.version || "—" },
          { label: "Runtime Host", value: agent.runtime_host || "—" },
          { label: "Last Seen",    value: formatRelative(agent.last_heartbeat) },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs text-[#64748b] mb-0.5">{label}</div>
            <div className="text-sm text-[#1e293b] font-mono break-all">{value}</div>
          </div>
        ))}
      </div>

      {/* Current task */}
      {agent.current_task_id && (
        <div>
          <div className="text-xs text-[#64748b] mb-0.5">Current Task</div>
          <div className="text-sm text-[#0891b2] font-mono break-all">
            {agent.current_task_id}
          </div>
        </div>
      )}

      {/* Worker state — only for heartbeat agents */}
      {agent.status_source === "heartbeat" && (
        <div>
          <div className="text-xs text-[#64748b] mb-2">Worker State</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748b]">Status</span>
              <span className={`text-sm font-medium ${
                agent.worker_status === "idle" ? "text-green-400" :
                agent.worker_status === "running" ? "text-violet-400" :
                "text-[#64748b]"
              }`}>
                {agent.worker_status || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748b]">Last Poll</span>
              <span className="text-sm text-slate-300">
                {agent.worker_last_poll ? formatRelative(agent.worker_last_poll) : "—"}
              </span>
            </div>
            {agent.worker_stale && (
              <div
                className="mt-2 flex items-start gap-2 text-xs px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(251, 191, 36, 0.12)",
                  border: "1px solid rgba(251, 191, 36, 0.28)",
                  color: "#fbbf24",
                }}
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>
                  Worker poll is stale. Consider checking the Hermes task worker
                  process and its launchd configuration.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today stats */}
      {(agent.today_completed > 0 || agent.today_failed > 0) && (
        <div>
          <div className="text-xs text-[#64748b] mb-2">Today</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Done", value: agent.today_completed, color: "text-green-400" },
              { label: "Fail", value: agent.today_failed,   color: "text-[#dc2626]"   },
              {
                label: "Avg",
                value: agent.avg_duration_seconds
                  ? `${Math.round(agent.avg_duration_seconds)}s`
                  : "—",
                color: "text-slate-300",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl p-2 text-center"
                style={{ background: "rgba(255, 255, 255, 0.52)", border: "1px solid rgba(148,163,184,0.10)" }}
              >
                <div className={`text-sm font-semibold ${color}`}>{value}</div>
                <div className="text-xs text-[#64748b] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div>
          <div className="text-xs text-[#64748b] mb-2">Capabilities</div>
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="text-xs px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(167, 139, 250, 0.10)",
                  border: "1px solid rgba(167, 139, 250, 0.20)",
                  color: "#a78bfa",
                }}
              >
                {cap.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: StatusTone;
}) {
  const TONE_BG: Record<StatusTone, string> = {
    green:  "rgba(34, 197, 94, 0.10)",
    violet: "rgba(139, 92, 246, 0.10)",
    amber:  "rgba(217, 119, 6, 0.10)",
    red:    "rgba(220, 38, 38, 0.10)",
    slate:  "rgba(148, 163, 184, 0.10)",
    cyan:   "rgba(8, 145, 178, 0.10)",
  };
  const TONE_TEXT: Record<StatusTone, string> = {
    green:  "#22c55e",
    violet: "#8b5cf6",
    amber:  "#d97706",
    red:    "#dc2626",
    slate:  "#94a3b8",
    cyan:   "#0891b2",
  };

  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: TONE_BG[tone],
        border: `1px solid ${TONE_BG[tone].replace("0.12", "0.24")}`,
      }}
    >
      <div className="text-xl font-bold" style={{ color: TONE_TEXT[tone] }}>
        {count}
      </div>
      <div className="text-xs text-[#64748b] mt-0.5">{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const API_BASE = "/api";

export default function AgentsPage() {
  const [agents, setAgents]       = useState<Agent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState("all");
  const [selected, setSelected]   = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows: Agent[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      setAgents(rows);
      setError(null);
      // Keep selection in sync
      setSelected((prev) => {
        if (!prev) return null;
        return rows.find((a) => a.id === prev.id) ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchAgents, 8000);

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    all:          agents.length,
    online:       agents.filter((a) => a.derived_status === "online").length,
    busy:         agents.filter((a) => a.derived_status === "busy").length,
    stale:        agents.filter((a) => a.derived_status === "stale").length,
    worker_issue: agents.filter((a) => isWorkerIssue(a)).length,
    external:     agents.filter((a) => a.derived_status === "external").length,
    webhook:      agents.filter((a) => a.derived_status === "webhook").length,
    adapter:      agents.filter((a) => a.derived_status === "adapter").length,
    unmanaged:    agents.filter((a) => a.derived_status === "unmanaged").length,
    offline:      agents.filter((a) => a.derived_status === "offline").length,
  };

  const filtered = agents.filter((a) => filterAgent(a, filter));

  return (
    <AppShell>
    <div style={{ flex: 1, background: "#f6f8fb" }}>
      <div className="flex flex-col flex-1 p-4 gap-3 overflow-hidden" style={{ height: "100vh" }}>

        {/* ── Top Bar ── */}
        <LiquidPanel variant="chrome" className="shrink-0 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base text-[#0f172a] font-semibold">
                Agent Operations
              </span>
              {!loading && !error && (
                <span className="text-xs text-[#64748b]">
                  {agents.length} agents · refreshing every 8s
                </span>
              )}
            </div>
            {error ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#dc2626]">⚠ {error}</span>
                <button
                  onClick={fetchAgents}
                  className="text-xs px-3 py-1 rounded-lg text-[#dc2626] border border-[#fca5a5] hover:bg-[#fef2f2] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                />
                <span className="text-xs text-[#64748b]">Live</span>
              </div>
            )}
          </div>
        </LiquidPanel>

        {/* ── Summary Row ── */}
        {!loading && !error && (
          <div className="grid grid-cols-5 gap-2 shrink-0">
            <SummaryCard label="Online"       count={counts.online}       tone="green"  />
            <SummaryCard label="Busy"          count={counts.busy}          tone="violet"/>
            <SummaryCard label="Stale"         count={counts.stale}         tone="amber" />
            <SummaryCard label="Worker Issue"  count={counts.worker_issue}  tone="amber" />
            <SummaryCard label="Offline"       count={counts.offline}       tone="red"   />
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex gap-3 flex-1 min-h-0">

          {/* ── Left: Filters + Grid ── */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">

            {/* Filter tabs */}
            <LiquidPanel variant="dark" className="shrink-0 px-3 py-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active ? "text-white" : "text-[#64748b] hover:text-slate-300"
                      }`}
                      style={
                        active
                          ? {
                              background: "rgba(125, 211, 252, 0.16)",
                              border: "1px solid rgba(125, 211, 252, 0.30)",
                              color: "#7dd3fc",
                            }
                          : {
                              background: "transparent",
                              border: "1px solid transparent",
                            }
                      }
                    >
                      {f.label}
                      <span
                        className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                        style={{
                          background: active
                            ? "rgba(125, 211, 252, 0.20)"
                            : "rgba(15, 23, 42, 0.06)",
                          color: active ? "#7dd3fc" : "#64748b",
                        }}
                      >
                        {counts[f.key as keyof typeof counts] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LiquidPanel>

            {/* Agent grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-[#64748b] text-sm">
                    <div className="text-2xl mb-2">◈</div>
                    <div>Syncing agents…</div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-[#dc2626] text-sm mb-2">⚠ {error}</div>
                    <button
                      onClick={fetchAgents}
                      className="text-xs px-4 py-2 rounded-lg text-[#dc2626] border border-[#fca5a5] hover:bg-[#fef2f2] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-[#64748b] text-sm">
                    <div className="text-2xl mb-2">🤖</div>
                    <div>No agents match: {filter}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filtered.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      selected={selected?.id === agent.id}
                      onClick={() =>
                        setSelected((prev) =>
                          prev?.id === agent.id ? null : agent
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Inspector ── */}
          <div className="w-80 shrink-0">
            <LiquidPanel variant="chrome" className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-white/6 shrink-0">
                <div className="text-xs text-[#64748b] font-medium">Inspector</div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <Inspector agent={selected} />
              </div>
            </LiquidPanel>
          </div>
        </div>
      </div>
    </div>
    </AppShell>
  );
}
