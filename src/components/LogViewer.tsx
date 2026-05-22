"use client";

import { useState, useEffect, useRef } from "react";

interface LogEntry {
  id: number;
  task_id: string;
  timestamp: string;
  event_type: string;
  agent?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface LogViewerProps {
  initialLogs?: LogEntry[];
  sseUrl?: string;
}

const eventTypeColors: Record<string, string> = {
  task_created: "text-blue-600",
  task_updated: "text-gray-600",
  task_completed: "text-green-600",
  task_failed: "text-red-600",
  task_cancelled: "text-gray-500",
  risk_waiting_confirm: "text-orange-600",
  risk_confirmed: "text-green-600",
  agent_status_changed: "text-purple-600",
  memory_written: "text-cyan-600",
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export default function LogViewer({
  initialLogs = [],
  sseUrl = "/api/stream",
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [filter, setFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to SSE stream
    let eventSource: EventSource;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Add new log entry
            const newLog: LogEntry = {
              id: Date.now(),
              task_id: data.task_id || "",
              timestamp: data.timestamp || new Date().toISOString(),
              event_type: data.event_type || "unknown",
              agent: data.agent,
              message: data.message || JSON.stringify(data),
              metadata: data.metadata,
            };

            setLogs((prev) => [newLog, ...prev].slice(0, 500)); // Keep last 500
          } catch {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [sseUrl]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter
    ? logs.filter(
        (log) =>
          log.message.toLowerCase().includes(filter.toLowerCase()) ||
          log.task_id?.toLowerCase().includes(filter.toLowerCase()) ||
          log.event_type.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
        <span className="text-sm text-gray-500">{filteredLogs.length} logs</span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📝</p>
            <p>No logs to display</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id || index}
                className={`p-2 hover:bg-gray-50 rounded ${
                  eventTypeColors[log.event_type] || "text-gray-600"
                }`}
              >
                <span className="text-gray-400">
                  {formatTimestamp(log.timestamp)}
                </span>{" "}
                <span className="px-1 bg-gray-200 rounded text-xs">
                  {log.event_type}
                </span>{" "}
                {log.task_id && (
                  <span className="text-blue-500">[{log.task_id}]</span>
                )}{" "}
                {log.agent && <span className="text-purple-500">@{log.agent}</span>}{" "}
                <span className="text-gray-800">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
