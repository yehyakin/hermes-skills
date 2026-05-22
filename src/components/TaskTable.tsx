"use client";

import Link from "next/link";

interface Task {
  id: string;
  task_id: string;
  source: string;
  sender: string;
  task_type: string;
  assigned_agent: string;
  priority: string;
  risk_level: string;
  status: string;
  created_at: string;
  duration_seconds?: number;
  matched_capability?: string;
  routing_reason?: string;
}

interface TaskTableProps {
  tasks: Task[];
  onRetry?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  pending_confirmation: "bg-orange-100 text-orange-800",
  waiting_for_agent: "bg-amber-100 text-amber-800",
  running: "bg-blue-100 text-blue-800",
  // External paid API statuses
  external_created: "bg-purple-100 text-purple-800",
  external_polling: "bg-indigo-100 text-indigo-800",
  external_completed: "bg-emerald-100 text-emerald-800",
  external_failed: "bg-rose-100 text-rose-800",
  recoverable_timeout: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-red-600 text-white",
};

function formatDuration(seconds?: number): string {
  if (seconds == null) return "-";
  if (seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function TaskTable({ tasks, onRetry, onCancel }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-xl mb-2">📋</p>
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capability
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link
                  href={`/tasks/${task.task_id || task.id}`}
                  className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                >
                  {task.task_id || task.id.slice(0, 12)}...
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {task.source}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {task.task_type}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {task.assigned_agent
                  ? <span className={`font-medium ${
                    task.assigned_agent === 'hermes' ? 'text-purple-700' :
                    task.assigned_agent === 'openclaw' ? 'text-orange-700' :
                    'text-gray-700'
                  }`}>{task.assigned_agent}</span>
                  : <span className="text-amber-500">—</span>
                }
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[task.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status === 'waiting_for_agent' ? 'Waiting' : task.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {task.matched_capability
                  ? <span className="inline-block bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs">{task.matched_capability}</span>
                  : '—'
                }
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    riskColors[task.risk_level] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.risk_level}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(task.created_at)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDuration(task.duration_seconds)}
              </td>
              <td className="px-4 py-3 flex gap-2">
                {task.status === "failed" && onRetry && (
                  <button
                    onClick={() => onRetry(task.task_id || task.id)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Retry
                  </button>
                )}
                {(task.status === "pending" || task.status === "running" || task.status === "waiting_for_agent") &&
                  onCancel && (
                    <button
                      onClick={() => onCancel(task.task_id || task.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Cancel
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
