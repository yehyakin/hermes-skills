"use client";

import { useState, useCallback } from "react";
import { usePolling } from "@/usePolling";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { ClientOnlyText } from "@/components/ClientOnlyText";
import { LightGlassPanel as GlassPanel, GlassCard } from "@/components/liquid/LightGlassPanel";

const API = "/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDataArray<T>(json: unknown, field = "data"): T[] {
  if (Array.isArray(json)) return json as T[];
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as Record<string, unknown>)[field])
  ) {
    return (json as Record<string, T[]>)[field];
  }
  return [];
}

const norm = (v?: string | null) => (v || "").toLowerCase();

function taskTone(
  status: string
): "green" | "cyan" | "amber" | "red" | "violet" | "slate" {
  switch (norm(status)) {
    case "completed":
      return "green";
    case "running":
    case "external_polling":
      return "cyan";
    case "pending":
    case "waiting_for_agent":
    case "pending_confirmation":
      return "amber";
    case "failed":
    case "external_failed":
      return "red";
    case "needs_codex_review":
      return "violet";
    case "recoverable_timeout":
      return "amber";
    default:
      return "slate";
  }
}

function taskLabel(status: string): string {
  switch (norm(status)) {
    case "completed":
      return "已完成";
    case "running":
      return "运行中";
    case "external_polling":
      return "轮询中";
    case "pending":
      return "等待中";
    case "waiting_for_agent":
      return "等待智能体";
    case "pending_confirmation":
      return "待确认";
    case "failed":
      return "失败";
    case "external_failed":
      return "外部失败";
    case "needs_codex_review":
      return "待复核";
    case "recoverable_timeout":
      return "可恢复超时";
    case "cancelled":
      return "已取消";
    case "dry_run_pending":
      return "Dry Run 待确认";
    default:
      return status;
  }
}

function agentTone(
  derived: string
): "green" | "cyan" | "amber" | "red" | "violet" | "slate" {
  switch (derived) {
    case "online":
      return "green";
    case "busy":
      return "violet";
    case "stale":
    case "worker_stalled":
      return "amber";
    case "offline":
    case "worker_error":
      return "red";
    case "webhook":
    case "external":
    case "adapter":
      return "cyan";
    default:
      return "slate";
  }
}

function agentLabel(derived: string): string {
  switch (derived) {
    case "online":
      return "在线";
    case "busy":
      return "忙碌";
    case "stale":
      return "延迟";
    case "offline":
      return "离线";
    case "worker_stalled":
      return "Worker 停滞";
    case "worker_error":
      return "Worker 错误";
    case "webhook":
      return "Webhook";
    case "external":
      return "外部服务";
    case "adapter":
      return "适配器";
    default:
      return derived;
  }
}

function formatDuration(secs?: number | null) {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function riskLabel(level: string): string {
  switch (norm(level)) {
    case "high":
    case "critical":
      return "高风险";
    case "medium":
      return "中风险";
    case "low":
      return "低风险";
    default:
      return "—";
  }
}

function commLabel(status: string): string {
  switch (norm(status)) {
    case "needs_codex_review":
      return "待 Codex 复核";
    case "accepted":
      return "已接受";
    case "rejected":
      return "已拒绝";
    case "received":
      return "已接收";
    case "in_progress":
      return "处理中";
    case "sent":
      return "已发送";
    default:
      return status;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agent {
  id: number;
  agent_name: string;
  derived_status: string;
  status_source: string;
  status_note: string;
  last_heartbeat?: string;
}

interface Task {
  id: string;
  task_id: string;
  status: string;
  risk_level: string;
  billing_risk_level?: string;
  assigned_agent: string;
  project?: string;
  task_type?: string;
  created_at: string;
  started_at?: string;
  duration_seconds?: number;
}

interface CommMessage {
  id: number;
  from_agent: string;
  to_agent: string;
  status: string;
  title: string;
  created_at: string;
}

interface Risk {
  id: string;
  risk_level: string;
  status: string;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commMessages, setCommMessages] = useState<CommMessage[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    const endpoints = [
      { key: "agents", url: `${API}/agents` },
      { key: "tasks", url: `${API}/tasks?limit=20` },
      { key: "comm", url: `${API}/comm/messages?limit=5` },
      { key: "risks", url: `${API}/risks` },
    ];

    const settled = await Promise.allSettled(
      endpoints.map(async ({ key, url }) => {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { key, data: await res.json() };
      })
    );

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const { key, data } = result.value;
      switch (key) {
        case "agents":
          setAgents(getDataArray<Agent>(data));
          break;
        case "tasks":
          setTasks(getDataArray<Task>(data));
          break;
        case "comm":
          setCommMessages(getDataArray<CommMessage>(data));
          break;
        case "risks":
          setRisks(getDataArray<Risk>(data));
          break;
      }
    }

    setLoading(false);
    setLastSync(new Date());
  }, []);

  usePolling(fetchAll, 10000);

  // ─── KPIs ──────────────────────────────────────────────────────────────────

  const runningCount = tasks.filter((t) =>
    ["running", "external_polling"].includes(norm(t.status))
  ).length;
  const pendingCount = tasks.filter((t) =>
    ["pending", "waiting_for_agent", "pending_confirmation"].includes(
      norm(t.status)
    )
  ).length;
  const completedCount = tasks.filter(
    (t) => norm(t.status) === "completed"
  ).length;
  const failedCount = tasks.filter((t) =>
    ["failed", "external_failed"].includes(norm(t.status))
  ).length;
  const needsReviewCount = tasks.filter(
    (t) => norm(t.status) === "needs_codex_review"
  ).length;
  const pendingRisks = risks.filter((r) =>
    ["pending", "pending_confirmation"].includes(norm(r.status))
  ).length;
  const pendingReviewComm = commMessages.filter(
    (m) => norm(m.status) === "needs_codex_review"
  ).length;
  const highBilling = tasks.filter((t) =>
    ["high", "critical"].includes(norm(t.billing_risk_level))
  ).length;
  const totalCount = tasks.length;

  // External API counts
  const pollingCount = tasks.filter(
    (t) => norm(t.status) === "external_polling"
  ).length;
  const externalFailedCount = tasks.filter(
    (t) => norm(t.status) === "external_failed"
  ).length;
  const recoverableCount = tasks.filter(
    (t) => norm(t.status) === "recoverable_timeout"
  ).length;

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppShell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(15,23,42,0.08)",
              borderTopColor: "#0891b2",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#64748b", fontSize: "14px" }}>加载中...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            AI OS 总览
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#334155",
              margin: "4px 0 0",
            }}
          >
            统一查看任务、智能体、风险、通信与男装工作流状态。
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            href="/tasks"
            style={{
              padding: "8px 16px",
              background: "#0891b2",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            新建任务
          </Link>
          <Link
            href="/tasks"
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.72)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              textDecoration: "none",
            }}
          >
            查看任务
          </Link>
          <Link
            href="/menswear"
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.72)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              textDecoration: "none",
            }}
          >
            进入男装工作流
          </Link>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <GlassPanel style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
          }}
        >
          {[
            { label: "任务总数", value: totalCount, tone: "slate" as const },
            { label: "运行中", value: runningCount, tone: "cyan" as const },
            { label: "等待中", value: pendingCount, tone: "amber" as const },
            { label: "已完成", value: completedCount, tone: "green" as const },
            { label: "失败", value: failedCount, tone: "red" as const },
            {
              label: "待复核",
              value:
                needsReviewCount + pendingRisks + pendingReviewComm,
              tone: "violet" as const,
            },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                padding: "16px",
                borderRight: "1px solid rgba(15,23,42,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {m.label}
              </span>
              <StatusPill type={m.tone} label={String(m.value)} />
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* ── Main Grid 7:3 ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "7fr 3fr",
          gap: "16px",
          width: "100%",
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Recent Tasks */}
          <GlassPanel
            title="最近任务"
            bodyPadding={0}
            rightElement={
              <Link
                href="/tasks"
                style={{
                  fontSize: "12px",
                  color: "#0891b2",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                查看全部 →
              </Link>
            }
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 3fr 1.5fr 1fr 1fr 1fr",
                padding: "8px 18px",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                fontSize: "11px",
                fontWeight: 600,
                color: "#94a3b8",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <div>ID</div>
              <div>任务</div>
              <div>智能体</div>
              <div>状态</div>
              <div>风险</div>
              <div style={{ textAlign: "right" }}>创建</div>
            </div>

            {tasks.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                暂无任务
              </div>
            ) : (
              tasks.slice(0, 10).map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.task_id}`}
                  prefetch={false}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 3fr 1.5fr 1fr 1fr 1fr",
                    padding: "12px 18px",
                    borderBottom: "1px solid rgba(15,23,42,0.04)",
                    fontSize: "14px",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                    transition: "background-color 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(15,23,42,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  {/* ID */}
                  <div
                    style={{
                      fontFamily: "monospace",
                      color: "#0891b2",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {task.task_id}
                  </div>
                  {/* Task */}
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.project || task.task_type || "—"}
                  </div>
                  {/* Agent */}
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.assigned_agent || "—"}
                  </div>
                  {/* Status */}
                  <div>
                    <StatusPill
                      type={taskTone(task.status)}
                      label={taskLabel(task.status)}
                    />
                  </div>
                  {/* Risk */}
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color:
                        task.billing_risk_level === "high" ||
                        task.billing_risk_level === "critical"
                          ? "#dc2626"
                          : task.billing_risk_level === "medium"
                            ? "#d97706"
                            : "#94a3b8",
                    }}
                  >
                    {riskLabel(task.billing_risk_level ?? "")}
                  </div>
                  {/* Created (client-only) */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  >
                    <ClientOnlyText
                      fallback="--"
                      render={() => {
                        const diff =
                          Date.now() - new Date(task.created_at).getTime();
                        const mins = Math.floor(diff / 60000);
                        if (mins < 1) return "刚刚";
                        if (mins < 60) return `${mins}m`;
                        const hrs = Math.floor(mins / 60);
                        if (hrs < 24) return `${hrs}h`;
                        return `${Math.floor(hrs / 24)}d`;
                      }}
                    />
                  </div>
                </Link>
              ))
            )}
          </GlassPanel>

          {/* External API */}
          <GlassPanel title="外部 API">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
              {[
                {
                  label: "轮询中",
                  value: pollingCount,
                  tone: "cyan" as const,
                },
                {
                  label: "可恢复超时",
                  value: recoverableCount,
                  tone: "amber" as const,
                },
                {
                  label: "外部失败",
                  value: externalFailedCount,
                  tone: "red" as const,
                },
                {
                  label: "扣费风险",
                  value: highBilling,
                  tone: "red" as const,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(15,23,42,0.05)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#334155" }}>
                    {s.label}
                  </span>
                  <StatusPill type={s.tone} label={String(s.value)} />
                </div>
              ))}
            </div>
          </GlassPanel>

        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Agent Health */}
          <GlassPanel title="智能体状态">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {agents.length === 0 ? (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    padding: "8px 0",
                    gridColumn: "1/-1",
                  }}
                >
                  暂无智能体数据
                </div>
              ) : (
                agents.slice(0, 6).map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      background: "rgba(248,250,252,0.8)",
                      border: "1px solid rgba(15,23,42,0.07)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "12px",
                          color: "#0f172a",
                        }}
                      >
                        {agent.agent_name}
                      </span>
                      <StatusPill
                        type={agentTone(agent.derived_status)}
                        label={agentLabel(agent.derived_status)}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        lineHeight: "1.4",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {agent.status_note || agent.status_source || "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          {/* Risks & Review */}
          <GlassPanel title="风险与复核">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                {
                  label: "待确认风险",
                  value: pendingRisks,
                  tone: "amber" as const,
                },
                {
                  label: "Codex 待复核",
                  value: pendingReviewComm,
                  tone: "violet" as const,
                },
                {
                  label: "扣费风险任务",
                  value: highBilling,
                  tone: "red" as const,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(15,23,42,0.05)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#334155" }}>
                    {s.label}
                  </span>
                  <StatusPill type={s.tone} label={String(s.value)} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <Link
                href="/risks"
                style={{
                  flex: 1,
                  padding: "8px",
                  textAlign: "center",
                  background: "#0891b2",
                  color: "#fff",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                查看风险
              </Link>
              <Link
                href="/codex-hermes"
                style={{
                  flex: 1,
                  padding: "8px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.72)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                查看通信
              </Link>
            </div>
          </GlassPanel>

          {/* Comm Preview */}
          <GlassPanel
            title="最新通信"
            rightElement={
              <Link
                href="/codex-hermes"
                style={{
                  fontSize: "11px",
                  color: "#0891b2",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                更多 →
              </Link>
            }
          >
            {commMessages.length === 0 ? (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  padding: "8px 0",
                }}
              >
                暂无通信
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {commMessages.slice(0, 5).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "10px 12px",
                      background: "rgba(248,250,252,0.8)",
                      borderRadius: "10px",
                      border: "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#0f172a",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {msg.title ||
                        `${msg.from_agent} → ${msg.to_agent}`}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {msg.from_agent}
                      </span>
                      <StatusPill
                        type={
                          norm(msg.status) === "needs_codex_review"
                            ? "violet"
                            : "cyan"
                        }
                        label={commLabel(msg.status)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Menswear Quick Entry */}
          <GlassPanel title="男装 AI 工作流">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <p style={{ margin: 0 }}>
                上传素材、生成穿搭图、管理男装工作流任务与状态。
              </p>
              <Link
                href="/menswear"
                style={{
                  display: "block",
                  padding: "10px",
                  textAlign: "center",
                  background: "#0891b2",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                进入男装工作流
              </Link>
            </div>
          </GlassPanel>

        </div>
      </div>

      {/* Sync indicator */}
      {lastSync && (
        <div
          style={{
            marginTop: "16px",
            fontSize: "11px",
            color: "#94a3b8",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ color: "#22c55e" }}>●</span>
          <span>已同步 </span>
          <ClientOnlyText
            fallback="--:--"
            render={() =>
              lastSync.toLocaleTimeString("zh-CN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />
        </div>
      )}
    </AppShell>
  );
}
