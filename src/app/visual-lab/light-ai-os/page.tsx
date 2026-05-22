"use client";

import React from "react";
import {
  Panel,
  Section,
  Divider,
  SubtleRow,
  Button,
  IconButton,
  ButtonGroup,
  Badge,
  StatusBadge,
  Tag,
  CountBadge,
  MetricCard,
  MetricGrid,
  EmptyState,
  LoadingState,
  ErrorState,
  InspectorPanel,
  InspectorSection,
  InspectorRow,
  Timeline,
  TimelineEvent,
  AssetCard,
  AssetGrid,
} from "@/components/ui";

/* ── Fake data ──────────────────────────────────────── */

const FAKE_TASKS = [
  { id: "tsk_001", name: "Image Generation — Real Street",    status: "completed", agent: "hermes",   duration: "4.2s",  cost: "$0.02" },
  { id: "tsk_002", name: "Video Generation — Studio Style",   status: "running",   agent: "hermes",   duration: "12s",   cost: "..."    },
  { id: "tsk_003", name: "Claude API Call — Codex Review",   status: "pending",   agent: "caiyun",   duration: "—",     cost: "..."    },
  { id: "tsk_004", name: "Memory Write — Session Summary",   status: "failed",   agent: "hermes",   duration: "0.8s",  cost: "$0.01" },
  { id: "tsk_005", name: "External API — Stock Check",       status: "review",   agent: "caiyun",   duration: "3.1s",  cost: "$0.05" },
];

const FAKE_EVENTS: TimelineEvent[] = [
  { id: "e1", time: "14:32:01", label: "Task created",          description: "idempotency_key: img_001", status: "success" },
  { id: "e2", time: "14:32:02", label: "Model selected",         description: "gpt-image-2 · 576x1024",    status: "info"    },
  { id: "e3", time: "14:32:04", label: "ToAPIs API call",        description: "POST /v1/images/generations", status: "info" },
  { id: "e4", time: "14:32:07", label: "Polling started",        description: "every 3s · max 20",         status: "info"    },
  { id: "e5", time: "14:32:18", label: "Task completed",         description: "result.data[0].url ready",   status: "success", duration: "+14s" },
  { id: "e6", time: "14:32:19", label: "Feishu notification",   description: "MEDIA:/tmp/xxx sent",       status: "success" },
];

const FAKE_ASSETS = [
  { id: "a1", name: "真实街拍_原版提示词",  type: "image" as const, url: "https://picsum.photos/seed/a1/400/711", sizeMb: 0.8, createdAt: "2026-05-22T09:21:29Z" },
  { id: "a2", name: "图生视频_0501KS7TCM",  type: "video" as const, url: "https://picsum.photos/seed/a2/400/711", sizeMb: 10, duration: 5, createdAt: "2026-05-22T10:27:00Z" },
  { id: "a3", name: "老钱风影棚_0501KS7V4E", type: "image" as const, url: "https://picsum.photos/seed/a3/400/711", sizeMb: 1.2, createdAt: "2026-05-22T10:40:11Z" },
];

const FAKE_AGENTS = [
  { name: "Hermes",      status: "online",  derived: "running",   tasks: 12 },
  { name: "OpenClaw",    status: "online",  derived: "idle",      tasks: 3  },
  { name: "Claude API",  status: "online",  derived: "rate limit", tasks: 1  },
  { name: "Feishu Bot",  status: "online",  derived: "active",    tasks: 8  },
];

/* ── Page ───────────────────────────────────────────── */

export default function LightAIOSPage() {
  const [tab, setTab]       = React.useState<"dashboard" | "tasks" | "assets" | "inspector" | "components">("dashboard");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]   = React.useState(false);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", minHeight: "100vh", background: "#f6f8fb", padding: "24px" }}>
      {/* ── Page Header ─────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width:        "28px",
              height:       "28px",
              borderRadius: "8px",
              background:   "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display:      "flex",
              alignItems:   "center",
              justifyContent:"center",
              fontSize:     "14px",
              color:        "#fff",
            }}
          >
            ◈
          </div>
          <div>
            <h1
              style={{
                fontSize:   "18px",
                fontWeight: 700,
                color:      "#0f172a",
                margin:     0,
                letterSpacing:" -0.02em",
              }}
            >
              Light AI OS · Design System
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>
              SUPERCOLOR · Visual Lab · v5.1
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display:    "flex",
            gap:        "2px",
            background: "#f0f3f7",
            borderRadius:"8px",
            padding:    "3px",
            width:      "fit-content",
            marginTop: "16px",
          }}
        >
          {(["dashboard", "tasks", "assets", "inspector", "components"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:     "5px 14px",
                fontSize:    "12px",
                fontWeight:  500,
                border:      "none",
                borderRadius:"6px",
                background:  tab === t ? "#ffffff" : "transparent",
                color:       tab === t ? "#0f172a" : "#64748b",
                cursor:      "pointer",
                boxShadow:   tab === t ? "0 1px 3px rgba(15,23,42,0.10)" : "none",
                transition:  "all 150ms",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD ────────────────────────────── */}
      {tab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* KPI */}
          <MetricGrid columns={4}>
            <MetricCard label="Total Tasks"    value="1,284"  sub="+12 today"     trend="up" trendValue="0.9%" icon="⚡" />
            <MetricCard label="Running"         value="3"      sub="2 external"   color="blue" icon="◐" />
            <MetricCard label="Completed"       value="98"     sub="avg 4.2s"    color="green" trend="up" trendValue="2.1%" />
            <MetricCard label="Failed"          value="2"      sub="needs review" color="red"  />
          </MetricGrid>

          {/* Task table + Agent panel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }}>
            {/* Task list */}
            <Section title="Recent Tasks" action={<CountBadge count={5} />}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Task", "Status", "Agent", "Duration", "Cost"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign:   "left",
                          fontSize:    "11px",
                          fontWeight:  600,
                          color:       "#94a3b8",
                          textTransform:"uppercase",
                          letterSpacing:"0.05em",
                          padding:     "8px 12px",
                          borderBottom:"1px solid rgba(15,23,42,0.06)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FAKE_TASKS.map((task) => (
                    <tr key={task.id} style={{ cursor: "pointer" }}>
                      <td style={{ padding: "9px 12px", fontSize: "12px", color: "#334155", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.name}</td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge status={task.status} /></td>
                      <td style={{ padding: "9px 12px", fontSize: "12px", color: "#64748b" }}>{task.agent}</td>
                      <td style={{ padding: "9px 12px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "#64748b" }}>{task.duration}</td>
                      <td style={{ padding: "9px 12px", fontSize: "12px", color: "#64748b" }}>{task.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Agent sidebar */}
            <Section title="Agent Health">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {FAKE_AGENTS.map((agent) => (
                  <div
                    key={agent.name}
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding:    "8px 10px",
                      background: "#f6f8fb",
                      borderRadius:"8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width:        "6px",
                          height:       "6px",
                          borderRadius: "50%",
                          background:   agent.status === "online" ? "#16a34a" : "#dc2626",
                        }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{agent.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <StatusBadge status={agent.derived} />
                      <CountBadge count={agent.tasks} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Timeline */}
          <Section title="Event Timeline" description="Latest task execution trace">
            <Timeline events={FAKE_EVENTS} />
          </Section>
        </div>
      )}

      {/* ── TASKS ────────────────────────────────── */}
      {tab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ButtonGroup>
              {["All", "Running", "Completed", "Failed", "Review"].map((f) => (
                <Button key={f} variant={f === "All" ? "primary" : "secondary"} size="sm">
                  {f}
                </Button>
              ))}
            </ButtonGroup>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={() => setLoading(!loading)}>
              {loading ? "Stop" : "Simulate Loading"}
            </Button>
          </div>

          {/* Task rows */}
          <Section noPadding>
            {loading ? (
              <LoadingState rows={4} message="Fetching tasks…" />
            ) : error ? (
              <ErrorState
                title="Failed to load tasks"
                message="Could not reach the task API."
                details={"Connection timeout after 10s"}
                onRetry={() => setError(false)}
              />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["ID", "Name", "Status", "Agent", "Created", "Duration", "Cost", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FAKE_TASKS.map((task) => (
                    <tr key={task.id} style={{ borderBottom: "1px solid rgba(15,23,42,0.04)" }}>
                      <td style={{ padding: "10px 14px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "#94a3b8" }}>{task.id}</td>
                      <td style={{ padding: "10px 14px", fontSize: "12px", color: "#0f172a", fontWeight: 600 }}>{task.name}</td>
                      <td style={{ padding: "10px 14px" }}><StatusBadge status={task.status} /></td>
                      <td style={{ padding: "10px 14px", fontSize: "12px", color: "#64748b" }}>{task.agent}</td>
                      <td style={{ padding: "10px 14px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "#94a3b8" }}>just now</td>
                      <td style={{ padding: "10px 14px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "#64748b" }}>{task.duration}</td>
                      <td style={{ padding: "10px 14px", fontSize: "12px", color: "#64748b" }}>{task.cost}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <Button size="sm" variant="ghost">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </div>
      )}

      {/* ── ASSETS ────────────────────────────────── */}
      {tab === "assets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Tabs + Upload */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "2px", background: "#f0f3f7", borderRadius: "8px", padding: "3px" }}>
              {["Images", "Videos"].map((t, i) => (
                <button
                  key={t}
                  onClick={() => {}}
                  style={{
                    padding:     "5px 14px",
                    fontSize:    "12px",
                    fontWeight:  500,
                    border:      "none",
                    borderRadius:"6px",
                    background:  i === 0 ? "#ffffff" : "transparent",
                    color:       i === 0 ? "#0f172a" : "#64748b",
                    cursor:      "pointer",
                    boxShadow:   i === 0 ? "0 1px 3px rgba(15,23,42,0.10)" : "none",
                  }}
                >
                  {t} <CountBadge count={i === 0 ? 2 : 1} />
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <Button size="sm">+ Upload</Button>
          </div>

          {/* Asset Grid */}
          <AssetGrid columns={3}>
            {FAKE_ASSETS.map((asset) => (
              <AssetCard
                key={asset.id}
                {...asset}
                onPreview={() => {}}
                onDownload={() => {}}
                onDelete={() => {}}
              />
            ))}
          </AssetGrid>

          {/* Empty state example */}
          <Section title="Deleted assets">
            <EmptyState
              icon="🗑"
              title="No deleted assets"
              description="Assets you delete will appear here for 30 days."
            />
          </Section>
        </div>
      )}

      {/* ── INSPECTOR ─────────────────────────────── */}
      {tab === "inspector" && (
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {/* Main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <Section title="Task: img_001">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <SubtleRow label="Status" value={<StatusBadge status="completed" />} />
                <SubtleRow label="Duration" value="4.2s" mono />
                <SubtleRow label="Agent" value="hermes" />
                <SubtleRow label="Cost" value="$0.02" mono />
                <SubtleRow label="Created" value="2026-05-22 14:32:01" mono />
                <SubtleRow label="Model" value="gpt-image-2" mono />
              </div>
            </Section>

            <Section title="Result">
              <div
                style={{
                  background:  "#f6f8fb",
                  borderRadius:"8px",
                  padding:    "16px",
                  display:    "flex",
                  alignItems: "center",
                  gap:        "16px",
                }}
              >
                <img
                  src="https://picsum.photos/seed/result/200/356"
                  alt="result"
                  style={{ width: "120px", height: "213px", objectFit: "cover", borderRadius: "6px" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>
                    生成完成
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>720×1280 · 9:16 · PNG</div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                    <Button size="sm">↓ Download</Button>
                    <Button size="sm" variant="secondary">→ Video</Button>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Inspector */}
          <InspectorPanel title="Inspector" width={300}>
            <InspectorSection title="Basic Info">
              <InspectorRow label="Task ID" value="tsk_001" mono />
              <InspectorRow label="Created" value="14:32:01" mono />
              <InspectorRow label="Model" value="gpt-image-2" mono />
            </InspectorSection>

            <InspectorSection title="Cost">
              <InspectorRow label="API" value="$0.02" mono />
              <InspectorRow label="Total" value="$0.02" mono />
            </InspectorSection>

            <InspectorSection title="Risk Assessment" defaultOpen={false}>
              <InspectorRow label="External API" value="Yes" warning />
              <InspectorRow label="Billing" value="$0.02" />
            </InspectorSection>

            <div style={{ marginTop: "12px", display: "flex", gap: "6px", flexDirection: "column" }}>
              <Button size="sm">Confirm</Button>
              <Button size="sm" variant="danger">Cancel</Button>
              <Button size="sm" variant="ghost">Write Memory</Button>
            </div>
          </InspectorPanel>
        </div>
      )}

      {/* ── COMPONENTS ────────────────────────────── */}
      {tab === "components" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Buttons */}
          <Section title="Buttons">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
            <Divider label="Sizes" />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <IconButton icon={<span>⚙</span>} title="Settings" />
            </div>
          </Section>

          {/* Badges */}
          <Section title="Badges">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <Badge color="green"  label="completed" />
              <Badge color="cyan"   label="running" />
              <Badge color="amber"  label="pending" />
              <Badge color="red"    label="failed" />
              <Badge color="violet" label="review" />
              <Badge color="slate"  label="cancelled" />
              <Badge color="blue"   label="external" />
            </div>
            <Divider label="Tags" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <Tag label="hermes" />
              <Tag label="image-gen" onRemove={() => {}} />
              <CountBadge count={12} />
            </div>
          </Section>

          {/* Panels */}
          <Section title="Panels">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <Panel variant="default">Default panel</Panel>
              <Panel variant="subtle">Subtle panel</Panel>
              <Panel variant="elevated">Elevated panel</Panel>
              <Panel variant="danger">Danger panel</Panel>
            </div>
          </Section>

          {/* States */}
          <Section title="States">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div style={{ border: "1px solid rgba(15,23,42,0.07)", borderRadius: "12px", overflow: "hidden" }}>
                <LoadingState rows={3} />
              </div>
              <div style={{ border: "1px solid rgba(15,23,42,0.07)", borderRadius: "12px", overflow: "hidden" }}>
                <ErrorState message="Could not connect." onRetry={() => {}} />
              </div>
              <div style={{ border: "1px solid rgba(15,23,42,0.07)", borderRadius: "12px", overflow: "hidden" }}>
                <EmptyState icon="📦" title="No tasks yet" description="Tasks will appear here." />
              </div>
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <Timeline events={FAKE_EVENTS} />
          </Section>

          {/* Color palette */}
          <Section title="Color Palette">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
              {[
                { label: "Background",  value: "#f6f8fb" },
                { label: "Surface",      value: "#ffffff" },
                { label: "Primary",      value: "#0f172a" },
                { label: "Secondary",    value: "#475569" },
                { label: "Muted",        value: "#94a3b8" },
                { label: "Border",       value: "rgba(15,23,42,0.08)" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ height: "40px", borderRadius: "8px", background: c.value, border: "1px solid rgba(15,23,42,0.06)" }} />
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{c.label}</span>
                  <span style={{ fontSize: "9px", color: "#cbd5e1", fontFamily: "var(--font-mono)" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
