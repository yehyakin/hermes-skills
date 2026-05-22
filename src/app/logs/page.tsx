"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import LogViewer from "@/components/LogViewer";
import { LightGlassPanel } from "@/components/liquid/LightGlassPanel";

const API_BASE = "/api";

interface LogEntry {
  id: number;
  task_id: string;
  timestamp: string;
  event_type: string;
  agent?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export default function LogsPage() {
  const [initialLogs, setInitialLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

  const fetchInitialLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setInitialLogs(data.data.reverse()); // Oldest first for log viewer
      } else {
        setError("Failed to fetch logs");
      }
    } catch {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialLogs();
  }, []);

  useEffect(() => {
    // Check SSE connection
    const eventSource = new EventSource(`${API_BASE}/stream`);

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    // The LogViewer component handles its own SSE connection
    // This just checks if the stream endpoint is accessible

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Loading logs...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <LightGlassPanel
      variant="light"
      intensity="low"
      style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Logs</h1>
          <p className="text-gray-500">Real-time event streaming</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              sseConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-500">
            {sseConnected ? "SSE Connected" : "SSE Disconnected"}
          </span>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure the backend is running on port 8787
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-full p-4">
            <LogViewer
              initialLogs={initialLogs}
              sseUrl={`${API_BASE}/stream`}
            />
          </div>
        </div>
      )}
    </LightGlassPanel>
    </AppShell>
  );
}
