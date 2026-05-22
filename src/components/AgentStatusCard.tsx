"use client";
import { useState, useEffect } from "react";
import { ClientOnlyText } from "@/components/ClientOnlyText";
interface Agent {
  id: number;
  agent_name: string;
  status: string;
  derived_status: string;
  current_task_id?: string;
  last_heartbeat?: string;
  status_source: string;
  status_note: string;
  capabilities?: string;
  version?: string;
  runtime_host?: string;
  today_completed: number;
  today_failed: number;
  avg_duration_seconds: number;
  worker_status?: string;
  worker_last_poll?: string;
  worker_stale?: boolean;
}

interface AgentStatusCardProps {
  agent: Agent;
}

// derived_status → display config
const derivedStatusConfig: Record<
  string,
  { color: string; bgColor: string; icon: string; label: string }
> = {
  online:   { color: "text-green-700",   bgColor: "bg-green-50 border-green-200",   icon: "🟢", label: "Online" },
  busy:     { color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: "🟡", label: "Busy" },
  worker_stalled: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: "⚠️", label: "Worker Stalled" },
  worker_error:  { color: "text-red-800", bgColor: "bg-red-100 border-red-300", icon: "🔴", label: "Worker Error" },
  stale:    { color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", icon: "🟠", label: "Stale" },
  offline:  { color: "text-gray-700",   bgColor: "bg-gray-50 border-gray-200",     icon: "⚫", label: "Offline" },
  unmanaged:{ color: "text-slate-700",  bgColor: "bg-slate-50 border-slate-200",   icon: "⚪", label: "Unmanaged" },
  webhook:  { color: "text-blue-700",   bgColor: "bg-blue-50 border-blue-200",    icon: "🔗", label: "Webhook" },
  external: { color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "☁️", label: "External" },
  adapter:  { color: "text-cyan-700",   bgColor: "bg-cyan-50 border-cyan-200",     icon: "🔌", label: "Adapter" },
  error:    { color: "text-red-700",    bgColor: "bg-red-50 border-red-200",      icon: "🔴", label: "Error" },
};

function formatDuration(seconds?: number): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatHeartbeat(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function AgentStatusCard({ agent }: AgentStatusCardProps) {
  // Use derived_status for display; fallback to raw status for unknown types
  const config =
    derivedStatusConfig[agent.derived_status] || derivedStatusConfig.unmanaged;
  const failRate =
    agent.today_completed + agent.today_failed > 0
      ? (
          (agent.today_failed /
            (agent.today_completed + agent.today_failed)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className={`rounded-xl shadow-md p-6 border ${config.bgColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{agent.agent_name}</h3>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color} border`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Status note for unmanaged / webhook / external / adapter */}
      {agent.status_note && (
        <div className="mb-3 text-xs text-gray-500 bg-white bg-opacity-60 rounded px-2 py-1">
          💬 {agent.status_note}
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Current Task:</span>
          <span className="text-gray-700 font-mono text-xs">
            {agent.current_task_id || "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Today Completed:</span>
          <span className="text-green-600 font-medium">
            {agent.today_completed}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Today Failed:</span>
          <span className="text-red-600 font-medium">{agent.today_failed}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Fail Rate:</span>
          <span
            className={`font-medium ${
              parseFloat(failRate) > 20 ? "text-red-600" : "text-gray-700"
            }`}
          >
            {failRate}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Avg Duration:</span>
          <span className="text-gray-700">
            {formatDuration(agent.avg_duration_seconds)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Last Heartbeat:</span>
          <span className="text-gray-700">
            <ClientOnlyText fallback="--" render={() => formatHeartbeat(agent.last_heartbeat)} />
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Source:</span>
          <span className="text-gray-700 text-xs">{agent.status_source}</span>
        </div>

        {(agent.worker_status || agent.worker_last_poll) && (
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Worker Status:</span>
              <span className={`text-xs font-medium ${
                agent.worker_status === 'busy' ? 'text-yellow-600' :
                agent.worker_status === 'error' ? 'text-red-600' :
                'text-green-600'
              }`}>
                {agent.worker_status || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Last Poll:</span>
              <span className={`text-xs ${
                agent.worker_stale ? 'text-red-600 font-medium' : 'text-gray-600'
              }`}>
                <ClientOnlyText
                  fallback="—"
                  render={() => agent.worker_last_poll ? formatHeartbeat(agent.worker_last_poll) : "—"}
                />
                {agent.worker_stale && ' ⚠️ STALE'}
              </span>
            </div>
          </div>
        )}

        {agent.derived_status === 'worker_error' && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
            🔴 Worker 状态异常，当前无法正常领取任务。<br/>
            建议：检查 Hermes Worker 进程日志，确认 API 连接正常。
          </div>
        )}

        {agent.derived_status === 'worker_stalled' && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            ⚠️ Worker has not polled in &gt;60s.<br/>
            建议：检查 Worker 进程是否存活，或重启 Worker。
          </div>
        )}

        {agent.capabilities && (
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">Capabilities:</span>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.split(",").map((cap) => (
                <span
                  key={cap}
                  className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-200"
                >
                  {cap.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {(agent.version || agent.runtime_host) && (
          <div className="flex justify-between">
            <span className="text-gray-500">Version/Host:</span>
            <span className="text-gray-700 text-xs">
              {agent.version && `v${agent.version}`}
              {agent.version && agent.runtime_host && " · "}
              {agent.runtime_host && agent.runtime_host}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
