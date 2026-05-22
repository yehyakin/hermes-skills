"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import RiskConfirmCard from "@/components/RiskConfirmCard";
import { LightGlassPanel } from "@/components/liquid/LightGlassPanel";

const API_BASE = "/api";

interface RiskItem {
  id: string;
  task_id: string;
  source: "risk_confirmations" | "tasks";
  risk_level: string;
  risk_reason: string;
  status: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at?: string;
  original_message?: string;
  priority?: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [taskMessages, setTaskMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const fetchRisks = async () => {
    try {
      // Backend /api/risks already deduplicates and unifies both sources:
      // - risk_confirmations table
      // - tasks table (pending_confirmation)
      // No need to fetch /api/tasks?status=pending_confirmation separately.
      const res = await fetch(`${API_BASE}/risks`);

      if (!res.ok) {
        setError("Failed to fetch risks");
        return;
      }

      const data = await res.json();
      const rawData = data.data || [];

      // Normalize source: backend may return "tasks.pending_confirmation" but
      // RiskConfirmCard only accepts "risk_confirmations" | "tasks"
      for (const item of rawData) {
        if (item.source === "tasks.pending_confirmation") {
          item.source = "tasks";
        }
      }

      setRisks(rawData);
      setError(null);

      // Fetch original messages for risk_confirmations items (they don't include message)
      for (const item of data.data || []) {
        if (item.source === "risk_confirmations" && !taskMessages[item.task_id]) {
          const taskRes = await fetch(`${API_BASE}/tasks/${item.task_id}`).catch(() => null);
          if (taskRes?.ok) {
            const taskData = await taskRes.json();
            if (taskData.data?.original_message) {
              setTaskMessages((prev) => ({
                ...prev,
                [item.task_id]: taskData.data.original_message,
              }));
            }
          }
        }
      }
    } catch {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
    const interval = setInterval(fetchRisks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed_by: "console" }),
      });
      if (res.ok) {
        fetchRisks();
      }
    } catch {
      console.error("Failed to confirm risk");
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        fetchRisks();
      }
    } catch {
      console.error("Failed to cancel task");
    }
  };

  const filteredRisks = risks.filter((risk) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") {
      return risk.status === "pending" || risk.status === "pending_confirmation";
    }
    return risk.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading risks...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
    <LightGlassPanel variant="light" intensity="low" style={{ padding: "24px", flex: 1 }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Risk Confirmations</h1>
        <p className="text-gray-500">
          Backend deduplicates — each task_id appears at most once
        </p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {["pending", "confirmed", "cancelled", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-xl mb-2">No pending risks</p>
          <p className="text-sm">All systems are running smoothly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRisks.map((risk) => (
            <RiskConfirmCard
              key={risk.id}
              risk={risk}
              taskMessage={
                risk.original_message || taskMessages[risk.task_id] || undefined
              }
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredRisks.length} of {risks.length} total risk(s)
        &nbsp;·&nbsp;Backend deduplication: each task_id appears once
      </div>
    </LightGlassPanel>
    </AppShell>
  );
}
