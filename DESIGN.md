---
version: 1.0
name: Supercolor-AI-OS-Command-Center
description: |
  Apple Liquid Glass dashboard for AI task orchestration. Frosted-glass panels 
  float on a light radial-gradient canvas (#f6f8fb), anchored by SF Pro typography 
  with negative letter-spacing and a single cyan primary (#0891b2). The system 
  treats every task, agent, and workflow as a "product tile" — each panel is a 
  translucent card resting on the glass surface, with elevation expressed through 
  blur and soft inset highlights rather than shadows. Status color is the only 
  chromatic event beyond the primary cyan — green for complete, amber for waiting, 
  red for failure — applied sparingly as micro-pills.
colors:
  # ── Brand ──
  primary: "#0891b2"
  primary-hover: "#0ea5c1"
  primary-focus: "#06b6d4"
  # ── Canvas ──
  canvas: "#f6f8fb"
  canvas-glass: "rgba(255,255,255,0.72)"
  canvas-card: "rgba(248,250,252,0.8)"
  # ── Ink ──
  ink: "#0f172a"
  ink-secondary: "#334155"
  ink-muted: "#64748b"
  ink-weak: "#94a3b8"
  # ── Border ──
  border: "rgba(15,23,42,0.08)"
  border-light: "rgba(15,23,42,0.04)"
  border-glass: "rgba(255,255,255,0.72)"
  # ── Surface ──
  surface: "#ffffff"
  surface-pearl: "#fafafc"
  surface-dark: "#0f172a"
  # ── Status ──
  status-green: "#22c55e"
  status-cyan: "#0891b2"
  status-amber: "#d97706"
  status-red: "#dc2626"
  status-violet: "#8b5cf6"
  status-slate: "#94a3b8"
  # ── Gradient stops ──
  gradient-blue: "rgba(96,165,250,0.14)"
  gradient-purple: "rgba(168,85,247,0.10)"
  gradient-teal: "rgba(20,184,166,0.08)"

typography:
  font-display: "SF Pro Display, system-ui, -apple-system, sans-serif"
  font-body: "SF Pro Text, system-ui, -apple-system, sans-serif"
  font-mono: "SF Mono, JetBrains Mono, ui-monospace, monospace"
  # ── Hierarchy ──
  hero:
    family: "{typography.font-display}"
    size: 32px
    weight: 600
    lineHeight: 1.1
    letterSpacing: -0.28px
    use: "Dashboard title. One per page."
  panel-title:
    family: "{typography.font-display}"
    size: 13px
    weight: 600
    lineHeight: 1.0
    letterSpacing: -0.08px
    use: "GlassPanel header, card titles, column heads"
  body:
    family: "{typography.font-body}"
    size: 14px
    weight: 400
    lineHeight: 1.5
    letterSpacing: -0.12px
    use: "Default body, table cells, descriptions"
  body-strong:
    family: "{typography.font-body}"
    size: 14px
    weight: 600
    lineHeight: 1.5
    letterSpacing: -0.12px
    use: "Emphasized body, key values"
  caption:
    family: "{typography.font-body}"
    size: 12px
    weight: 400
    lineHeight: 1.4
    letterSpacing: -0.08px
    use: "Secondary metadata, timestamps, labels"
  caption-strong:
    family: "{typography.font-body}"
    size: 12px
    weight: 600
    lineHeight: 1.4
    letterSpacing: -0.08px
    use: "Status pill text, badge labels"
  mono:
    family: "{typography.font-mono}"
    size: 12px
    weight: 400
    lineHeight: 1.5
    letterSpacing: 0
    use: "Task IDs, codes, URLs"
  micro:
    family: "{typography.font-body}"
    size: 10px
    weight: 500
    lineHeight: 1.2
    letterSpacing: 0.02px
    use: "Tiny badges, count indicators"

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 48px

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 10px
  lg: 16px
  pill: 9999px

components:
  # ── Glass Panel (the core container) ──
  glass-panel:
    background: "rgba(255,255,255,0.72)"
    backdropFilter: "blur(28px) saturate(160%)"
    webkitBackdropFilter: "blur(28px) saturate(160%)"
    border: "1px solid rgba(255,255,255,0.72)"
    borderRadius: "{rounded.lg}"
    boxShadow: "0 24px 80px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(255,255,255,0.35)"
    overflow: hidden

  glass-panel-header:
    display: flex
    justifyContent: space-between
    alignItems: center
    padding: "14px 18px"
    borderBottom: "1px solid rgba(15,23,42,0.07)"
    titleFont: "{typography.panel-title}"

  # ── Nested card (inside glass panels) ──
  glass-card:
    background: "rgba(248,250,252,0.8)"
    border: "1px solid rgba(15,23,42,0.07)"
    borderRadius: "{rounded.md}"
    padding: "10px 12px"

  # ── Primary button ──
  button-primary:
    background: "{colors.primary}"
    color: "#ffffff"
    borderRadius: "{rounded.sm}"
    padding: "8px 16px"
    fontSize: "13px"
    fontWeight: 600
    hover:
      background: "{colors.primary-hover}"
    active:
      transform: "scale(0.97)"

  # ── Glass secondary button ──
  button-glass:
    background: "rgba(255,255,255,0.72)"
    backdropFilter: "blur(12px)"
    webkitBackdropFilter: "blur(12px)"
    border: "1px solid rgba(255,255,255,0.72)"
    borderRadius: "{rounded.sm}"
    padding: "8px 14px"
    fontSize: "13px"
    fontWeight: 500
    color: "{colors.ink-secondary}"
    hover:
      background: "rgba(255,255,255,0.88)"

  # ── Status pill ──
  status-pill:
    borderRadius: "{rounded.pill}"
    padding: "2px 10px"
    fontSize: "{typography.caption-strong.size}"
    fontWeight: 600
    variants:
      online:    { background: "rgba(34,197,94,0.10)",  color: "{colors.status-green}" }
      busy:      { background: "rgba(8,145,178,0.10)",  color: "{colors.status-cyan}" }
      error:     { background: "rgba(220,38,38,0.10)",  color: "{colors.status-red}" }
      stalled:   { background: "rgba(217,119,6,0.10)",  color: "{colors.status-amber}" }
      pending:   { background: "rgba(139,92,246,0.10)", color: "{colors.status-violet}" }
      completed: { background: "rgba(34,197,94,0.08)",  color: "{colors.status-green}" }
      failed:    { background: "rgba(220,38,38,0.08)",  color: "{colors.status-red}" }
      neutral:   { background: "rgba(148,163,184,0.10)", color: "{colors.status-slate}" }

  # ── Task row ──
  task-row:
    display: flex
    alignItems: center
    gap: "{spacing.sm}"
    padding: "{spacing.sm} {spacing.md}"
    borderBottom: "1px solid {colors.border-light}"
    hover:
      background: "rgba(248,250,252,0.6)"
    taskId:
      font: "{typography.mono}"
      color: "{colors.ink-muted}"
    title:
      font: "{typography.body}"
      color: "{colors.ink}"
      flex: 1
    meta:
      font: "{typography.caption}"
      color: "{colors.ink-weak}"

  # ── Agent health card ──
  agent-card:
    extends: "{components.glass-card}"
    display: flex
    alignItems: center
    gap: "{spacing.sm}"
    agentName:
      font: "{typography.body-strong}"
    agentStatus:
      extends: "{components.status-pill}"
    lastSeen:
      font: "{typography.caption}"
      color: "{colors.ink-weak}"

  # ── KPI stat ──
  stat-block:
    textAlign: center
    value:
      font: "{typography.font-display}"
      size: "28px"
      weight: 600
      color: "{colors.ink}"
    label:
      font: "{typography.caption}"
      color: "{colors.ink-muted}"

  # ── Empty state ──
  empty-state:
    padding: "{spacing.xxl}"
    textAlign: center
    icon:
      fontSize: "32px"
      opacity: 0.3
    title:
      font: "{typography.body-strong}"
      color: "{colors.ink-muted}"
    description:
      font: "{typography.caption}"
      color: "{colors.ink-weak}"

layout:
  # ── Page background ──
  page-bg: |
    radial-gradient(circle at 20% 10%, {colors.gradient-blue}, transparent 32%),
    radial-gradient(circle at 80% 0%, {colors.gradient-purple}, transparent 30%),
    radial-gradient(circle at 50% 100%, {colors.gradient-teal}, transparent 34%),
    {colors.canvas}

  # ── Dashboard grid ──
  dashboard:
    display: grid
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))"
    gap: "{spacing.lg}"
    padding: "{spacing.lg}"

  # ── Full-width section ──
  section-full:
    gridColumn: "1 / -1"

  # ── Sidebar (when used) ──
  sidebar:
    width: "240px"
    background: "rgba(255,255,255,0.48)"
    backdropFilter: "blur(20px)"
    borderRight: "1px solid {colors.border}"

elevation:
  # No traditional box-shadows. Depth comes from:
  # 1. GlassPanel blur + inset highlights (glass-panel component)
  # 2. Surface color changes (canvas → glass → card)
  # 3. backdrop-filter on sticky elements
  # The single exception: body text on glass needs no shadow.
  # Cards float through translucency, not shadow darkness.

responsive:
  breakpoints:
    mobile: "≤ 640px"
    tablet: "641–1024px"
    desktop: "≥ 1025px"
  mobile:
    dashboard: "single column"
    glass-panel-padding: "{spacing.sm}"
    hero-size: "24px"
  tablet:
    dashboard: "2 columns"
  desktop:
    dashboard: "3-4 columns, max-width 1440px"

do:
  - "Use {components.glass-panel} as the universal container — every card, table, and stat block lives inside a glass panel"
  - "Apply {colors.primary} (cyan #0891b2) as the single interactive accent — buttons, links, focus rings, active indicators"
  - "Use {components.status-pill} variants for ALL status communication — never raw colored text"
  - "Set body text at 14px (not 16px) — the smaller size pairs with glass panels to create denser, more capable dashboards"
  - "Use negative letter-spacing on panel titles (-0.08px) for the Apple-tight headline feel"
  - "Apply page-bg gradient via inline style (not Tailwind class) — multi-layer radial-gradient can't be expressed in utility classes"
  - "Use ClientOnlyText for all time-based rendering to avoid hydration mismatches"
  - "Prefer translucency over borders — a glass card with 0.8 alpha reads cleaner than a solid card with a hairline"
  - "Keep glass panels on a non-white parent — the {colors.canvas} (#f6f8fb) gradient lets the glass effect breathe"

dont:
  - "Don't use raw hex colors — always reference {colors.*} tokens"
  - "Don't add box-shadows to cards — elevation comes from blur, not shadow darkness"
  - "Don't use weight 500 — the ladder is 400 / 600. Body is 400, strong is 600"
  - "Don't use Tailwind for complex backgrounds — multi-layer radial-gradient goes in inline style"
  - "Don't hardcode API URLs — use /api prefix (Next.js rewrite proxy)"
  - "Don't render time/date server-side — use ClientOnlyText with fallback='--'"
  - "Don't mix status communication styles — always use status-pill, never raw colored text or emoji-only"
  - "Don't use borders thicker than 1px — the glass blur does the separation work"

agent-prompt:
  quick-ref: |
    Build pages using these tokens:
    - Container: {components.glass-panel}
    - Page bg: {layout.page-bg} (inline style, not Tailwind)
    - Primary action: {components.button-primary}
    - Secondary action: {components.button-glass}
    - Status: {components.status-pill} with variant matching the state
    - Text: {typography.body} (14px/400), titles {typography.panel-title} (13px/600)
    - Color: single accent {colors.primary} (#0891b2 cyan)
    - Elevation: blur + translucency, NOT shadows
    - Font: SF Pro via system-ui stack; Inter as open-source fallback
    - API: fetch('/api/...') — Next.js rewrites to localhost:8787
  prompt-template: |
    Build a {page-type} page for the Supercolor AI Command Center.
    Use the DESIGN.md tokens: glass panels, cyan (#0891b2) accent,
    SF Pro typography, light radial-gradient background.
    The page shows {data-description}.
    Key components needed: {component-list}.
    API endpoint: /api/{endpoint}.
