"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  LiquidButton,
  LiquidBadge,
} from "@/components/liquid";
import { LightGlassPanel } from "@/components/liquid/LightGlassPanel";

const API_BASE = "/api";

interface CommMessage {
  id: number;
  message_id: string;
  project: string;
  conversation_id: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  title: string;
  content: string;
  related_task_id: string;
  priority: string;
  status: string;
  created_at: string;
  received_at: string;
  started_at: string;
  completed_at: string;
  result_summary: string;
  result_detail: string;
  error_message: string;
}

type QuickFilter = "all" | "codex_reports" | "needs_review";
type AgentFilter = "all" | "codex_hermes" | "hermes_codex" | "hermes_oc" | "oc_hermes";
type StatusFilter = "all" | string;

// Status → LiquidBadge tone mapping
function statusToTone(status: string): "cyan" | "violet" | "green" | "amber" | "red" | "slate" {
  switch (status) {
    case "sent":
    case "cancelled":
      return "slate";
    case "received":
      return "cyan";
    case "in_progress":
    case "needs_codex_review":
      return "violet";
    case "accepted":
      return "green";
    case "rejected":
      return "amber";
    case "failed":
      return "red";
    default:
      return "slate";
  }
}

// Agent display labels
function agentLabel(from: string, to: string): string {
  const map: Record<string, string> = {
    codex: "CX",
    hermes: "HM",
    openclaw: "OC",
  };
  return `${map[from] || from} → ${map[to] || to}`;
}

export default function CodexHermesPage() {
  const [messages, setMessages] = useState<CommMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<CommMessage | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("");

  const [copyFeedback, setCopyFeedback] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const norm = (value?: string | null) => (value || "").toLowerCase();

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    const fetchUrl = `${API_BASE}/comm/messages?limit=100`;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(fetchUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json && json.success === true && Array.isArray(json.data)) {
        setMessages(json.data);
      } else if (Array.isArray(json)) {
        setMessages(json);
      } else {
        console.warn("[CodexHermes] Unexpected comm response:", json);
        setMessages([]);
        setError("Unexpected communications response format.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[CodexHermes] Failed to fetch messages:", err);
      setError(message || "Failed to sync communications.");
      setMessages([]);
    } finally {
      setLoading(false);
      setLastSync(new Date());
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // ─── Filtering ───────────────────────────────────────────────────────────────

  const filteredMessages = messages.filter((msg) => {
    if (quickFilter === "codex_reports") {
      return norm(msg.from_agent) === "codex" && ["report", "review", "task"].includes(norm(msg.message_type));
    }
    if (quickFilter === "needs_review") {
      return norm(msg.status) === "needs_codex_review";
    }
    if (statusFilter !== "all" && norm(msg.status) !== statusFilter) return false;
    if (agentFilter === "codex_hermes") return norm(msg.from_agent) === "codex" && norm(msg.to_agent) === "hermes";
    if (agentFilter === "hermes_codex") return norm(msg.from_agent) === "hermes" && norm(msg.to_agent) === "codex";
    if (agentFilter === "hermes_oc") return norm(msg.from_agent) === "hermes" && norm(msg.to_agent) === "openclaw";
    if (agentFilter === "oc_hermes") return norm(msg.from_agent) === "openclaw" && norm(msg.to_agent) === "hermes";
    return true;
  });

  // ─── Derived counts ───────────────────────────────────────────────────────────

  const allMessagesCount = messages.length;
  const needsReviewCount = messages.filter((m) => norm(m.status) === "needs_codex_review").length;
  const codexReportsCount = messages.filter((m) => norm(m.from_agent) === "codex" && ["report", "review", "task"].includes(norm(m.message_type))).length;
  const workingCount = messages.filter((m) => norm(m.status) === "in_progress").length;

  const agentCounts = {
    all: messages.length,
    codex_hermes: messages.filter((m) => norm(m.from_agent) === "codex" && norm(m.to_agent) === "hermes").length,
    hermes_codex: messages.filter((m) => norm(m.from_agent) === "hermes" && norm(m.to_agent) === "codex").length,
    hermes_oc: messages.filter((m) => norm(m.from_agent) === "hermes" && norm(m.to_agent) === "openclaw").length,
    oc_hermes: messages.filter((m) => norm(m.from_agent) === "openclaw" && norm(m.to_agent) === "hermes").length,
  };

  const statusCounts = {
    sent: messages.filter((m) => norm(m.status) === "sent").length,
    received: messages.filter((m) => norm(m.status) === "received").length,
    in_progress: messages.filter((m) => norm(m.status) === "in_progress").length,
    needs_codex_review: messages.filter((m) => norm(m.status) === "needs_codex_review").length,
    accepted: messages.filter((m) => norm(m.status) === "accepted").length,
    rejected: messages.filter((m) => norm(m.status) === "rejected").length,
    failed: messages.filter((m) => norm(m.status) === "failed").length,
  };

  // ─── Actions (unchanged) ───────────────────────────────────────────────────

  const toggleExpand = (msgId: string) => {
    const newSet = new Set(expandedMessages);
    if (newSet.has(msgId)) newSet.delete(msgId);
    else newSet.add(msgId);
    setExpandedMessages(newSet);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch {
      setCopyFeedback("failed");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const updateMessageStatus = async (
    messageId: string,
    status: string,
    agent: string,
    resultSummary: string,
    resultDetail?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/comm/messages/${messageId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          agent,
          result_summary: resultSummary,
          ...(resultDetail && { result_detail: resultDetail }),
        }),
      });
      if (res.ok) {
        fetchMessages();
        setCopyFeedback(`status: ${status}`);
        setTimeout(() => setCopyFeedback(""), 2000);
      } else {
        setCopyFeedback("update failed");
        setTimeout(() => setCopyFeedback(""), 2000);
      }
    } catch {
      setCopyFeedback("update failed");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("zh-CN", { hour12: false });
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 0) return "";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getCurrentStatus = (msg: CommMessage): string => {
    if (msg.completed_at) {
      if (msg.status === "rejected") return "rejected";
      if (msg.status === "failed") return "failed";
      return msg.status;
    }
    if (msg.started_at) return "in_progress";
    if (msg.received_at) return "received";
    return "sent";
  };

  // ─── Message row renderer ────────────────────────────────────────────────────

  const renderMessageRow = (msg: CommMessage) => {
    const status = getCurrentStatus(msg);
    const isExpanded = expandedMessages.has(msg.message_id);
    const isSelected = selectedMessage?.message_id === msg.message_id;

    return (
      <div
        key={msg.message_id}
        className={`border-b cursor-pointer transition-all duration-150 ${
          isSelected
            ? "border-l-2 border-l-cyan-400"
            : "border-l-2 border-l-transparent hover:border-l-slate-600"
        }`}
        style={{
          background: isSelected ? "rgba(56,189,248,0.08)" : "transparent",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}
        onClick={() => {
          setSelectedMessage(msg);
          toggleExpand(msg.message_id);
        }}
      >
        {/* Row: time | route | type | status | title | task */}
        <div
          className="px-4 py-2 flex items-center gap-3 font-mono text-xs"
          style={{ color: "#94a3b8" }}
        >
          <span className="w-20 shrink-0" style={{ color: "#64748b" }}>
            {formatTime(msg.created_at)}
          </span>
          <span className="shrink-0" style={{ color: "#7dd3fc" }}>
            {agentLabel(msg.from_agent, msg.to_agent)}
          </span>
          <span
            className="shrink-0 px-1.5 py-0.5 rounded text-xs"
            style={{ background: "rgba(148,163,184,0.10)", color: "#94a3b8" }}
          >
            {msg.message_type}
          </span>
          <span className="shrink-0">
            <LiquidBadge tone={statusToTone(status)} size="sm" />
          </span>
          <span className="flex-1 truncate" style={{ color: "#f8fafc" }}>
            {msg.title || "(no title)"}
          </span>
          {msg.related_task_id && (
            <Link
              href={`/tasks/${msg.related_task_id}`}
              className="shrink-0 text-xs px-1.5 py-0.5 rounded transition-colors"
              style={{
                background: "rgba(251,191,36,0.10)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.20)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              @{msg.related_task_id.slice(-8)}
            </Link>
          )}
          {msg.completed_at && (
            <span className="shrink-0" style={{ color: "#64748b" }}>
              {getDuration(msg.started_at, msg.completed_at)}
            </span>
          )}
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div
            className="px-4 pb-3 pl-20 space-y-1 font-mono text-xs"
            style={{ color: "#94a3b8" }}
          >
            {msg.project && (
              <div>
                <span style={{ color: "#64748b" }}>project: </span>
                <span style={{ color: "#94a3b8" }}>{msg.project}</span>
              </div>
            )}
            {msg.conversation_id && (
              <div>
                <span style={{ color: "#64748b" }}>conv: </span>
                <span style={{ color: "#94a3b8" }}>{msg.conversation_id}</span>
              </div>
            )}
            <div
              className="pl-2 py-1 rounded"
              style={{
                borderLeft: "2px solid rgba(148,163,184,0.20)",
                background: "rgba(8,12,22,0.40)",
                color: "#e2e8f0",
              }}
            >
              {msg.content.split("\n").slice(0, isExpanded ? undefined : 3).map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {line.length > 200 ? line.slice(0, 200) + "..." : line}
                </div>
              ))}
              {msg.content.split("\n").length > 3 && !isExpanded && (
                <div style={{ color: "#64748b", marginTop: "4px" }}>
                  ... ({msg.content.split("\n").length} lines)
                </div>
              )}
            </div>
            {msg.result_summary && (
              <div
                className="pl-2 py-1 rounded"
                style={{
                  borderLeft: "2px solid rgba(34,197,94,0.40)",
                  background: "rgba(34,197,94,0.06)",
                  color: "#4ade80",
                }}
              >
                result: {msg.result_summary}
              </div>
            )}
            {msg.error_message && (
              <div
                className="pl-2 py-1 rounded"
                style={{
                  borderLeft: "2px solid rgba(248,113,113,0.40)",
                  background: "rgba(248,113,113,0.06)",
                  color: "#f87171",
                }}
              >
                error: {msg.error_message}
              </div>
            )}
            <div style={{ color: "#4b5563", paddingTop: "4px", cursor: "pointer" }}>
              [click to collapse]
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Filter button helper ───────────────────────────────────────────────────

  function FilterBtn({
    label,
    count,
    active,
    color,
    onClick,
  }: {
    label: string;
    count: number;
    active: boolean;
    color?: string;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between rounded-xl transition-all duration-150"
        style={{
          background: active ? "rgba(56,189,248,0.10)" : "transparent",
          border: `1px solid ${active ? "rgba(56,189,248,0.25)" : "transparent"}`,
          color: active ? (color || "#7dd3fc") : "#94a3b8",
        }}
      >
        <span className="truncate">{label}</span>
        <span
          className="ml-2 text-xs shrink-0 px-1.5 py-0.5 rounded-full"
          style={{
            background: active ? "rgba(56,189,248,0.15)" : "rgba(148,163,184,0.10)",
            color: active ? (color || "#7dd3fc") : "#64748b",
          }}
        >
          {count}
        </span>
      </button>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell>
    <div
      className="relative min-h-screen"
      style={{
        background: "#05070a",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {/* Dark aurora background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 18% 14%, rgba(56,189,248,0.10) 0%, transparent 34%),
            radial-gradient(circle at 82% 16%, rgba(167,139,250,0.10) 0%, transparent 36%),
            radial-gradient(circle at 56% 92%, rgba(244,114,182,0.06) 0%, transparent 42%),
            linear-gradient(135deg, #05070a 0%, #07111f 46%, #05070a 100%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.30,
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(circle at 50% 45%, black, transparent 76%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, black, transparent 76%)",
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 px-5 py-3 flex items-center justify-between shrink-0"
        style={{
          background: "rgba(5, 7, 14, 0.72)",
          backdropFilter: "blur(26px) saturate(160%)",
          WebkitBackdropFilter: "blur(26px) saturate(160%)",
          borderBottom: "1px solid rgba(148,163,184,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
        }}
      >
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: "#7dd3fc" }}>
            SUPERCOLOR AI OS
          </span>
          <span style={{ color: "#4b5563" }}>/</span>
          <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>
            Agent Communications
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
            />
            <span className="text-xs" style={{ color: "#22c55e" }}>
              live
            </span>
          </div>
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1">
            <span style={{ color: "#64748b" }}>Messages</span>
            <span className="font-mono font-medium" style={{ color: "#f8fafc" }}>
              {allMessagesCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: "#64748b" }}>Review</span>
            <span
              className="font-mono font-medium"
              style={{ color: needsReviewCount > 0 ? "#a78bfa" : "#64748b" }}
            >
              {needsReviewCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: "#64748b" }}>Working</span>
            <span
              className="font-mono font-medium"
              style={{ color: workingCount > 0 ? "#fbbf24" : "#64748b" }}
            >
              {workingCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#64748b" }}
            />
            <span style={{ color: "#64748b" }}>sync {lastSync ? lastSync.toLocaleTimeString("zh-CN", { hour12: false }) : "Never"}</span>
          </div>
        </div>
      </div>

      {/* Small debug footer */}
      <div className="px-4 py-1 text-xs font-mono" style={{ background: "rgba(5,7,14,0.6)", borderTop: "1px solid rgba(148,163,184,0.08)", color: "#475569" }}>
        {error
          ? <span style={{ color: "#f87171" }}>⚠ {error}</span>
          : <span>GET /api/comm/messages → {messages.length} msgs | filtered {filteredMessages.length} | sync {lastSync ? lastSync.toLocaleTimeString("zh-CN", { hour12: false }) : "Never"}</span>
        }
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-[calc(100vh-56px)] overflow-hidden">

        {/* ── Left Sidebar: Filters ─────────────────────────────────────────── */}
        <aside
          className="w-56 flex flex-col shrink-0 overflow-y-auto border-r"
          style={{
            background: "rgba(8, 12, 22, 0.58)",
            backdropFilter: "blur(26px) saturate(160%)",
            WebkitBackdropFilter: "blur(26px) saturate(160%)",
            borderRight: "1px solid rgba(148,163,184,0.10)",
          }}
        >
          {/* Quick Filters */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          >
            <div
              className="text-xs font-semibold mb-2 tracking-wider"
              style={{ color: "#64748b" }}
            >
              QUICK FILTER
            </div>
            <div className="space-y-1">
              <FilterBtn
                label="All Messages"
                count={allMessagesCount}
                active={quickFilter === "all"}
                onClick={() => { setQuickFilter("all"); setAgentFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="Codex Reports"
                count={codexReportsCount}
                active={quickFilter === "codex_reports"}
                color="#38bdf8"
                onClick={() => { setQuickFilter("codex_reports"); setAgentFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="Needs Review"
                count={needsReviewCount}
                active={quickFilter === "needs_review"}
                color="#a78bfa"
                onClick={() => { setQuickFilter("needs_review"); setAgentFilter("all"); setStatusFilter("all"); }}
              />
            </div>
          </div>

          {/* Agent Route */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          >
            <div
              className="text-xs font-semibold mb-2 tracking-wider"
              style={{ color: "#64748b" }}
            >
              AGENT ROUTE
            </div>
            <div className="space-y-1">
              <FilterBtn
                label="All"
                count={agentCounts.all}
                active={agentFilter === "all"}
                onClick={() => { setAgentFilter("all"); setQuickFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="CX → HM"
                count={agentCounts.codex_hermes}
                active={agentFilter === "codex_hermes"}
                color="#38bdf8"
                onClick={() => { setAgentFilter("codex_hermes"); setQuickFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="HM → CX"
                count={agentCounts.hermes_codex}
                active={agentFilter === "hermes_codex"}
                color="#22c55e"
                onClick={() => { setAgentFilter("hermes_codex"); setQuickFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="HM → OC"
                count={agentCounts.hermes_oc}
                active={agentFilter === "hermes_oc"}
                color="#fb923c"
                onClick={() => { setAgentFilter("hermes_oc"); setQuickFilter("all"); setStatusFilter("all"); }}
              />
              <FilterBtn
                label="OC → HM"
                count={agentCounts.oc_hermes}
                active={agentFilter === "oc_hermes"}
                color="#fbbf24"
                onClick={() => { setAgentFilter("oc_hermes"); setQuickFilter("all"); setStatusFilter("all"); }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}
          >
            <div
              className="text-xs font-semibold mb-2 tracking-wider"
              style={{ color: "#64748b" }}
            >
              STATUS
            </div>
            <div className="space-y-1">
              {([
                { key: "all", label: "All", count: messages.length },
                { key: "sent", label: "Sent", count: statusCounts.sent },
                { key: "received", label: "Received", count: statusCounts.received },
                { key: "in_progress", label: "Working", count: statusCounts.in_progress },
                { key: "needs_codex_review", label: "Review", count: statusCounts.needs_codex_review },
                { key: "accepted", label: "Accepted", count: statusCounts.accepted },
                { key: "rejected", label: "Rejected", count: statusCounts.rejected },
                { key: "failed", label: "Failed", count: statusCounts.failed },
              ] as { key: StatusFilter; label: string; count: number }[]).map((item) => (
                <FilterBtn
                  key={item.key}
                  label={item.label}
                  count={item.count}
                  active={statusFilter === item.key}
                  onClick={() => { setStatusFilter(item.key); setQuickFilter("all"); setAgentFilter("all"); }}
                />
              ))}
            </div>
          </div>

          {/* Project filter */}
          <div className="p-3">
            <div
              className="text-xs font-semibold mb-2 tracking-wider"
              style={{ color: "#64748b" }}
            >
              PROJECT
            </div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border outline-none"
              style={{
                background: "rgba(8,12,22,0.60)",
                border: "1px solid rgba(148,163,184,0.12)",
                color: "#e2e8f0",
              }}
            >
              <option value="" style={{ background: "#0a0f1e" }}>
                all projects
              </option>
              {[...new Set(messages.map((m) => m.project).filter(Boolean))].map((p) => (
                <option key={p} value={p} style={{ background: "#0a0f1e" }}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Legend */}
          <div className="mt-auto p-3" style={{ borderTop: "1px solid rgba(148,163,184,0.08)" }}>
            <div className="text-xs" style={{ color: "#64748b" }}>
              <div className="mb-1.5 font-semibold tracking-wider">STATUS:</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <span style={{ color: "#94a3b8" }}>■ slate</span>
                <span style={{ color: "#7dd3fc" }}>■ cyan</span>
                <span style={{ color: "#a78bfa" }}>■ violet</span>
                <span style={{ color: "#4ade80" }}>■ green</span>
                <span style={{ color: "#fbbf24" }}>■ amber</span>
                <span style={{ color: "#f87171" }}>■ red</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Center: Message Stream ────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Stream header */}
          <div
            className="px-4 py-2 flex items-center gap-3 text-xs font-semibold shrink-0 tracking-wider"
            style={{
              background: "rgba(10, 15, 28, 0.64)",
              backdropFilter: "blur(26px)",
              WebkitBackdropFilter: "blur(26px)",
              borderBottom: "1px solid rgba(148,163,184,0.10)",
              color: "#64748b",
            }}
          >
            <span className="w-20">TIME</span>
            <span className="w-20">ROUTE</span>
            <span className="w-20">TYPE</span>
            <span className="w-20">STATUS</span>
            <span className="flex-1">TITLE</span>
            <span className="w-16">DURATION</span>
          </div>

          {/* Stream entries */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ background: "rgba(5, 7, 14, 0.40)" }}
          >
            {loading && messages.length === 0 ? (
              <div
                className="p-6 text-sm text-center"
                style={{ color: "#64748b" }}
              >
                <div className="mb-2 text-lg">◌</div>
                syncing communications...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div
                className="p-6 text-sm text-center"
                style={{ color: "#64748b" }}
              >
                <div className="mb-2">◇</div>
                {messages.length === 0
                  ? "waiting for agent traffic..."
                  : "no messages match the current filters."}
              </div>
            ) : (
              filteredMessages.map(renderMessageRow)
            )}
          </div>
        </main>

        {/* ── Right: Detail Inspector ──────────────────────────────────────── */}
        <aside
          className="w-80 overflow-y-auto shrink-0"
          style={{
            background: "rgba(5, 7, 14, 0.72)",
            backdropFilter: "blur(26px) saturate(160%)",
            WebkitBackdropFilter: "blur(26px) saturate(160%)",
            borderLeft: "1px solid rgba(148,163,184,0.10)",
          }}
        >
          {selectedMessage ? (
            <div className="p-4 space-y-4 text-xs font-mono">
              {/* Copy feedback */}
              {copyFeedback && (
                <div
                  className="px-2.5 py-1.5 rounded-xl text-xs"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.24)",
                    color: "#4ade80",
                  }}
                >
                  {copyFeedback}
                </div>
              )}

              {/* Inspector title */}
              <div className="text-sm font-semibold" style={{ color: "#f8fafc" }}>
                MESSAGE DETAIL
              </div>

              {/* Copy actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyToClipboard(selectedMessage.message_id, "copied: message_id")}
                  className="px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 hover:translate-y-[-1px]"
                  style={{
                    background: "rgba(148,163,184,0.10)",
                    border: "1px solid rgba(148,163,184,0.14)",
                    color: "#94a3b8",
                  }}
                >
                  copy id
                </button>
                <button
                  onClick={() => copyToClipboard(selectedMessage.content, "copied: content")}
                  className="px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 hover:translate-y-[-1px]"
                  style={{
                    background: "rgba(148,163,184,0.10)",
                    border: "1px solid rgba(148,163,184,0.14)",
                    color: "#94a3b8",
                  }}
                >
                  copy content
                </button>
                {selectedMessage.result_detail && (
                  <button
                    onClick={() => copyToClipboard(selectedMessage.result_detail, "copied: result")}
                    className="px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 hover:translate-y-[-1px]"
                    style={{
                      background: "rgba(148,163,184,0.10)",
                      border: "1px solid rgba(148,163,184,0.14)",
                      color: "#94a3b8",
                    }}
                  >
                    copy result
                  </button>
                )}
              </div>

              {/* Accept / Reject */}
              {selectedMessage.status === "needs_codex_review" && (
                <div
                  className="flex gap-2 pt-2"
                  style={{ borderTop: "1px solid rgba(148,163,184,0.10)" }}
                >
                  <button
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage.message_id,
                        "accepted",
                        "codex",
                        "Codex review accepted"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:translate-y-[-1px]"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.30)",
                      color: "#4ade80",
                    }}
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() =>
                      updateMessageStatus(
                        selectedMessage.message_id,
                        "rejected",
                        "codex",
                        "Codex review rejected",
                        "请继续修复，等待 Codex 补充复检意见。"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:translate-y-[-1px]"
                    style={{
                      background: "rgba(248,113,113,0.12)",
                      border: "1px solid rgba(248,113,113,0.30)",
                      color: "#f87171",
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {/* Detail fields */}
              <div className="space-y-2.5">
                {/* Status badge row */}
                <div className="flex items-center gap-2">
                  <span style={{ color: "#64748b" }}>status</span>
                  <LiquidBadge tone={statusToTone(selectedMessage.status)} size="sm" />
                </div>

                <FieldRow label="message_id" value={selectedMessage.message_id} color="#7dd3fc" mono />
                <FieldRow label="from_agent" value={selectedMessage.from_agent} color="#38bdf8" />
                <FieldRow label="to_agent" value={selectedMessage.to_agent} color="#4ade80" />
                <FieldRow label="message_type" value={selectedMessage.message_type} />
                <FieldRow
                  label="priority"
                  value={selectedMessage.priority}
                  color={selectedMessage.priority === "high" ? "#f87171" : "#94a3b8"}
                />
                <FieldRow label="project" value={selectedMessage.project || "—"} />
                <FieldRow label="conversation" value={selectedMessage.conversation_id || "—"} />
                <FieldRow
                  label="related_task"
                  value={selectedMessage.related_task_id ? `@${selectedMessage.related_task_id}` : "—"}
                  link={selectedMessage.related_task_id ? `/tasks/${selectedMessage.related_task_id}` : undefined}
                  linkColor="#fbbf24"
                />

                {/* Timestamps */}
                <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: "8px" }}>
                  <div className="mb-1.5 text-xs font-semibold tracking-wider" style={{ color: "#64748b" }}>
                    TIMESTAMPS
                  </div>
                  {selectedMessage.created_at && (
                    <FieldRow label="created" value={formatTime(selectedMessage.created_at)} />
                  )}
                  {selectedMessage.received_at && (
                    <FieldRow label="received" value={formatTime(selectedMessage.received_at)} color="#7dd3fc" />
                  )}
                  {selectedMessage.started_at && (
                    <FieldRow label="started" value={formatTime(selectedMessage.started_at)} color="#fbbf24" />
                  )}
                  {selectedMessage.completed_at && (
                    <>
                      <FieldRow label="completed" value={formatTime(selectedMessage.completed_at)} color="#a78bfa" />
                      <FieldRow
                        label="duration"
                        value={getDuration(selectedMessage.started_at, selectedMessage.completed_at)}
                        color="#a78bfa"
                      />
                    </>
                  )}
                </div>

                {/* Content */}
                <div style={{ borderTop: "1px solid rgba(148,163,184,0.08)", paddingTop: "8px" }}>
                  <div className="mb-1.5 text-xs font-semibold tracking-wider" style={{ color: "#64748b" }}>
                    CONTENT
                  </div>
                  <div
                    className="p-2.5 rounded-xl text-xs whitespace-pre-wrap break-all max-h-40 overflow-y-auto"
                    style={{
                      background: "rgba(8,12,22,0.60)",
                      border: "1px solid rgba(148,163,184,0.10)",
                      color: "#e2e8f0",
                    }}
                  >
                    {selectedMessage.content}
                  </div>
                </div>

                {/* Result summary */}
                {selectedMessage.result_summary && (
                  <div>
                    <div className="mb-1.5 text-xs font-semibold tracking-wider" style={{ color: "#64748b" }}>
                      RESULT SUMMARY
                    </div>
                    <div
                      className="p-2.5 rounded-xl text-xs"
                      style={{
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.20)",
                        color: "#4ade80",
                      }}
                    >
                      {selectedMessage.result_summary}
                    </div>
                  </div>
                )}

                {/* Result detail */}
                {selectedMessage.result_detail && (
                  <div>
                    <div className="mb-1.5 text-xs font-semibold tracking-wider" style={{ color: "#64748b" }}>
                      RESULT DETAIL
                    </div>
                    <div
                      className="p-2.5 rounded-xl text-xs whitespace-pre-wrap break-all max-h-48 overflow-y-auto"
                      style={{
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.20)",
                        color: "#4ade80",
                      }}
                    >
                      {selectedMessage.result_detail}
                    </div>
                  </div>
                )}

                {/* Error */}
                {selectedMessage.error_message && (
                  <div>
                    <div className="mb-1.5 text-xs font-semibold tracking-wider" style={{ color: "#64748b" }}>
                      ERROR
                    </div>
                    <div
                      className="p-2.5 rounded-xl text-xs"
                      style={{
                        background: "rgba(248,113,113,0.06)",
                        border: "1px solid rgba(248,113,113,0.20)",
                        color: "#f87171",
                      }}
                    >
                      {selectedMessage.error_message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center text-xs p-4"
              style={{ color: "#4b5563" }}
            >
              <div className="mb-3 text-2xl">◇</div>
              <div style={{ color: "#64748b" }}>select a message</div>
              <div style={{ color: "#4b5563" }}>to inspect details</div>
            </div>
          )}
        </aside>
      </div>
    </div>
    </AppShell>
  );
}

// ─── Helper: field row ─────────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  color,
  mono,
  link,
  linkColor,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
  link?: string;
  linkColor?: string;
}) {
  const content = link ? (
    <Link
      href={link}
      className="underline"
      style={{ color: linkColor || "#7dd3fc" }}
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </Link>
  ) : (
    <span style={{ color: color || "#e2e8f0" }} className={mono ? "font-mono break-all" : ""}>
      {value}
    </span>
  );

  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 w-24" style={{ color: "#64748b" }}>
        {label}
      </span>
      {content}
    </div>
  );
}
