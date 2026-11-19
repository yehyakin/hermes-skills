"use client";

import { useState, useCallback } from "react";
import { usePolling } from "@/usePolling";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { ClientOnlyText } from "@/components/ClientOnlyText";

// ─── Glass Panel (same as homepage) ──────────────────────────────────────────

function GlassPanel({
  title,
  rightElement,
  children,
  style,
}: {
  title?: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.72)",
        borderRadius: "16px",
        boxShadow:
          "0 24px 80px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(255,255,255,0.35)",
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(15,23,42,0.07)",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
          {rightElement}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  task_id: string;
  source: string;
  sender: string | null;
  original_message: string | null;
  task_type: string;
  assigned_agent: string;
  priority: string;
  risk_level: string;
  requires_confirmation: number;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number | null;
  memory_path?: string | null;
  memory_type?: string | null;
  memory_written_at?: string | null;
  result_summary?: string | null;
  error_message?: string | null;
  failed_step?: string | null;
  retryable?: number;
  suggested_next_action?: string | null;
  routing_reason?: string | null;
  matched_capability?: string | null;
  idempotency_key?: string | null;
  external_task_id?: string | null;
  project?: string | null;
  claimed_by?: string | null;
  claimed_at?: string | null;
  retry_count?: number;
  max_retries?: number;
  provider?: string | null;
  external_status?: string | null;
  external_created_at?: string | null;
  external_last_poll_at?: string | null;
  external_result_url?: string | null;
  external_error_code?: string | null;
  external_error_message?: string | null;
  billing_risk_level?: string | null;
  asset_ids?: string[] | null;
}

// ─── Status Config ────────────────────────────────────────────────────────────

type StatusTone = "green" | "violet" | "amber" | "red" | "slate" | "cyan";

interface StatusConfig {
  tone: StatusTone;
  label: string;
  short: string;
}

const norm = (v?: string | null) => (v || "").toLowerCase();

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:               { tone: "amber",  label: "等待中",           short: "等待"  },
  pending_confirmation:  { tone: "red",    label: "待确认",           short: "确认"  },
  confirmed:             { tone: "cyan",   label: "已确认",           short: "确认"  },
  running:               { tone: "violet", label: "运行中",           short: "运行"  },
  waiting_for_agent:     { tone: "amber",  label: "等待智能体",       short: "等待"  },
  dry_run_pending:       { tone: "cyan",   label: "Dry Run 待确认",   short: "Dry"   },
  external_created:      { tone: "cyan",   label: "外部已创建",       short: "外部"  },
  external_polling:      { tone: "violet", label: "轮询中",           short: "轮询"  },
  external_completed:    { tone: "green",  label: "外部已完成",       short: "完成"  },
  external_failed:       { tone: "red",    label: "外部失败",         short: "失败"  },
  recoverable_timeout:   { tone: "amber",  label: "可恢复超时",       short: "超时"  },
  completed:             { tone: "green",  label: "已完成",           short: "完成"  },
  failed:                { tone: "red",    label: "失败",             short: "失败"  },
  cancelled:             { tone: "slate",  label: "已取消",           short: "取消"  },
  invalidated:           { tone: "slate",  label: "已失效",           short: "失效"  },
  needs_codex_review:    { tone: "violet", label: "待 Codex 复核",   short: "复核"  },
  unknown:               { tone: "slate",  label: "未知",             short: "?"     },
};

function getStatus(s: string): StatusConfig {
  return STATUS_CONFIG[norm(s)] ?? STATUS_CONFIG["unknown"];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(s: number | null | undefined): string {
  if (s == null) return "—";
  if (s < 60)    return `${s}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function billingTone(level: string | null | undefined): StatusTone {
  if (level === "high")   return "red";
  if (level === "medium") return "amber";
  if (level === "low")    return "green";
  return "slate";
}

function riskTone(level: string | undefined): StatusTone {
  if (level === "critical") return "red";
  if (level === "high")     return "red";
  if (level === "medium")   return "amber";
  if (level === "low")      return "green";
  return "slate";
}

function riskLabel(level: string | undefined): string {
  if (level === "critical") return "严重";
  if (level === "high")     return "高风险";
  if (level === "medium")   return "中风险";
  if (level === "low")      return "低风险";
  return "—";
}

function billingLabel(level: string | null | undefined): string {
  if (level === "high")   return "高费";
  if (level === "medium") return "中费";
  if (level === "low")    return "低费";
  return "";
}

function isExternal(s: string): boolean {
  return norm(s).startsWith("external_");
}

function isRecoverable(s: string): boolean {
  return norm(s) === "recoverable_timeout";
}

function isBillingRisk(task: Task): boolean {
  return task.billing_risk_level === "high" || task.billing_risk_level === "medium";
}

function isHighRisk(task: Task): boolean {
  return task.risk_level === "high" || task.risk_level === "critical";
}

function hasMemory(task: Task): boolean {
  return !!(task.memory_path || task.memory_written_at);
}

// ─── Defensive parsers ────────────────────────────────────────────────────────

function getArray<T>(json: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: T[] }).data;
  }
  return fallback;
}

function parseArrayField(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(v => String(v));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(v => String(v));
    } catch {
      return value.split(",").map(v => v.trim()).filter(Boolean);
    }
  }
  return [];
}

// ─── Filter config ───────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all",          label: "全部"       },
  { key: "running",      label: "运行中"     },
  { key: "pending",      label: "等待中"     },
  { key: "confirm",      label: "待确认"     },
  { key: "external",     label: "外部任务"   },
  { key: "recoverable",  label: "可恢复"     },
  { key: "completed",    label: "已完成"     },
  { key: "failed",       label: "失败"       },
  { key: "high_risk",    label: "高风险"     },
  { key: "billing_risk", label: "扣费风险"   },
  { key: "cancelled",    label: "已取消"     },
];

function matchFilter(task: Task, filter: string): boolean {
  if (filter === "all")          return true;
  if (filter === "running")      return task.status === "running";
  if (filter === "pending")      return task.status === "pending" || task.status === "waiting_for_agent";
  if (filter === "confirm")      return task.status === "pending_confirmation";
  if (filter === "external")     return isExternal(task.status);
  if (filter === "recoverable")  return isRecoverable(task.status);
  if (filter === "completed")    return task.status === "completed";
  if (filter === "failed")       return task.status === "failed";
  if (filter === "high_risk")    return isHighRisk(task);
  if (filter === "billing_risk") return isBillingRisk(task);
  if (filter === "cancelled")    return task.status === "cancelled" || task.status === "invalidated";
  return task.status === filter;
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  const sc   = getStatus(task.status);
  const href = `/tasks/${encodeURIComponent(task.task_id || task.id)}`;
  const rawAssets = task.asset_ids as unknown;
  const assets = parseArrayField(rawAssets);
  const extId = task.external_task_id;
  const mem   = hasMemory(task);

  return (
    <Link href={href} className="block group">
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 hover:translate-x-1"
        style={{
          background: "rgba(255,255,255,0.60)",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(15,23,42,0.03)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.60)")
        }
      >
        {/* Status */}
        <div className="shrink-0 w-28">
          <StatusPill type={sc.tone} label={sc.label} />
        </div>

        {/* Task ID + project */}
        <div className="w-44 shrink-0 overflow-hidden">
          <div className="text-xs font-mono text-cyan-600 truncate">
            {task.task_id || task.id.slice(0, 16)}
          </div>
          {task.project && (
            <div className="text-xs text-slate-500 truncate">{task.project}</div>
          )}
        </div>

        {/* Agent */}
        <div className="w-28 shrink-0">
          <span
            className="text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{
              background: task.assigned_agent === "hermes"
                ? "rgba(167,139,250,0.10)"
                : task.assigned_agent === "openclaw"
                ? "rgba(251,191,36,0.10)"
                : "rgba(148,163,184,0.08)",
              color: task.assigned_agent === "hermes"
                ? "#7c3aed"
                : task.assigned_agent === "openclaw"
                ? "#d97706"
                : "#64748b",
            }}
          >
            {task.assigned_agent || "—"}
          </span>
        </div>

        {/* Type + Capability */}
        <div className="w-36 shrink-0">
          <div className="text-xs text-slate-600">{task.task_type || "—"}</div>
          {task.matched_capability && (
            <div className="text-xs text-slate-400 truncate">{task.matched_capability}</div>
          )}
        </div>

        {/* Risk + Billing */}
        <div className="flex gap-1.5 shrink-0">
          {task.risk_level && task.risk_level !== "none" && (
            <StatusPill
              type={riskTone(task.risk_level)}
              label={riskLabel(task.risk_level)}
            />
          )}
          {task.billing_risk_level && task.billing_risk_level !== "none" && (
            <StatusPill
              type={billingTone(task.billing_risk_level)}
              label={billingLabel(task.billing_risk_level)}
            />
          )}
        </div>

        {/* Duration */}
        <div className="w-16 text-xs text-slate-400 text-right shrink-0">
          {formatDuration(task.duration_seconds ?? undefined)}
        </div>

        {/* Indicators */}
        <div className="flex gap-1.5 shrink-0">
          {extId && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(125,211,252,0.12)",
                color: "#0891b2",
                border: "1px solid rgba(125,211,252,0.20)"
              }}
              title={`External: ${extId}`}
            >
              API
            </span>
          )}
          {task.status === "external_polling" && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(167,139,250,0.12)", color: "#7c3aed" }}
            >
              轮询中
            </span>
          )}
          {task.status === "external_failed" && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(248,113,113,0.10)", color: "#dc2626" }}
            >
              外部失败
            </span>
          )}
          {mem && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(34,197,94,0.10)",
                color: "#16a34a",
                border: "1px solid rgba(34,197,94,0.20)"
              }}
              title="Memory written"
            >
              MEM
            </span>
          )}
          {assets && assets.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(251,191,36,0.10)", color: "#d97706" }}
              title={`${assets.length} asset(s)`}
            >
              📎{assets.length}
            </span>
          )}
        </div>

        {/* Created */}
        <div className="w-20 text-xs text-slate-400 shrink-0 text-right">
          <ClientOnlyText
            fallback="--"
            render={() => {
              const diff = Date.now() - new Date(task.created_at).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return "刚刚";
              if (mins < 60) return `${mins}m`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h`;
              return `${Math.floor(hrs / 24)}d`;
            }}
          />
        </div>

        {/* Arrow */}
        <div className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity text-slate-400 text-sm">
          →
        </div>
      </div>
    </Link>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, count, tone }: { label: string; count: number; tone: StatusTone }) {
  const BG: Record<StatusTone, string> = {
    green:  "rgba(34, 197, 94, 0.10)",
    violet: "rgba(167, 139, 250, 0.10)",
    amber:  "rgba(251, 191, 36, 0.10)",
    red:    "rgba(248, 113, 113, 0.10)",
    slate:  "rgba(100, 116, 139, 0.08)",
    cyan:   "rgba(125, 211, 252, 0.10)",
  };
  const TXT: Record<StatusTone, string> = {
    green:  "#16a34a",
    violet: "#7c3aed",
    amber:  "#d97706",
    red:    "#dc2626",
    slate:  "#64748b",
    cyan:   "#0891b2",
  };
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: BG[tone],
        border: `1px solid ${BG[tone].replace("0.10","0.18").replace("0.08","0.14")}`,
      }}
    >
      <div className="text-xl font-bold" style={{ color: TXT[tone] }}>{count}</div>
      <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{label}</div>
    </div>
  );
}

// ─── Right Stats Panel ────────────────────────────────────────────────────────

function StatsPanel({ tasks }: { tasks: Task[] }) {
  const agentCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  tasks.forEach(t => {
    agentCounts[t.assigned_agent || "—"] = (agentCounts[t.assigned_agent || "—"] || 0) + 1;
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const topAgents   = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topStatuses = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const extCount      = tasks.filter(t => isExternal(t.status)).length;
  const failCount     = tasks.filter(t => t.status === "failed").length;
  const recoverCount  = tasks.filter(t => isRecoverable(t.status)).length;
  const billRiskCount = tasks.filter(t => isBillingRisk(t)).length;

  return (
    <div className="flex flex-col gap-3">
      {extCount > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(125,211,252,0.08)", border: "1px solid rgba(125,211,252,0.16)" }}
        >
          <div className="text-xs mb-2" style={{ color: "#64748b" }}>外部 API</div>
          <div className="text-2xl font-bold" style={{ color: "#0891b2" }}>{extCount}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>活跃 / 轮询 / 失败</div>
        </div>
      )}
      {recoverCount > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.16)" }}
        >
          <div className="text-xs mb-2" style={{ color: "#64748b" }}>可恢复超时</div>
          <div className="text-2xl font-bold" style={{ color: "#d97706" }}>{recoverCount}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>超时任务</div>
        </div>
      )}
      {failCount > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.16)" }}
        >
          <div className="text-xs mb-2" style={{ color: "#64748b" }}>失败</div>
          <div className="text-2xl font-bold" style={{ color: "#dc2626" }}>{failCount}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>需要处理</div>
        </div>
      )}
      {billRiskCount > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.16)" }}
        >
          <div className="text-xs mb-2" style={{ color: "#64748b" }}>扣费风险</div>
          <div className="text-2xl font-bold" style={{ color: "#ea580c" }}>{billRiskCount}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>中费 / 高费</div>
        </div>
      )}
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(248,250,252,0.80)", border: "1px solid rgba(15,23,42,0.07)" }}
      >
        <div className="text-xs mb-2" style={{ color: "#64748b" }}>按智能体</div>
        <div className="space-y-1.5">
          {topAgents.map(([agent, count]) => (
            <div key={agent} className="flex items-center justify-between">
              <span className="text-xs truncate" style={{ color: "#334155" }}>{agent}</span>
              <span className="text-xs ml-2" style={{ color: "#94a3b8" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(248,250,252,0.80)", border: "1px solid rgba(15,23,42,0.07)" }}
      >
        <div className="text-xs mb-2" style={{ color: "#64748b" }}>按状态</div>
        <div className="space-y-1.5">
          {topStatuses.map(([status, count]) => {
            const sc = getStatus(status);
            return (
              <div key={status} className="flex items-center justify-between">
                <StatusPill type={sc.tone} label={sc.label} />
                <span className="text-xs ml-2" style={{ color: "#94a3b8" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const API_BASE = "/api";

export default function TasksPage() {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState("all");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks?limit=200`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = getArray<Task>(json.data, []);
      setTasks(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "连接失败");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchTasks, 8000);

  // ── Counts ──────────────────────────────────────────────────────────────────
  const counts = {
    all:          tasks.length,
    running:      tasks.filter(t => t.status === "running").length,
    pending:      tasks.filter(t => t.status === "pending" || t.status === "waiting_for_agent").length,
    confirm:      tasks.filter(t => t.status === "pending_confirmation").length,
    external:     tasks.filter(t => isExternal(t.status)).length,
    recoverable:   tasks.filter(t => isRecoverable(t.status)).length,
    completed:    tasks.filter(t => t.status === "completed").length,
    failed:       tasks.filter(t => t.status === "failed").length,
    high_risk:    tasks.filter(t => isHighRisk(t)).length,
    billing_risk: tasks.filter(t => isBillingRisk(t)).length,
    cancelled:    tasks.filter(t => t.status === "cancelled" || t.status === "invalidated").length,
  };

  const filtered = tasks.filter(t => matchFilter(t, filter));

  return (
    <AppShell>
      <div className="flex flex-col h-full gap-3">

        {/* ── Top Bar ── */}
        <GlassPanel style={{ padding: "12px 16px" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold" style={{ color: "#0f172a" }}>
                任务列表
              </span>
              {!loading && !error && (
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  共 {tasks.length} 个任务 · 每 8 秒刷新
                </span>
              )}
            </div>
            {error ? (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#dc2626" }}>
                  ⚠ {error}
                </span>
                <button
                  onClick={fetchTasks}
                  className="text-xs px-3 py-1 rounded-lg transition-colors"
                  style={{
                    color: "#dc2626",
                    border: "1px solid rgba(220,38,38,0.30)",
                    background: "rgba(248,113,113,0.08)",
                  }}
                >
                  重试
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                />
                <span className="text-xs" style={{ color: "#94a3b8" }}>实时</span>
              </div>
            )}
          </div>
        </GlassPanel>

        {/* ── KPI Row ── */}
        {!loading && !error && (
          <div className="grid grid-cols-8 gap-2 shrink-0">
            <SummaryCard label="全部"     count={counts.all}          tone="slate"  />
            <SummaryCard label="运行中"   count={counts.running}      tone="violet" />
            <SummaryCard label="等待中"   count={counts.pending}      tone="amber"  />
            <SummaryCard label="待确认"   count={counts.confirm}      tone="red"    />
            <SummaryCard label="外部任务" count={counts.external}     tone="cyan"   />
            <SummaryCard label="可恢复"   count={counts.recoverable}  tone="amber"  />
            <SummaryCard label="已完成"   count={counts.completed}    tone="green"  />
            <SummaryCard label="失败"     count={counts.failed}       tone="red"    />
          </div>
        )}

        {/* ── Main ── */}
        <div className="flex gap-3 flex-1 min-h-0">

          {/* ── Left: Filters + Table ── */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">

            {/* Filter tabs */}
            <div
              className="flex items-center gap-1 overflow-x-auto"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(28px) saturate(160%)",
                WebkitBackdropFilter: "blur(28px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.72)",
                borderRadius: "12px",
                padding: "8px 12px",
                boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
              }}
            >
              {FILTERS.map(f => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={
                      active
                        ? {
                            background: "rgba(8,145,178,0.12)",
                            border: "1px solid rgba(8,145,178,0.25)",
                            color: "#0891b2",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid " + (counts[f.key as keyof typeof counts] > 0 ? "rgba(15,23,42,0.08)" : "transparent"),
                            color: "#64748b",
                          }
                    }
                  >
                    {f.label}
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                      style={{
                        background: active ? "rgba(8,145,178,0.16)" : "rgba(148,163,184,0.08)",
                        color: active ? "#0891b2" : "#94a3b8",
                      }}
                    >
                      {counts[f.key as keyof typeof counts] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table header */}
            {!loading && !error && (
              <div
                className="flex items-center gap-3 px-4 py-1.5 text-xs uppercase tracking-wider shrink-0"
                style={{ color: "#94a3b8" }}
              >
                <div className="w-28 shrink-0">状态</div>
                <div className="w-44 shrink-0">任务 / 项目</div>
                <div className="w-28 shrink-0">智能体</div>
                <div className="w-36 shrink-0">类型 / 能力</div>
                <div className="shrink-0">风险 / 扣费</div>
                <div className="w-16 shrink-0 text-right">耗时</div>
                <div className="shrink-0">标识</div>
                <div className="w-20 shrink-0 text-right">创建</div>
                <div className="w-4 shrink-0" />
              </div>
            )}

            {/* Task list */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-1">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center" style={{ color: "#94a3b8" }}>
                    <div className="text-2xl mb-2">◈</div>
                    <div className="text-sm">正在同步任务…</div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-sm mb-2" style={{ color: "#dc2626" }}>⚠ {error}</div>
                    <button
                      onClick={fetchTasks}
                      className="text-xs px-4 py-2 rounded-lg transition-colors"
                      style={{
                        color: "#dc2626",
                        border: "1px solid rgba(220,38,38,0.30)",
                        background: "rgba(248,113,113,0.08)",
                      }}
                    >
                      重试
                    </button>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center" style={{ color: "#94a3b8" }}>
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-sm">暂无匹配任务</div>
                  </div>
                </div>
              ) : (
                filtered.map(task => <TaskRow key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* ── Right: Stats ── */}
          <div className="w-52 shrink-0 overflow-y-auto min-h-0">
            <GlassPanel title="数据洞察" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "4px 0" }}>
                {!loading && !error ? (
                  <StatsPanel tasks={tasks} />
                ) : (
                  <div className="text-center py-8" style={{ color: "#94a3b8", fontSize: "12px" }}>—</div>
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
