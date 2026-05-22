"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { TOKENS } from "@/components/designTokens";
import { ClientOnlyText } from "@/components/ClientOnlyText";
import { LightGlassPanel } from "@/components/liquid/LightGlassPanel";

const { spacing, borderRadius, typography, theme } = TOKENS;

const API_BASE = "/api";

interface Asset {
  id: string;
  type: "image" | "video";
  name: string;
  toapis_url: string;
  url?: string;
  remote_url?: string;
  file_url?: string;
  local_path?: string;
  task_id?: string;
  style?: string;
  size_bytes?: number;
  created_at: string;
}

interface Library {
  images: Asset[];
  videos: Asset[];
}

const getAssetUrl = (asset: Asset): string => {
  return asset.toapis_url || asset.url || asset.remote_url || asset.file_url || "";
};

type Tab = "all" | "images" | "videos";

function formatSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Asset Card ─────────────────────────────────────────────────
function AssetCard({
  asset,
  onDownload,
}: {
  asset: Asset;
  onDownload: (a: Asset) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const url = getAssetUrl(asset);

  return (
    <div
      style={{
        backgroundColor: theme.surface,
        border: theme.border,
        borderRadius: borderRadius.panel,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 24px rgba(15,23,42,0.06)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "none")
      }
    >
      {/* 1:1 Aspect Ratio Preview */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          backgroundColor: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: theme.border,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {asset.type === "image" ? (
          <>
            {!imgLoaded && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  position: "absolute",
                }}
              >
                加载中...
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={asset.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s",
              }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "36px" }}>📹</span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              点击预览视频
            </span>
          </div>
        )}

        {/* Type Badge */}
        <span
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            fontSize: "10px",
            backgroundColor: "rgba(0,0,0,0.55)",
            color: "#ffffff",
            padding: "2px 6px",
            borderRadius: "3px",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {asset.type === "image" ? "IMG" : "VID"}
        </span>

        {/* Hover Actions */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 14px",
              backgroundColor: "#0891b2",
              color: "#ffffff",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {asset.type === "video" ? "🎬 播放" : "👁 预览"}
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(asset);
            }}
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            ⬇ 下载
          </button>
        </div>
      </div>

      {/* Info Footer */}
      <div
        style={{
          padding: spacing.sm,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            fontSize: typography.body,
            fontWeight: 600,
            color: theme.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={asset.name}
        >
          {asset.style || asset.name || "素材"}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ClientOnlyText fallback="--" render={() => timeAgo(asset.created_at)} />
          <span> · </span>
          <span>{formatSize(asset.size_bytes)}</span>
          {asset.task_id && (
            <StatusPill type="cyan" label="已生成" />
          )}
        </div>
        {asset.task_id && (
          <div
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={asset.task_id}
          >
            {asset.task_id.slice(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AssetsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [images, setImages] = useState<Asset[]>([]);
  const [videos, setVideos] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);

  // Avoid hydration mismatch — only run relative time on client
  useEffect(() => { setMounted(true); }, []);

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/assets`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = (await res.json()) as Library;
      const imgs = Array.isArray(json?.images) ? json.images : [];
      const vids = Array.isArray(json?.videos) ? json.videos : [];
      setImages(imgs);
      setVideos(vids);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Assets] Failed to load:", err);
      setError(msg || "素材加载失败");
      setImages([]);
      setVideos([]);
    } finally {
      setLoading(false);
      setLastSync(new Date());
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
    const id = setInterval(fetchLibrary, 10000);
    return () => clearInterval(id);
  }, [fetchLibrary]);

  const handleDownload = (asset: Asset) => {
    const a = document.createElement("a");
    a.href = getAssetUrl(asset);
    a.download = asset.name || `asset_${asset.id}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddDemo = async () => {
    setAdding(true);
    try {
      await fetch(`${API_BASE}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab === "videos" ? "video" : "image",
          name: `${tab === "videos" ? "视频" : "图片"}_${Date.now()}`,
          toapis_url:
            tab === "videos"
              ? "https://files.toapis.com/images/tsk_vid_01KS6CD9WKXVN7JZR7B519K2SS/1779404665_e7e9b465.mp4"
              : "https://files.toapis.com/images/tsk_img_01KS6C59EYYE68YBQJMK7HN2DJ/1779404421_34a478bd.png",
          style: "真实街拍",
        }),
      });
      await fetchLibrary();
    } finally {
      setAdding(false);
    }
  };

  const imageCount = images.length;
  const videoCount = videos.length;
  const totalCount = imageCount + videoCount;

  const currentAssets =
    tab === "all"
      ? [...images, ...videos]
      : tab === "images"
      ? images
      : videos;

  return (
    <AppShell>
    <LightGlassPanel
      variant="light"
      intensity="low"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: spacing.lg,
        minHeight: "100vh",
      }}
    >
      {/* ── Top Control Bar ── */}
      <div
        style={{
          ...theme.liquidGlass,
          borderRadius: borderRadius.panel,
          padding: spacing.sm,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setTab("all")}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: borderRadius.control,
              backgroundColor: tab === "all" ? "#ffffff" : "transparent",
              color: tab === "all" ? theme.textPrimary : theme.textSecondary,
              fontSize: typography.caption,
              fontWeight: tab === "all" ? 600 : 400,
              cursor: "pointer",
              boxShadow: tab === "all" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s",
            }}
          >
            全部资产 ({totalCount})
          </button>
          <button
            onClick={() => setTab("images")}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: borderRadius.control,
              backgroundColor: tab === "images" ? "#ffffff" : "transparent",
              color: tab === "images" ? theme.textPrimary : theme.textSecondary,
              fontSize: typography.caption,
              fontWeight: tab === "images" ? 600 : 400,
              cursor: "pointer",
              boxShadow: tab === "images" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s",
            }}
          >
            📷 图片 ({imageCount})
          </button>
          <button
            onClick={() => setTab("videos")}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: borderRadius.control,
              backgroundColor: tab === "videos" ? "#ffffff" : "transparent",
              color: tab === "videos" ? theme.textPrimary : theme.textSecondary,
              fontSize: typography.caption,
              fontWeight: tab === "videos" ? 600 : 400,
              cursor: "pointer",
              boxShadow: tab === "videos" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.15s",
            }}
          >
            🎬 视频 ({videoCount})
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: spacing.sm }}>
          <button
            onClick={fetchLibrary}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ffffff",
              color: theme.textPrimary,
              border: theme.border,
              borderRadius: borderRadius.control,
              fontSize: typography.caption,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ↻ 刷新
          </button>
          <button
            onClick={handleAddDemo}
            disabled={adding}
            style={{
              padding: "6px 12px",
              backgroundColor: "#0891b2",
              color: "#ffffff",
              border: "none",
              borderRadius: borderRadius.control,
              fontSize: typography.caption,
              fontWeight: 600,
              cursor: adding ? "not-allowed" : "pointer",
              opacity: adding ? 0.5 : 1,
            }}
          >
            {adding ? "添加中..." : "➕ 添加素材"}
          </button>
        </div>
      </div>

      {/* ── Stats Bar (client-only, avoids hydration mismatch) ── */}
      {mounted && lastSync && (
        <div
          style={{
            fontSize: "11px",
            color: theme.textSecondary,
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <StatusPill type="green" label="数据同步正常" />
          <span>·</span>
          <span>最近更新: </span>
          <ClientOnlyText fallback="--" render={() => timeAgo(lastSync.toISOString())} />
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              color: theme.textSecondary,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(0,0,0,0.06)",
                borderTopColor: "#0891b2",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: "13px" }}>加载中...</span>
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              ...theme.liquidGlass,
              borderRadius: borderRadius.panel,
              padding: "24px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "32px" }}>⚠️</span>
            <p style={{ fontSize: "14px", color: "#dc2626", fontWeight: 600 }}>
              {error}
            </p>
            <button
              onClick={fetchLibrary}
              style={{
                padding: "8px 20px",
                backgroundColor: "#0891b2",
                color: "#ffffff",
                border: "none",
                borderRadius: borderRadius.control,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 重试
            </button>
          </div>
        </div>
      ) : currentAssets.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "48px" }}>🗂️</span>
          <p
            style={{
              fontSize: "14px",
              color: theme.textSecondary,
              fontWeight: 600,
            }}
          >
            暂无{tab === "all" ? "" : tab === "images" ? "图片" : "视频"}素材
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>
            生成的图片和视频会自动出现在这里
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: spacing.lg,
            width: "100%",
          }}
        >
          {currentAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* ── Spin Animation ── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </LightGlassPanel>
    </AppShell>
  );
}
