// ==========================================
// DESIGN.md ALIGNED TOKENS
// Single source of truth: ~/DESIGN.md
// Last synced: 2026-05-23
// ==========================================

export const TOKENS = {
  spacing: {
    xs:  "8px",   // DESIGN.md: spacing.xs
    sm:  "12px",  // DESIGN.md: spacing.sm
    md:  "16px",  // DESIGN.md: spacing.md
    lg:  "20px",  // DESIGN.md: spacing.lg
    xl:  "24px",  // DESIGN.md: spacing.xl
    xxl: "32px",  // DESIGN.md: spacing.xxl
  },
  borderRadius: {
    sm:      "8px",   // DESIGN.md: rounded.sm
    md:      "10px",  // DESIGN.md: rounded.md
    lg:      "16px",  // DESIGN.md: rounded.lg
    pill:    "9999px",// DESIGN.md: rounded.pill
    panel:   "8px",   // @deprecated — use sm or lg
    control: "4px",   // @deprecated — use xs
  },
  typography: {
    hero:      "32px",  // DESIGN.md: typography.hero
    title:     "16px",  // page-level title
    panelTitle:"13px",  // DESIGN.md: typography.panel-title (13px/600)
    body:      "14px",  // DESIGN.md: typography.body (14px/400)
    caption:   "12px",  // DESIGN.md: typography.caption (12px)
    micro:     "10px",  // DESIGN.md: typography.micro (10px/500)
  },
  statusColors: {
    green:  { text: "#22c55e", bg: "rgba(34, 197, 94, 0.10)" },
    cyan:   { text: "#0891b2", bg: "rgba(8, 145, 178, 0.10)" },
    amber:  { text: "#d97706", bg: "rgba(217, 119, 6, 0.10)" },
    red:    { text: "#dc2626", bg: "rgba(220, 38, 38, 0.10)" },
    violet: { text: "#8b5cf6", bg: "rgba(139, 92, 246, 0.10)" },
    slate:  { text: "#94a3b8", bg: "rgba(148, 163, 184, 0.10)" },
  },
  theme: {
    canvas:     "#f6f8fb",  // DESIGN.md: colors.canvas
    surface:    "#ffffff",
    border:     "1px solid rgba(15,23,42,0.08)",
    textPrimary:   "#0f172a",   // DESIGN.md: colors.ink
    textSecondary: "#334155",   // DESIGN.md: colors.ink-secondary
    textMuted:     "#64748b",   // DESIGN.md: colors.ink-muted
    liquidGlass: {
      background:     "rgba(255, 255, 255, 0.72)",
      backdropFilter: "blur(28px) saturate(160%)",
      border:         "1px solid rgba(255,255,255,0.72)",
      borderRadius:   "16px",
      boxShadow:      "0 24px 80px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(255,255,255,0.35)",
    },
  },
} as const;
