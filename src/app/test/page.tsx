"use client";

import { useState, useEffect } from "react";

const API_BASE = "/api";

export default function TestPage() {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[TEST] starting diagnostics");

    const run = async () => {
      const tests = [
        { name: "stats", url: `${API_BASE}/stats` },
        { name: "agents", url: `${API_BASE}/agents` },
        { name: "tasks", url: `${API_BASE}/tasks?limit=5` },
        { name: "logs", url: `${API_BASE}/logs?limit=5` },
        { name: "stats_raw", url: "http://127.0.0.1:8787/api/stats" },
      ];

      const r: Record<string, unknown> = {};
      for (const t of tests) {
        try {
          const start = Date.now();
          const res = await fetch(t.url);
          const ms = Date.now() - start;
          const text = await res.text();
          let data: unknown;
          try { data = JSON.parse(text); } catch { data = text.slice(0, 100); }
          r[t.name] = { ok: res.ok, status: res.status, ms, hasData: !!(data as any)?.data, data };
          console.log(`[TEST] ${t.name}: ${res.status} in ${ms}ms`);
        } catch (err) {
          r[t.name] = { ok: false, error: String(err) };
          console.error(`[TEST] ${t.name}: ERROR`, err);
        }
      }

      setResults(r);
      setLoading(false);
      console.log("[TEST] diagnostics complete");
    };

    run();
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: "monospace" }}>⏳ Running diagnostics...</div>;

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🔍 API Diagnostics</h1>
      <pre style={{ background: "#f5f5f5", padding: 20, borderRadius: 8, fontSize: 12, overflow: "auto" }}>
        {JSON.stringify(results, null, 2)}
      </pre>
      <p style={{ marginTop: 20, color: "#666", fontSize: 14 }}>
        If any endpoint shows error or has no data — that&apos;s your broken piece.
      </p>
    </div>
  );
}
