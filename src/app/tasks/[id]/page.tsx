"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ClientOnlyText } from "@/components/ClientOnlyText";

// ─── Glass Panel (Light Liquid Glass) ────────────────────────────────────────

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
              fontSize: "12px",
              fontWeight: 600,
              color: "#0f172a",
              letterSpacing: "0.01em",
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

// ─── Types ───────────────────────────────────────────────────────────────────

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
  started_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  memory_path?: string | null;
  memory_type?: string | null;
  memory_written_at?: string | null;
  result_summary?: string | null;
  result_detail?: string | null;
  changed_files?: string | null;
  verification?: string | null;
  artifacts?: string | null;
  error_message?: string | null;
  failed_step?: string | null;
  retryable?: number;
  suggested_next_action?: string | null;
  routing_reason?: string | null;
  matched_capability?: string | null;
  routing_trace?: string | null;
  idempotency_key?: string | null;
  external_task_id?: string | null;
  project?: string | null;
  claimed_by?: string | null;
  claimed_at?: string | null;
  retry_count?: number;
  max_retries?: number;
  last_retry_at?: string | null;
  retry_reason?: string | null;
  provider?: string | null;
  external_status?: string | null;
  external_created_at?: string | null;
  external_last_poll_at?: string | null;
  external_result_url?: string | null;
  external_error_code?: string | null;
  external_error_message?: string | null;
  billing_risk_level?: string | null;
  external_poll_count?: number | null;
  external_poll_started_at?: string | null;
  external_timeout_at?: string | null;
  payload?: unknown;
  asset_ids?: unknown;
}

interface TaskEvent {
  id: number;
  task_id: string;
  timestamp: string;
  event_type: string;
  agent?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// ─── Defensive parsers ────────────────────────────────────────────────────────

function getDataObject<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  const o = json as { data?: unknown };
  if (o.data && typeof o.data === "object") return o.data as T;
  return json as T;
}

function getDataArray<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: T[] }).data;
  }
  return [];
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

// ─── Status config (Chinese) ─────────────────────────────────────────────────

type BadgeTone = "green" | "cyan" | "violet" | "amber" | "red" | "slate";

const STATUS_CONFIG: Record<string, { tone: BadgeTone; label: string }> = {
  pending:               { tone: "amber",  label: "等待中"              },
  pending_confirmation:  { tone: "amber",  label: "待确认" },
  confirmed:             { tone: "cyan",   label: "已确认"            },
  running:               { tone: "violet", label: "运行中"             },
  waiting_for_agent:     { tone: "amber",  label: "等待智能体"   },
  dry_run_pending:       { tone: "violet", label: "Dry Run 待执行"     },
  external_created:      { tone: "cyan",   label: "外部已创建"    },
  external_polling:      { tone: "violet", label: "外部轮询中"    },
  external_completed:    { tone: "green",  label: "外部已完成"  },
  external_failed:       { tone: "red",    label: "外部失败"     },
  recoverable_timeout:   { tone: "amber",  label: "可恢复超时" },
  completed:             { tone: "green",  label: "已完成"           },
  failed:                { tone: "red",    label: "失败"              },
  cancelled:             { tone: "slate",  label: "已取消"          },
  invalidated:           { tone: "slate",  label: "已失效"         },
};

function statusTone(s: string): BadgeTone {
  return STATUS_CONFIG[s]?.tone ?? "slate";
}

function statusLabel(s: string): string {
  return STATUS_CONFIG[s]?.label ?? s;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ tone, label }: { tone: BadgeTone; label: string }) {
  const colors: Record<BadgeTone, { bg: string; text: string; border: string }> = {
    green:  { bg: "rgba(22,163,74,0.10)",   text: "#16a34a", border: "rgba(22,163,74,0.20)"   },
    amber:  { bg: "rgba(245,158,11,0.10)",  text: "#d97706", border: "rgba(245,158,11,0.25)"  },
    cyan:   { bg: "rgba(6,182,212,0.10)",   text: "#0891b2", border: "rgba(6,182,212,0.20)"   },
    violet: { bg: "rgba(139,92,246,0.10)",  text: "#7c3aed", border: "rgba(139,92,246,0.20)"  },
    red:    { bg: "rgba(220,38,38,0.10)",   text: "#dc2626", border: "rgba(220,38,38,0.20)"   },
    slate:  { bg: "rgba(100,116,139,0.10)", text: "#64748b", border: "rgba(100,116,139,0.15)" },
  };
  const c = colors[tone] ?? colors.slate;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Billing config ───────────────────────────────────────────────────────────

function billingTone(level: string | null | undefined): BadgeTone {
  if (level === "high")   return "red";
  if (level === "medium") return "amber";
  if (level === "low")    return "green";
  return "slate";
}

function billingLabel(level: string | null | undefined): string {
  if (level === "high")   return "🔴 高风险";
  if (level === "medium") return "🟡 中风险";
  if (level === "low")    return "🟢 低风险";
  return "✅ 无风险";
}

// ─── Event config ─────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, { tone: BadgeTone; icon: string }> = {
  task_created:       { tone: "slate",  icon: "📋" },
  risk_checked:        { tone: "amber",  icon: "📌" },
  routed:             { tone: "cyan",   icon: "🛤️" },
  assigned:           { tone: "violet", icon: "🎯" },
  started:            { tone: "cyan",   icon: "▶️" },
  task_started:       { tone: "cyan",   icon: "▶️" },
  completed:          { tone: "green",  icon: "✅" },
  task_completed:     { tone: "green",  icon: "✅" },
  failed:             { tone: "red",    icon: "❌" },
  task_failed:        { tone: "red",    icon: "❌" },
  external_timeout:   { tone: "amber",  icon: "⏰" },
  external_completed:  { tone: "green",  icon: "✅" },
  external_failed:     { tone: "red",    icon: "❌" },
  external_created:    { tone: "cyan",   icon: "🌐" },
  external_polling:    { tone: "violet", icon: "🔄" },
  asset_registered:    { tone: "green",  icon: "📎" },
  worker_timeout:     { tone: "red",    icon: "⏱️" },
  memory_written:      { tone: "violet", icon: "🧠" },
  recovered:          { tone: "green",  icon: "♻️" },
};

function eventTone(t: string): BadgeTone {
  return EVENT_CONFIG[t]?.tone ?? "slate";
}

function eventIcon(t: string): string {
  return EVENT_CONFIG[t]?.icon ?? "•";
}

const EVENT_TONE_BG: Record<BadgeTone, string> = {
  green:  "rgba(22,163,74,0.08)",
  amber:  "rgba(245,158,11,0.08)",
  cyan:   "rgba(6,182,212,0.08)",
  violet: "rgba(139,92,246,0.08)",
  red:    "rgba(220,38,38,0.08)",
  slate:  "rgba(100,116,139,0.08)",
};

const EVENT_TONE_BORDER: Record<BadgeTone, string> = {
  green:  "rgba(22,163,74,0.20)",
  amber:  "rgba(245,158,11,0.20)",
  cyan:   "rgba(6,182,212,0.20)",
  violet: "rgba(139,92,246,0.20)",
  red:    "rgba(220,38,38,0.20)",
  slate:  "rgba(100,116,139,0.15)",
};

const EVENT_TONE_TEXT: Record<BadgeTone, string> = {
  green:  "#16a34a",
  amber:  "#d97706",
  cyan:   "#0891b2",
  violet: "#7c3aed",
  red:    "#dc2626",
  slate:  "#64748b",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleString("zh-CN"); } catch { return dateStr; }
}

function formatDuration(s: number | null | undefined): string {
  if (s == null) return "—";
  if (s < 60)    return `${s}秒`;
  if (s < 3600)  return `${Math.floor(s / 60)}分 ${s % 60}秒`;
  return `${Math.floor(s / 3600)}时 ${Math.floor((s % 3600) / 60)}分`;
}

function hasExternalAPI(task: Task): boolean {
  return !!(task.provider || task.external_task_id || task.external_status || task.billing_risk_level);
}

function hasResult(task: Task): boolean {
  return !!(task.result_summary || task.result_detail || task.changed_files || task.verification || task.artifacts);
}

function hasError(task: Task): boolean {
  return !!(task.error_message || task.failed_step || task.suggested_next_action || task.external_error_code);
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{
        fontSize: "11px",
        padding: "2px 8px",
        borderRadius: "6px",
        background: "rgba(15,23,42,0.06)",
        color: copied ? "#16a34a" : "#64748b",
        border: "1px solid rgba(15,23,42,0.08)",
        cursor: "pointer",
        transition: "all 120ms",
      }}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px",
      padding: "6px 0",
      borderBottom: "1px solid rgba(15,23,42,0.06)",
    }}>
      <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0, minWidth: "80px" }}>{label}</span>
      <span style={{ fontSize: "11px", color: "#0f172a", textAlign: "right", wordBreak: "break-all" }}>{children}</span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <span style={{ fontSize: "13px" }}>{icon}</span>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "#0f172a", letterSpacing: "0.02em" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(15,23,42,0.08)" }} />
    </div>
  );
}

// ─── Event Timeline ───────────────────────────────────────────────────────────

function EventItem({ event, isLatest }: { event: TaskEvent; isLatest: boolean }) {
  const tone = eventTone(event.event_type);
  const icon = eventIcon(event.event_type);
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: isLatest ? EVENT_TONE_BG[tone].replace("0.08", "0.14") : EVENT_TONE_BG[tone],
        border: `1px solid ${isLatest ? EVENT_TONE_BORDER[tone].replace("0.20", "0.35") : EVENT_TONE_BORDER[tone]}`,
        marginBottom: "6px",
      }}
    >
      <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px", color: EVENT_TONE_TEXT[tone] }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5" }}>{event.message}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          {event.agent && (
            <span style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "4px",
              background: "rgba(139,92,246,0.08)",
              color: "#7c3aed",
            }}>
              {event.agent}
            </span>
          )}
          <ClientOnlyText
            fallback="—"
            render={() => formatDate(event.timestamp)}
          />
        </div>
      </div>
    </div>
  );
}

function EventTimeline({ events }: { events: TaskEvent[] }) {
  const sorted = [...events].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>暂无事件记录</div>
      </div>
    );
  }
  return (
    <div style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
      {sorted.map((event, i) => (
        <EventItem key={event.id ?? i} event={event} isLatest={i === sorted.length - 1} />
      ))}
    </div>
  );
}

// ─── Assets Panel ─────────────────────────────────────────────────────────────

function AssetsPanel({ task }: { task: Task }) {
  const all = parseArrayField(task.asset_ids);
  const visible = all.slice(0, 8);
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? all : visible;
  if (all.length === 0) return null;
  return (
    <div>
      <SectionHeader icon="📎" label={`素材库 (${all.length})`} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {display.map((id, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <code style={{
              flex: 1,
              fontSize: "11px",
              fontFamily: "var(--font-mono, monospace)",
              color: "#d97706",
              background: "rgba(245,158,11,0.06)",
              padding: "3px 8px",
              borderRadius: "6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {id}
            </code>
            <CopyButton text={id} />
          </div>
        ))}
        {all.length > 8 && (
          <button
            onClick={() => setShowAll(v => !v)}
            style={{
              fontSize: "11px",
              color: "#0891b2",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: "4px 0",
            }}
          >
            {showAll ? "↑ 收起" : `↓ 查看全部 ${all.length} 个`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Memory Panel ─────────────────────────────────────────────────────────────

function MemoryPanel({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const [writingMemory, setWritingMemory] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleWrite = async (force = false) => {
    setWritingMemory(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(task.task_id || task.id)}/memory/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (res.ok || data.idempotent) {
        setMsg(data.already_written ? "✅ 已写入（幂等）" : "✅ 写入成功");
        onRefresh();
      } else {
        setMsg(`❌ ${data.detail || "写入失败"}`);
      }
    } catch {
      setMsg("❌ 网络错误");
    } finally {
      setWritingMemory(false);
    }
  };

  const hasMem = !!(task.memory_path || task.memory_written_at);

  return (
    <div>
      <SectionHeader icon="🧠" label="长期记忆" />
      {hasMem ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <Badge tone="green" label="已写入" />
            {task.memory_type && <Badge tone="violet" label={task.memory_type} />}
          </div>
          {task.memory_path && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <code style={{
                flex: 1,
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#374151",
                background: "rgba(15,23,42,0.04)",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(15,23,42,0.08)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {task.memory_path}
              </code>
              <CopyButton text={task.memory_path} />
            </div>
          )}
          {task.memory_written_at && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              <ClientOnlyText fallback="—" render={() => formatDate(task.memory_written_at)} />
            </div>
          )}
          <button
            onClick={() => handleWrite(true)}
            disabled={writingMemory}
            style={{
              fontSize: "11px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(245,158,11,0.08)",
              color: "#d97706",
              border: "1px solid rgba(245,158,11,0.15)",
              cursor: writingMemory ? "not-allowed" : "pointer",
              opacity: writingMemory ? 0.5 : 1,
            }}
          >
            {writingMemory ? "写入中…" : "🔄 强制重写"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Badge tone="slate" label="未写入" />
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
            {task.status === "completed" || task.status === "failed"
              ? "写入将自动推断记忆类型"
              : "任务完成后可写入"}
          </p>
          <button
            onClick={() => handleWrite(false)}
            disabled={writingMemory || (task.status !== "completed" && task.status !== "failed")}
            style={{
              fontSize: "11px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(139,92,246,0.08)",
              color: "#7c3aed",
              border: "1px solid rgba(139,92,246,0.15)",
              cursor: (writingMemory || (task.status !== "completed" && task.status !== "failed")) ? "not-allowed" : "pointer",
              opacity: (writingMemory || (task.status !== "completed" && task.status !== "failed")) ? 0.4 : 1,
            }}
          >
            {writingMemory ? "写入中…" : "✍️ 写入记忆"}
          </button>
        </div>
      )}
      {msg && (
        <div style={{
          marginTop: "8px",
          fontSize: "11px",
          padding: "6px 10px",
          borderRadius: "8px",
          background: msg.includes("✅") ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
          color: msg.includes("✅") ? "#16a34a" : "#dc2626",
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}

// ─── Actions Panel ────────────────────────────────────────────────────────────

function ActionsPanel({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const apiAction = async (endpoint: string, method = "POST", body?: object) => {
    setLoading(endpoint);
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(task.task_id || task.id)}${endpoint}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) onRefresh();
      else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409 && err.detail?.includes("HIGH billing risk")) {
          if (window.confirm("扣费风险为 HIGH，确认强制恢复？")) {
            await apiAction(endpoint, method, { ...body, force: true });
          }
        }
      }
    } finally {
      setLoading(null);
    }
  };

  const canRetry = (task.status === "failed" || task.status === "cancelled")
    && task.retryable === 1
    && (task.retry_count ?? 0) < (task.max_retries ?? 3);

  const canRecover = (task.status === "recoverable_timeout" || task.status === "external_failed")
    && !!task.external_task_id;

  const canConfirm = task.status === "pending_confirmation";
  const canCancel = ["pending", "running", "pending_confirmation", "waiting_for_agent"].includes(task.status);

  const isLoading = (action: string) => loading === action;

  const btnBase = {
    fontSize: "11px",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 120ms",
    border: "1px solid",
  };

  return (
    <div>
      <SectionHeader icon="⚡" label="操作" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {canRetry && (
          <button
            onClick={() => apiAction("/retry")}
            disabled={isLoading("/retry")}
            style={{ ...btnBase, background: "rgba(15,23,42,0.04)", color: "#374151", borderColor: "rgba(15,23,42,0.10)", opacity: isLoading("/retry") ? 0.5 : 1 }}
          >
            🔄 重试 ({task.retry_count ?? 0}/{task.max_retries ?? 3})
          </button>
        )}
        {canRecover && (
          <button
            onClick={() => apiAction("/recover", "POST", { worker: "frontend", force: false })}
            disabled={isLoading("/recover")}
            style={{ ...btnBase, background: "rgba(6,182,212,0.08)", color: "#0891b2", borderColor: "rgba(6,182,212,0.15)", opacity: isLoading("/recover") ? 0.5 : 1 }}
          >
            ♻️ 恢复
          </button>
        )}
        {canConfirm && (
          <button
            onClick={() => apiAction("/confirm")}
            disabled={isLoading("/confirm")}
            style={{ ...btnBase, background: "rgba(22,163,74,0.08)", color: "#16a34a", borderColor: "rgba(22,163,74,0.15)", opacity: isLoading("/confirm") ? 0.5 : 1 }}
          >
            ✅ 确认并执行
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => { if (window.confirm("取消此任务？")) apiAction("/cancel"); }}
            disabled={isLoading("/cancel")}
            style={{ ...btnBase, background: "rgba(220,38,38,0.08)", color: "#dc2626", borderColor: "rgba(220,38,38,0.15)", opacity: isLoading("/cancel") ? 0.5 : 1 }}
          >
            ❌ 取消
          </button>
        )}
        {!canRetry && !canRecover && !canConfirm && !canCancel && (
          <div style={{ fontSize: "11px", color: "#94a3b8", padding: "4px 0" }}>— 暂无可用操作</div>
        )}
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <AppShell>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "12px",
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#3b82f6",
          animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
        }} />
        <span style={{ fontSize: "13px", color: "#64748b" }}>加载中…</span>
        <style>{`@keyframes ping { 75%,100% { transform:scale(1.4); opacity:0 } 50% { transform:scale(1); opacity:1 } }`}</style>
      </div>
    </AppShell>
  );
}

// ─── Error ─────────────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <GlassPanel style={{ textAlign: "center", padding: "24px 32px", maxWidth: "360px" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚠️</div>
          <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>{message || "任务不存在"}</div>
          <button
            onClick={onRetry}
            style={{
              fontSize: "12px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(220,38,38,0.08)",
              color: "#dc2626",
              border: "1px solid rgba(220,38,38,0.15)",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </GlassPanel>
      </div>
    </AppShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const API_BASE = "/api";

export default function TaskDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const taskId = decodeURIComponent(rawId ?? "");

  const [task, setTask]             = useState<Task | null>(null);
  const [events, setEvents]         = useState<TaskEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [taskError, setTaskError]   = useState<string | null>(null);
  const [eventsError, setEventsError] = useState(false);

  const fetchAll = useCallback(() => (
    Promise.allSettled([
      fetch(`${API_BASE}/tasks/${encodeURIComponent(taskId)}`, { cache: "no-store" }),
      fetch(`${API_BASE}/tasks/${encodeURIComponent(taskId)}/events`, { cache: "no-store" }),
    ]).then(async (results) => {
      if (results[0].status === "fulfilled" && results[0].value.ok) {
        const json = await results[0].value.json();
        const t = getDataObject<Task>(json);
        if (t) setTask(t);
        else setTaskError("Task not found");
      } else if (results[0].status === "fulfilled") {
        setTaskError(`HTTP ${results[0].value.status}`);
      } else {
        setTaskError(results[0].reason?.message ?? "Connection failed");
      }

      if (results[1].status === "fulfilled" && results[1].value.ok) {
        const json = await results[1].value.json();
        setEvents(getDataArray<TaskEvent>(json));
      } else {
        setEventsError(true);
      }

      setLoading(false);
    })
  ), [taskId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingState />;
  if (taskError || !task) return <ErrorState message={taskError ?? "任务不存在"} onRetry={fetchAll} />;

  const sc = STATUS_CONFIG[task.status] ?? { tone: "slate" as BadgeTone, label: task.status };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: "16px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>

        {/* ── Top Bar ── */}
        <GlassPanel style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <Link
                href="/tasks"
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(15,23,42,0.06)",
                  color: "#64748b",
                  border: "1px solid rgba(15,23,42,0.08)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                ← 任务列表
              </Link>
              <Badge tone={sc.tone} label={sc.label} />
              <code style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#0891b2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {task.task_id || task.id}
              </code>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {task.assigned_agent && (
                <span style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "rgba(139,92,246,0.08)",
                  color: "#7c3aed",
                  fontWeight: 600,
                }}>
                  {task.assigned_agent}
                </span>
              )}
              {task.project && (
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{task.project}</span>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", alignItems: "start" }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Overview */}
            <GlassPanel title="基本信息">
              <div style={{ padding: "4px 0" }}>
                <InfoRow label="任务 ID">
                  <code style={{ fontSize: "11px", fontFamily: "monospace", color: "#0891b2" }}>{task.task_id || task.id}</code>
                </InfoRow>
                {task.project && <InfoRow label="项目">{task.project}</InfoRow>}
                <InfoRow label="状态"><Badge tone={sc.tone} label={sc.label} /></InfoRow>
                <InfoRow label="风险等级">
                  <Badge
                    tone={task.risk_level === "high" || task.risk_level === "critical" ? "red" : task.risk_level === "medium" ? "amber" : task.risk_level === "low" ? "green" : "slate"}
                    label={task.risk_level}
                  />
                </InfoRow>
                <InfoRow label="优先级">{task.priority ?? "—"}</InfoRow>
                <InfoRow label="任务类型">{task.task_type ?? "—"}</InfoRow>
                <InfoRow label="来源">{task.source ?? "—"}</InfoRow>
                {task.sender && <InfoRow label="发送者">{task.sender}</InfoRow>}
                <InfoRow label="创建时间">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.created_at)} />
                </InfoRow>
                <InfoRow label="开始时间">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.started_at)} />
                </InfoRow>
                <InfoRow label="完成时间">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.completed_at)} />
                </InfoRow>
                <InfoRow label="耗时">{formatDuration(task.duration_seconds)}</InfoRow>
                {task.original_message && (
                  <div style={{ padding: "8px 0", borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>原始消息</div>
                    <div style={{
                      fontSize: "11px",
                      color: "#374151",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      background: "rgba(15,23,42,0.03)",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}>
                      {task.original_message}
                    </div>
                  </div>
                )}
              </div>
            </GlassPanel>

            {/* Result */}
            {hasResult(task) && (
              <GlassPanel title="执行结果">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" }}>
                  {task.result_summary && (
                    <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a", marginBottom: "4px" }}>摘要</div>
                      <div style={{ fontSize: "11px", color: "#15803d", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {task.result_summary.startsWith("http") ? (
                          <a href={task.result_summary} target="_blank" rel="noopener noreferrer" style={{ color: "#0891b2" }}>{task.result_summary}</a>
                        ) : task.result_summary}
                      </div>
                    </div>
                  )}
                  {task.result_detail && (
                    <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#0891b2", marginBottom: "4px" }}>详情</div>
                      <div style={{ fontSize: "11px", color: "#0e7490", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{task.result_detail}</div>
                    </div>
                  )}
                  {task.changed_files && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#7c3aed", marginBottom: "6px" }}>变更文件</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {task.changed_files.split(/[,\n]/).map((f, i) => (
                          <code key={i} style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(139,92,246,0.06)",
                            color: "#7c3aed",
                          }}>{f.trim()}</code>
                        ))}
                      </div>
                    </div>
                  )}
                  {task.verification && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#0891b2", marginBottom: "4px" }}>验证结果</div>
                      <div style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-wrap" }}>{task.verification}</div>
                    </div>
                  )}
                  {task.artifacts && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#d97706", marginBottom: "4px" }}>产出物</div>
                      <div style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-wrap" }}>{task.artifacts}</div>
                    </div>
                  )}
                </div>
              </GlassPanel>
            )}

            {/* Error */}
            {hasError(task) && (
              <GlassPanel title="错误信息">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" }}>
                  {task.error_message && (
                    <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", marginBottom: "4px" }}>错误信息</div>
                      <div style={{ fontSize: "11px", color: "#b91c1c", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{task.error_message}</div>
                    </div>
                  )}
                  {task.failed_step && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", marginBottom: "4px" }}>失败步骤</div>
                      <code style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#b91c1c",
                        background: "rgba(220,38,38,0.06)",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        display: "block",
                      }}>{task.failed_step}</code>
                    </div>
                  )}
                  {task.external_error_code && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", marginBottom: "4px" }}>外部错误码</div>
                      <code style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#b91c1c",
                        background: "rgba(220,38,38,0.06)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}>{task.external_error_code}</code>
                      {task.external_error_message && (
                        <div style={{ fontSize: "11px", color: "#b91c1c", marginTop: "4px" }}>{task.external_error_message}</div>
                      )}
                    </div>
                  )}
                  {task.suggested_next_action && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#d97706", marginBottom: "4px" }}>建议下一步</div>
                      <div style={{
                        fontSize: "11px",
                        color: "#92400e",
                        background: "rgba(245,158,11,0.04)",
                        border: "1px solid rgba(245,158,11,0.12)",
                        padding: "8px 10px",
                        borderRadius: "8px",
                      }}>
                        {task.suggested_next_action}
                      </div>
                    </div>
                  )}
                </div>
              </GlassPanel>
            )}

            {/* External Paid API */}
            {hasExternalAPI(task) && (
              <GlassPanel title="外部付费 API">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
                  {task.provider && (
                    <InfoRow label="Provider">
                      <span style={{ fontWeight: 600, color: "#7c3aed" }}>{task.provider}</span>
                    </InfoRow>
                  )}
                  {task.external_task_id && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0, minWidth: "80px" }}>外部任务 ID</span>
                      <code style={{
                        flex: 1,
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#0891b2",
                        wordBreak: "break-all",
                      }}>{task.external_task_id}</code>
                      <CopyButton text={task.external_task_id} />
                    </div>
                  )}
                  {task.external_status && (
                    <InfoRow label="外部状态">
                      <Badge
                        tone={task.external_status === "completed" ? "green" : task.external_status === "failed" ? "red" : task.external_status === "polling" ? "violet" : "cyan"}
                        label={task.external_status}
                      />
                    </InfoRow>
                  )}
                  {task.external_poll_count != null && <InfoRow label="轮询次数">{task.external_poll_count}</InfoRow>}
                  {task.external_last_poll_at && (
                    <InfoRow label="最后轮询">
                      <ClientOnlyText fallback="—" render={() => formatDate(task.external_last_poll_at)} />
                    </InfoRow>
                  )}
                  {task.external_created_at && (
                    <InfoRow label="API 创建时间">
                      <ClientOnlyText fallback="—" render={() => formatDate(task.external_created_at)} />
                    </InfoRow>
                  )}
                  {task.external_timeout_at && (
                    <InfoRow label="超时时间">
                      <ClientOnlyText fallback="—" render={() => formatDate(task.external_timeout_at)} />
                    </InfoRow>
                  )}
                  {task.external_result_url && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0, minWidth: "80px" }}>结果 URL</span>
                      <a
                        href={task.external_result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "11px", color: "#0891b2", textDecoration: "underline", wordBreak: "break-all", flex: 1 }}
                      >
                        {task.external_result_url}
                      </a>
                    </div>
                  )}
                  {task.billing_risk_level && (
                    <InfoRow label="扣费风险">
                      <Badge tone={billingTone(task.billing_risk_level)} label={billingLabel(task.billing_risk_level)} />
                    </InfoRow>
                  )}
                  {task.status === "recoverable_timeout" && task.external_task_id && (
                    <div style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.15)",
                    }}>
                      <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>⏰ 外部 API 超时 — 任务可恢复</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>external_task_id 已存在，Worker 重启后将自动轮询恢复</div>
                    </div>
                  )}
                  {task.status === "external_failed" && (
                    <div style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.15)",
                    }}>
                      <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>❌ 外部 API 调用失败</div>
                    </div>
                  )}
                </div>
              </GlassPanel>
            )}

            {/* Assets */}
            {parseArrayField(task.asset_ids).length > 0 && (
              <GlassPanel>
                <AssetsPanel task={task} />
              </GlassPanel>
            )}

            {/* Timeline */}
            <GlassPanel title={`事件时间线 (${events.length})`}>
              {eventsError ? (
                <div style={{ textAlign: "center", padding: "20px 0", fontSize: "12px", color: "#94a3b8" }}>事件数据不可用</div>
              ) : (
                <EventTimeline events={events} />
              )}
            </GlassPanel>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: 0 }}>

            {/* Actions */}
            <GlassPanel>
              <ActionsPanel task={task} onRefresh={fetchAll} />
            </GlassPanel>

            {/* Routing */}
            <GlassPanel>
              <SectionHeader icon="🛤️" label="路由信息" />
              {task.matched_capability || task.routing_reason || task.routing_trace ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {task.assigned_agent && <InfoRow label="分配智能体">{task.assigned_agent}</InfoRow>}
                  {task.matched_capability && (
                    <InfoRow label="匹配能力">
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(6,182,212,0.08)",
                        color: "#0891b2",
                      }}>
                        {task.matched_capability}
                      </span>
                    </InfoRow>
                  )}
                  {task.routing_reason && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>路由原因</div>
                      <div style={{ fontSize: "11px", color: "#374151" }}>{task.routing_reason}</div>
                    </div>
                  )}
                  {task.routing_trace && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>路由轨迹</div>
                      <pre style={{
                        fontSize: "10px",
                        fontFamily: "monospace",
                        color: "#16a34a",
                        background: "rgba(15,23,42,0.03)",
                        padding: "8px",
                        borderRadius: "8px",
                        maxHeight: "100px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        margin: 0,
                      }}>
                        {task.routing_trace}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>暂无路由元数据</div>
              )}
            </GlassPanel>

            {/* Idempotency & Retry */}
            <GlassPanel>
              <SectionHeader icon="🔁" label="幂等与重试" />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {task.idempotency_key && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0, minWidth: "80px" }}>幂等键</span>
                    <code style={{ fontSize: "10px", fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{task.idempotency_key}</code>
                  </div>
                )}
                {task.external_task_id && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0, minWidth: "80px" }}>外部任务 ID</span>
                    <code style={{ fontSize: "10px", fontFamily: "monospace", color: "#0891b2", wordBreak: "break-all" }}>{task.external_task_id}</code>
                  </div>
                )}
                {task.claimed_by && <InfoRow label="领取者">{task.claimed_by}</InfoRow>}
                {task.claimed_at && (
                  <InfoRow label="领取时间">
                    <ClientOnlyText fallback="—" render={() => formatDate(task.claimed_at)} />
                  </InfoRow>
                )}
                {task.retry_count !== undefined && (
                  <InfoRow label="重试次数">
                    <span style={{ color: task.retryable ? "#16a34a" : "#64748b" }}>
                      {task.retry_count ?? 0} / {task.max_retries ?? 3}
                    </span>
                  </InfoRow>
                )}
                {task.retry_reason && <InfoRow label="重试原因">{task.retry_reason}</InfoRow>}
                {task.retryable !== undefined && (
                  <InfoRow label="可安全重试">
                    {task.retryable ? (
                      <span style={{ fontSize: "11px", color: "#16a34a" }}>✅ 是</span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#64748b" }}>❌ 否</span>
                    )}
                  </InfoRow>
                )}
              </div>
            </GlassPanel>

            {/* Memory */}
            <GlassPanel>
              <MemoryPanel task={task} onRefresh={fetchAll} />
            </GlassPanel>

            {/* Execution Timeline Summary */}
            <GlassPanel>
              <SectionHeader icon="⏱️" label="执行时间" />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <InfoRow label="创建">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.created_at)} />
                </InfoRow>
                <InfoRow label="开始">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.started_at)} />
                </InfoRow>
                <InfoRow label="完成">
                  <ClientOnlyText fallback="—" render={() => formatDate(task.completed_at)} />
                </InfoRow>
                <InfoRow label="耗时">{formatDuration(task.duration_seconds)}</InfoRow>
              </div>
            </GlassPanel>

            {/* Raw Metadata (collapsible) */}
            <details>
              <summary style={{
                fontSize: "11px",
                color: "#94a3b8",
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 0",
              }}>
                <span>▸</span> 原始元数据
              </summary>
              <pre style={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#94a3b8",
                background: "rgba(15,23,42,0.03)",
                padding: "10px",
                borderRadius: "10px",
                maxHeight: "240px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                margin: "8px 0 0",
              }}>
                {JSON.stringify(task, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
