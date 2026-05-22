"use client";

import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { LightGlassPanel, GlassCard } from "@/components/liquid/LightGlassPanel";

// ─── DESIGN.md Color Tokens ──────────────────────────────────────────────────

const COLORS = {
  primary:      "#0891b2",
  primaryHover: "#0ea5c1",
  canvas:       "#f6f8fb",
  ink:          "#0f172a",
  inkSecondary: "#334155",
  inkMuted:     "#64748b",
  inkWeak:      "#94a3b8",
  border:       "rgba(15,23,42,0.08)",
  green:        "#22c55e",
  cyan:         "#0891b2",
  amber:        "#d97706",
  red:          "#dc2626",
  violet:       "#8b5cf6",
  slate:        "#94a3b8",
};

const GRADIENT_STOPS = {
  blue:   "rgba(96,165,250,0.14)",
  purple: "rgba(168,85,247,0.10)",
  teal:   "rgba(20,184,166,0.08)",
};

// ─── Color Swatch ────────────────────────────────────────────────────────────

function ColorSwatch({ name, hex, desc }: { name: string; hex: string; desc?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: hex, border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.ink }}>{name}</div>
        <div style={{ fontSize: "11px", color: COLORS.inkWeak, fontFamily: "monospace" }}>
          {hex}{desc ? ` · ${desc}` : ""}
        </div>
      </div>
    </div>
  );
}

// ─── Type Scale Demo ─────────────────────────────────────────────────────────

function TypeSample({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "12px", padding: "4px 0" }}>
      <span style={{ fontSize: "11px", color: COLORS.inkWeak, minWidth: "100px", fontFamily: "monospace" }}>
        {label}
      </span>
      <span style={style}>The quick brown fox</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GlassDemoPage() {
  return (
    <AppShell>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{
            fontSize: "32px", fontWeight: 600, color: COLORS.ink,
            letterSpacing: "-0.02em", margin: "0 0 4px",
          }}>
            Liquid Glass · 设计系统
          </h1>
          <p style={{ fontSize: "14px", color: COLORS.inkMuted, margin: "0 0 4px" }}>
            iOS 26 物理折射 · liquid-glass-react · DESIGN.md v1.0
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            {["SVG feDisplacementMap 折射", "Chromatic Aberration 色散", "Elasticity 液态弹性", "4 种折射模式"].map((f) => (
              <span key={f} style={{
                fontSize: "11px", fontWeight: 600, color: COLORS.primary,
                background: "rgba(8,145,178,0.08)", borderRadius: "99px",
                padding: "2px 10px",
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* ── 1. Color Palette ─────────────────────────────────────────── */}
          <LightGlassPanel title="色彩系统">
            <div style={{ padding: "16px" }}>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.inkWeak, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Brand
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ColorSwatch name="Primary" hex={COLORS.primary} desc="cyan accent" />
                  <ColorSwatch name="Primary Hover" hex={COLORS.primaryHover} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.inkWeak, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Canvas &amp; Surface
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ColorSwatch name="Canvas" hex={COLORS.canvas} desc="page bg" />
                  <ColorSwatch name="Glass" hex="rgba(255,255,255,0.72)" desc="panel bg" />
                  <ColorSwatch name="Card" hex="rgba(248,250,252,0.8)" desc="nested card" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: COLORS.inkWeak, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Ink
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ColorSwatch name="Ink" hex={COLORS.ink} desc="headings" />
                  <ColorSwatch name="Secondary" hex={COLORS.inkSecondary} desc="body" />
                  <ColorSwatch name="Muted" hex={COLORS.inkMuted} desc="captions" />
                  <ColorSwatch name="Weak" hex={COLORS.inkWeak} desc="placeholders" />
                </div>
              </div>
            </div>
          </LightGlassPanel>

          {/* ── 2. Status Colors ──────────────────────────────────────────── */}
          <LightGlassPanel title="状态色">
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {([
                { color: "green",  label: "已完成 / 在线",   hex: COLORS.green },
                { color: "cyan",   label: "运行中 / 轮询",   hex: COLORS.cyan },
                { color: "amber",  label: "等待 / 警告",     hex: COLORS.amber },
                { color: "red",    label: "失败 / 危险",     hex: COLORS.red },
                { color: "violet", label: "待复核 / 记忆",   hex: COLORS.violet },
                { color: "slate",  label: "中性 / 取消",     hex: COLORS.slate },
              ] as const).map((s) => (
                <div key={s.color} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <StatusPill type={s.color} label={s.label} />
                  <span style={{ fontSize: "11px", color: COLORS.inkWeak, fontFamily: "monospace" }}>
                    {s.hex}
                  </span>
                </div>
              ))}
            </div>
          </LightGlassPanel>

          {/* ── 3. Typography ─────────────────────────────────────────────── */}
          <LightGlassPanel title="字体层级">
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <TypeSample label="Hero 32/600" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "32px", fontWeight: 600, color: COLORS.ink,
                letterSpacing: "-0.02em", lineHeight: 1.1,
              }} />
              <TypeSample label="Panel 13/600" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "13px", fontWeight: 600, color: COLORS.ink,
                letterSpacing: "-0.01em",
              }} />
              <TypeSample label="Body 14/400" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "14px", fontWeight: 400, color: COLORS.inkSecondary,
                lineHeight: 1.5, letterSpacing: "-0.008em",
              }} />
              <TypeSample label="Caption 12/400" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "12px", fontWeight: 400, color: COLORS.inkMuted,
                lineHeight: 1.4,
              }} />
              <TypeSample label="Caption 12/600" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "12px", fontWeight: 600, color: COLORS.inkMuted,
                lineHeight: 1.4,
              }} />
              <TypeSample label="Mono 12/400" style={{
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: "12px", fontWeight: 400, color: COLORS.inkWeak,
              }} />
              <TypeSample label="Micro 10/500" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "10px", fontWeight: 600, color: COLORS.inkWeak,
                letterSpacing: "0.02em",
              }} />
            </div>
          </LightGlassPanel>

          {/* ── 4. Panels & Cards ─────────────────────────────────────────── */}
          <LightGlassPanel title="面板与卡片">
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12px", color: COLORS.inkMuted, margin: 0 }}>
                以下卡片嵌套在当前玻璃面板内，展示 GlassCard 组件效果：
              </p>
              <GlassCard>
                <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.ink, marginBottom: "4px" }}>
                  默认卡片
                </div>
                <div style={{ fontSize: "11px", color: COLORS.inkWeak }}>
                  background: rgba(248,250,252,0.8) · border: 1px rgba(15,23,42,0.07)
                </div>
              </GlassCard>
              <GlassCard style={{ background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.12)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.primary, marginBottom: "4px" }}>
                  强调卡片
                </div>
                <div style={{ fontSize: "11px", color: COLORS.inkWeak }}>
                  使用 primary 色调 — 用于选中态或高亮信息
                </div>
              </GlassCard>
              <GlassCard>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.ink }}>Hermes Agent</div>
                    <div style={{ fontSize: "10px", color: COLORS.inkWeak }}>last seen 2m ago</div>
                  </div>
                  <StatusPill type="green" label="在线" />
                </div>
              </GlassCard>
            </div>
          </LightGlassPanel>

        </div>

        {/* ── Full-width: Buttons ───────────────────────────────────────────── */}
        <div style={{ marginTop: "16px" }}>
          <LightGlassPanel title="按钮">
            <div style={{ padding: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <button style={{
                padding: "8px 16px", background: COLORS.primary, color: "#fff",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600, border: "none",
                cursor: "pointer",
              }}>
                主按钮 · Primary
              </button>
              <button style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.72)",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                color: COLORS.inkSecondary, cursor: "pointer",
              }}>
                次按钮 · Glass
              </button>
              <button style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                color: COLORS.inkMuted, cursor: "pointer",
              }}>
                三级 · Ghost
              </button>
              <span style={{ fontSize: "11px", color: COLORS.inkWeak, marginLeft: "8px" }}>
                ← 所有交互元素用 cyan #0891b2 单 accent
              </span>
            </div>
          </LightGlassPanel>
        </div>

        {/* ── Full-width: Background Gradient ───────────────────────────────── */}
        <div style={{ marginTop: "16px" }}>
          <LightGlassPanel title="页面背景渐变">
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  height: "120px",
                  borderRadius: "12px",
                  background: `radial-gradient(circle at 20% 10%, ${GRADIENT_STOPS.blue}, transparent 32%),
                    radial-gradient(circle at 80% 0%, ${GRADIENT_STOPS.purple}, transparent 30%),
                    radial-gradient(circle at 50% 100%, ${GRADIENT_STOPS.teal}, transparent 34%),
                    ${COLORS.canvas}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", color: COLORS.inkMuted,
                }}
              >
                三层 radial-gradient 叠加 #f6f8fb
              </div>
              <div style={{ marginTop: "12px", fontSize: "11px", color: COLORS.inkWeak, fontFamily: "monospace", lineHeight: 1.6 }}>
                radial-gradient(circle at 20% 10%, rgba(96,165,250,0.14), transparent 32%)<br />
                radial-gradient(circle at 80% 0%, rgba(168,85,247,0.10), transparent 30%)<br />
                radial-gradient(circle at 50% 100%, rgba(20,184,166,0.08), transparent 34%)<br />
                #f6f8fb
              </div>
              <div style={{ marginTop: "8px", fontSize: "11px", color: COLORS.amber, fontWeight: 600 }}>
                ⚠ 必须用 inline style，不能用 Tailwind class — 多层 radial-gradient 无法用 utility class 表达
              </div>
            </div>
          </LightGlassPanel>
        </div>

        {/* ── Full-width: Elevation Philosophy ──────────────────────────────── */}
        <div style={{ marginTop: "16px" }}>
          <LightGlassPanel title="深度系统 · Elevation">
            <div style={{ padding: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { label: "Flat", desc: "零阴影，颜色分隔", style: { background: "#fff", borderRadius: "8px", padding: "16px", border: "1px solid rgba(15,23,42,0.08)" } as React.CSSProperties },
                { label: "Glass", desc: "blur(28px) saturate(160%)", style: {
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(28px) saturate(160%)",
                  borderRadius: "12px", padding: "16px",
                  border: "1px solid rgba(255,255,255,0.72)",
                  boxShadow: "0 24px 80px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.92)",
                } as React.CSSProperties },
                { label: "Card", desc: "rgba(248,250,252,0.8)", style: {
                  background: "rgba(248,250,252,0.8)",
                  borderRadius: "10px", padding: "12px",
                  border: "1px solid rgba(15,23,42,0.07)",
                } as React.CSSProperties },
              ].map((lvl) => (
                <div key={lvl.label} style={{ flex: 1, minWidth: "200px" }}>
                  <div style={lvl.style}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.ink, marginBottom: "4px" }}>
                      {lvl.label}
                    </div>
                    <div style={{ fontSize: "11px", color: COLORS.inkWeak }}>
                      {lvl.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 16px 16px", fontSize: "11px", color: COLORS.inkMuted }}>
              深度不靠 shadow，靠 blur + translucency + inset highlights。零传统 box-shadow。
            </div>
          </LightGlassPanel>
        </div>

        {/* ── Full-width: Refraction Modes ──────────────────────────────────── */}
        <div style={{ marginTop: "16px" }}>
          <LightGlassPanel title="折射模式 · Refraction Modes">
            <div style={{ padding: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                  { mode: "standard", desc: "标准折射，适合大部分场景。平衡的性能和视觉效果。" },
                  { mode: "polar", desc: "极坐标折射，边缘变形更明显，适合焦点元素。" },
                  { mode: "prominent", desc: "强化折射，位移量大，适合 Hero 区或登录页。" },
                  { mode: "shader", desc: "WebGL shader 折射，最真实但不稳定，实验性。" },
                ].map(({ mode, desc }) => (
                  <GlassCard key={mode} style={{ background: "rgba(255,255,255,0.4)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.ink, marginBottom: "4px", fontFamily: "monospace" }}>
                      {mode}
                    </div>
                    <div style={{ fontSize: "11px", color: COLORS.inkWeak, lineHeight: 1.5 }}>
                      {desc}
                    </div>
                  </GlassCard>
                ))}
              </div>
              <div style={{ marginTop: "12px", fontSize: "11px", color: COLORS.inkMuted }}>
                当前 Dashboard 统一使用{" "}
                <code style={{ background: "rgba(15,23,42,0.05)", padding: "1px 4px", borderRadius: "3px", fontFamily: "monospace" }}>
                  mode=&quot;standard&quot;
                </code>。其他模式可在页面级按需指定。
              </div>
            </div>
          </LightGlassPanel>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: "24px", textAlign: "center", paddingBottom: "40px" }}>
          <div style={{ fontSize: "13px", color: COLORS.inkWeak }}>
            DESIGN.md v1.0 · Supercolor AI OS · Apple Liquid Glass
          </div>
          <div style={{ fontSize: "11px", color: COLORS.inkWeak, marginTop: "4px" }}>
            SF Pro via system-ui · Cyan #0891b2 accent · 零 box-shadow · blur 深度
          </div>
        </div>

      </div>
    </AppShell>
  );
}
