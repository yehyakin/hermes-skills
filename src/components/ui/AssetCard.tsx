"use client";

import React from "react";

/* ── AssetCard ──────────────────────────────────────── */

interface AssetCardMedia {
  url: string;
  thumbnail_url?: string;
}

interface AssetCardProps {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  sizeMb?: number;
  duration?: number;
  style?: string;
  createdAt?: string;
  taskId?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

function formatDuration(secs?: number): string {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AssetCard({
  name,
  type,
  url,
  thumbnailUrl,
  sizeMb,
  duration,
  createdAt,
  taskId,
  onPreview,
  onDownload,
  onDelete,
  selected,
}: AssetCardProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>(
    type === "video" ? (thumbnailUrl ?? url) : url
  );
  const [imgError, setImgError] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    borderRadius: "10px",
    border: selected
      ? "2px solid #3b82f6"
      : "1px solid rgba(15, 23, 42, 0.08)",
    background: "#ffffff",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 150ms var(--ease-default)",
    boxShadow: selected
      ? "0 0 0 3px rgba(59, 130, 246, 0.15)"
      : "0 1px 3px rgba(15, 23, 42, 0.05)",
    position: "relative",
  };

  return (
    <div style={cardStyle} onClick={onPreview}>
      {/* Thumbnail */}
      <div
        style={{
          position:  "relative",
          paddingTop:type === "video" ? "177.8%" : "133.4%", // 9:16 or 3:4
          background:"#f0f3f7",
          overflow:  "hidden",
        }}
      >
        {type === "image" && !imgError ? (
          <img
            src={previewUrl}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              position:   "absolute",
              top:        0,
              left:       0,
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
            }}
          />
        ) : type === "video" ? (
          <>
            <img
              src={previewUrl}
              alt={name}
              onError={() => setImgError(true)}
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                width:      "100%",
                height:     "100%",
                objectFit:  "cover",
              }}
            />
            {/* Play overlay */}
            <div
              style={{
                position:      "absolute",
                top:           "50%",
                left:          "50%",
                transform:      "translate(-50%, -50%)",
                width:         "36px",
                height:        "36px",
                borderRadius:  "50%",
                background:     "rgba(0,0,0,0.5)",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
              }}
            >
              <span style={{ color: "#fff", fontSize: "14px", marginLeft: "2px" }}>▶</span>
            </div>
          </>
        ) : (
          <div
            style={{
              position:   "absolute",
              top:        0,
              left:       0,
              width:      "100%",
              height:     "100%",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              color:      "#94a3b8",
              fontSize:   "24px",
            }}
          >
            📄
          </div>
        )}

        {/* Duration badge (video) */}
        {type === "video" && duration && (
          <div
            style={{
              position:  "absolute",
              bottom:   "6px",
              right:    "6px",
              padding:  "2px 6px",
              fontSize: "10px",
              fontWeight:600,
              fontFamily:"var(--font-mono)",
              background:"rgba(0,0,0,0.65)",
              color:     "#fff",
              borderRadius:"4px",
            }}
          >
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontSize:   "12px",
            fontWeight: 600,
            color:      "#0f172a",
            overflow:   "hidden",
            textOverflow:"ellipsis",
            whiteSpace: "nowrap",
            marginBottom:"4px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display:    "flex",
            gap:       "8px",
            alignItems: "center",
            flexWrap:  "wrap",
          }}
        >
          {sizeMb !== undefined && (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {sizeMb}MB
            </span>
          )}
          {createdAt && (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {new Date(createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        {taskId && (
          <div
            style={{
              fontSize:   "10px",
              color:      "#cbd5e1",
              fontFamily: "var(--font-mono)",
              marginTop:  "3px",
              overflow:   "hidden",
              textOverflow:"ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {taskId.slice(0, 24)}…
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display:   "flex",
          borderTop: "1px solid rgba(15, 23, 42, 0.06)",
        }}
      >
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            style={{
              flex:       1,
              padding:    "7px",
              fontSize:   "11px",
              fontWeight: 600,
              background: "none",
              border:     "none",
              borderRight:"1px solid rgba(15, 23, 42, 0.06)",
              color:      "#64748b",
              cursor:     "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f6f8fb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            ↓ 下载
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              flex:     1,
              padding:  "7px",
              fontSize: "11px",
              fontWeight:600,
              background:"none",
              border:  "none",
              color:   "#dc2626",
              cursor:  "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            ✕ 删除
          </button>
        )}
      </div>
    </div>
  );
}

/* ── AssetGrid ──────────────────────────────────────── */

interface AssetGridProps {
  children: React.ReactNode;
  columns?: number;
}

export function AssetGrid({ children, columns = 3 }: AssetGridProps) {
  return (
    <div
      style={{
        display:              "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap:                 "12px",
      }}
    >
      {children}
    </div>
  );
}
