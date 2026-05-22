<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design System

This project follows **Apple Liquid Glass** design, defined in `DESIGN.md`.

Key rules:
- All UI lives in `{components.glass-panel}` — frosted glass with `blur(28px) saturate(160%)`
- Single accent: cyan `#0891b2` for all interactive elements
- Status communicated via `{components.status-pill}` variants, never raw colored text
- No box-shadows — depth comes from blur + translucency + inset highlights
- Body text at 14px, panel titles at 13px/600 with negative letter-spacing
- Page background uses inline `style={{ background: ... }}` with radial-gradient, not Tailwind
- API calls use `/api/...` prefix (Next.js rewrites to `localhost:8787`)
- Time/date rendering uses `ClientOnlyText` to avoid hydration mismatches
- Font: SF Pro via `system-ui` stack; fallback: Inter

See `DESIGN.md` for full token reference.
