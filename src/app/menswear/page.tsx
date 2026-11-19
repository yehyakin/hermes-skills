"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { startPolling } from "@/usePolling";
import { AppShell } from "@/components/AppShell";
import { LightGlassPanel as LiquidPanel } from "@/components/liquid/LightGlassPanel";
import LiquidDock from "@/components/liquid/LiquidDock";
import LiquidBadge from "@/components/liquid/LiquidBadge";

const API_BASE = "/api";

// ── Linear Design Tokens (from DESIGN_TOKENS) ───────────────────
const spacing = { xs: "6px", sm: "12px", md: "16px", lg: "20px", xl: "28px" };
const borderRadius = { control: "4px", panel: "8px" };
const typography = { pageTitle: "16px", panelTitle: "13px", body: "13px", caption: "11px" };
const theme = {
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  liquidGlass: {
    background: "rgba(255, 255, 255, 0.45)",
    backdropFilter: "blur(20px)",
    border: "1px solid #ffffff",
    boxShadow: "0 4px 20px 0 rgba(15, 23, 42, 0.04)",
  },
};

interface Asset {
  asset_id: string;
  type: string;
  status: string;
  remote_url: string | null;
  created_at: string;
  parent_asset_ids?: string[];
}

interface WorkflowState {
  workflow_id: string | null;
  task_id: string | null;
  status: string | null;
  monitor_url: string | null;
  provider: string | null;
  parent_asset_ids: string[];
  result_asset: Asset | null;
  events: Array<{ event_type: string; message: string; created_at: string }>;
  error: string | null;
}

const SESSION_KEY = "menswear:last_session";

interface SessionState {
  workflow_id: string | null;
  task_id: string | null;
  monitor_url: string | null;
  selected_model_asset_id: string | null;
  selected_garment_asset_ids: string[];
  result_asset_id: string | null;
  result_asset_status: string | null;
  result_asset_url: string | null;
  status: string | null;
  updated_at: string;
}

function saveSession(s: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, updated_at: new Date().toISOString() }));
  } catch (_) {}
}

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch (_) {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

// ── Helpers ────────────────────────────────────────────────────

function statusColor(s: string | null): string {
  if (!s) return "bg-gray-100 text-gray-600";
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "failed" || s === "invalidated") return "bg-red-100 text-red-700";
  if (s === "running" || s === "external_polling") return "bg-blue-100 text-blue-700";
  if (s === "dry_run_pending") return "bg-orange-100 text-orange-700"; // P3-4B-0
  return "bg-yellow-100 text-yellow-700";
}

function statusIcon(s: string | null): string {
  if (!s) return "⚪";
  if (s === "completed") return "✅";
  if (s === "failed" || s === "invalidated") return "❌";
  if (s === "running" || s === "external_polling") return "🔄";
  if (s === "dry_run_pending") return "🔍"; // P3-4B-0
  return "⏳";
}

function AssetCard({
  asset,
  selected,
  onSelect,
}: {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
}) {
  const typeLabel: Record<string, string> = {
    model_image: "模特",
    top_image: "上装",
    pants_image: "下装",
    generated_tryon_image: "效果图",
    outfit_image: "套装",
  };

return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all
        ${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"}
        ${asset.status === "invalidated" ? "opacity-50" : ""}
      `}
    >
      {/* Thumbnail */}
      <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
        {asset.remote_url ? (
          <img
            src={asset.remote_url}
            alt={asset.asset_id}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-4xl">🖼️</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-mono text-gray-500 truncate" title={asset.asset_id}>
            {asset.asset_id}
          </p>
          {asset.status === "invalidated" && (
            <span className="text-xs bg-red-100 text-red-600 px-1 rounded shrink-0">已失效</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {typeLabel[asset.type] || asset.type}
        </p>
      </div>

      {/* Selected badge */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ✓
        </div>
      )}
    </div>
  );
}

function EventItem({ event_type, message }: { event_type: string; message: string }) {
  const icons: Record<string, string> = {
    task_created: "📋",
    risk_checked: "🔍",
    task_started: "▶️",
    external_completed: "✅",
    asset_registered: "🗂️",
    task_completed: "🎉",
    task_failed: "❌",
    default: "📌",
  };
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-lg shrink-0">{icons[event_type] || icons.default}</span>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  );
}

// ── Page Background (from DESIGN.md layout.page-bg) ───────────────────────────
function LightBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ background: "#f6f8fb" }}>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 10%, rgba(96,165,250,0.14), transparent 32%),
            radial-gradient(circle at 80% 0%, rgba(168,85,247,0.10), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(20,184,166,0.08), transparent 34%),
            #f6f8fb
          `,
        }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function MenswearPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [models, setModels] = useState<Asset[]>([]);
  const [tops, setTops] = useState<Asset[]>([]);
  const [pants, setPants] = useState<Asset[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTops, setSelectedTops] = useState<string[]>([]);
  const [selectedPants, setSelectedPants] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [idemMessage, setIdemMessage] = useState<string | null>(null);

  // ── P3-4C: Custom Prompt ─────────────────────────────────────
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("3:4");

  // ── P3-4A: Image2 Safety Gate ────────────────────────────────
  const [generationMode, setGenerationMode] = useState<"mock" | "real">("mock");
  const [showRealConfirm, setShowRealConfirm] = useState(false);
  const [showDryRunPreview, setShowDryRunPreview] = useState(false);
  const [showIdemPreview, setShowIdemPreview] = useState(false);

  // Derive billing risk from mode
  const billingRiskLevel = generationMode === "mock" ? "none" : "high";
  const billingRiskLabel: Record<string, { text: string; color: string; bg: string }> = {
    none: { text: "无费用", color: "text-gray-600", bg: "bg-gray-100" },
    low: { text: "低费用风险", color: "text-green-700", bg: "bg-green-100" },
    medium: { text: "中费用风险", color: "text-yellow-700", bg: "bg-yellow-100" },
    high: { text: "⚠️ 高费用风险", color: "text-red-700", bg: "bg-red-100" },
  };

  // Compute stable idempotency_key from current inputs
  const computeIdemKey = useCallback(() => {
    const project = "SUPERCOLOR_MENSWEAR_WORKFLOW";
    const workflow_mode = "single_outfit";
    const modelId = selectedModel || "";
    const garmentIds = [...selectedTops, ...selectedPants].sort().join("+");
    const provider = "image2";
    const version = "v1";
    const raw = `${project}:${workflow_mode}:${modelId}:${garmentIds}:${provider}:${version}`;
    // Simple deterministic hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    const hashStr = Math.abs(hash).toString(16).padStart(8, "0");
    return `menswear-${hashStr}`;
  }, [selectedModel, selectedTops, selectedPants]);

  const idemKey = computeIdemKey();

  // ── P3-4B-0: Dry Run Payload Preview ────────────────────────
  const dryRunPayload = useCallback(() => ({
    project: "SUPERCOLOR_MENSWEAR_WORKFLOW",
    workflow_mode: "single_outfit",
    provider: "image2",
    parent_assets: {
      model_asset_id: selectedModel,
      garment_asset_ids: [...selectedTops, ...selectedPants],
    },
    generation_config: {
      provider: "image2",
      result_type: "generated_tryon_image",
      ...(customPrompt ? { prompt: customPrompt } : {}),
      size: selectedSize,
      n: 1,
    },
    idempotency_key: idemKey,
    billing_risk_level: "high",
    dry_run: true,
    payload: {},
  }), [selectedModel, selectedTops, selectedPants, idemKey, customPrompt, selectedSize]);

  const dryRunSummary = useCallback(() => ({
    provider: "OpenAI GPT Image 2 (image2)",
    billing_risk_level: "high",
    idempotency_key: idemKey,
    model_asset_id: selectedModel,
    garment_asset_ids: [...selectedTops, ...selectedPants],
    garment_count: selectedTops.length + selectedPants.length,
    ...(customPrompt ? { custom_prompt: customPrompt } : {}),
    size: selectedSize,
    note: "⚠️ Dry Run：只创建任务，不调用真实 Image2 API",
  }), [selectedModel, selectedTops, selectedPants, idemKey, customPrompt, selectedSize]);
  // ── End P3-4B-0 ─────────────────────────────────────────────

  // ── End P3-4A ───────────────────────────────────────────────

  const [pendingAction, setPendingAction] = useState<{
    type: "replace" | "remove";
    assetType: "model" | "top" | "pants";
    assetLabel: string;
    assetId: string;
    newAssetId?: string;
  } | null>(null);
  const [wf, setWf] = useState<WorkflowState>({
    workflow_id: null,
    task_id: null,
    status: null,
    monitor_url: null,
    provider: null,
    parent_asset_ids: [],
    result_asset: null,
    events: [],
    error: null,
  });
  const stopPolling = useRef<(() => void) | null>(null);

  const sessionRestoredRef = useRef(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  const restoreSession = useCallback(() => {
    if (sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;

    const saved = loadSession();
    if (!saved) {
      setSessionRestored(true);
      return;
    }

    // Restore selected model
    if (saved.selected_model_asset_id) {
      setSelectedModel(saved.selected_model_asset_id);
    }
    // Restore workflow state if workflow_id exists
    if (saved.workflow_id) {
      setWf({
        workflow_id: saved.workflow_id,
        task_id: saved.task_id || null,
        status: saved.status || null,
        monitor_url: saved.monitor_url || null,
        provider: null,
        parent_asset_ids: [],
        result_asset: saved.result_asset_id
          ? {
              asset_id: saved.result_asset_id,
              status: saved.result_asset_status || "unknown",
              remote_url: saved.result_asset_url || null,
              type: "generated_tryon_image",
              created_at: "",
              parent_asset_ids: [],
            }
          : null,
        events: [],
        error: null,
      });
    }
    setSessionRestored(true);
  }, []);

  // ── Load assets ──────────────────────────────────────────────
  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/assets/list`);
      const data = await res.json();
      const allAssets: Asset[] = data.assets || [];
      setAssets(allAssets);
      setModels(allAssets.filter((a) => a.type === "model_image" && a.status === "active"));
      setTops(allAssets.filter((a) => a.type === "top_image" && a.status === "active"));
      setPants(allAssets.filter((a) => a.type === "pants_image" && a.status === "active"));
    } catch (e) {
      console.error("Failed to load assets:", e);
    } finally {
      restoreSession();
    }
  }, [restoreSession]);

  // ── Save session helper ─────────────────────────────────────────
  const saveCurrentSession = useCallback(() => {
    saveSession({
      workflow_id: wf.workflow_id,
      task_id: wf.task_id,
      monitor_url: wf.monitor_url,
      selected_model_asset_id: selectedModel,
      selected_garment_asset_ids: [...selectedTops, ...selectedPants],
      result_asset_id: wf.result_asset?.asset_id ?? null,
      result_asset_status: wf.result_asset?.status ?? null,
      result_asset_url: wf.result_asset?.remote_url ?? null,
      status: wf.status,
      updated_at: new Date().toISOString(),
    });
  }, [wf, selectedModel, selectedTops, selectedPants]);

  // ── Auto-save on state changes ────────────────────────────────
  useEffect(() => {
    if (!sessionRestored) return;
    saveCurrentSession();
  }, [saveCurrentSession, sessionRestored]);

  // ── Poll workflow status ─────────────────────────────────────
  const pollWorkflow = useCallback(async (workflow_id: string) => {
    try {
      const res = await fetch(`${API_BASE}/workflow/monitor/${workflow_id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setWf((prev) => ({
        ...prev,
        status: data.status,
        provider: data.provider,
        monitor_url: data.monitor_url,
        parent_asset_ids: data.asset_ids || [],
        result_asset: data.result_asset || null,
        error: null,
      }));

      // Stop polling on terminal state
      if (["completed", "failed", "invalidated", "dry_run_pending"].includes(data.status)) {
        stopPolling.current?.();
        stopPolling.current = null;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setWf((prev) => ({ ...prev, error: `轮询失败: ${msg}` }));
    }
  }, []);

  // ── Load events for current workflow ─────────────────────────
  const loadEvents = useCallback(async () => {
    if (!wf.workflow_id) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${wf.workflow_id}/events`);
      const data = await res.json();
      if (data.events) {
        setWf((prev) => ({ ...prev, events: data.events }));
      }
    } catch (e) {
      console.error("Failed to load events:", e);
    }
  }, [wf.workflow_id]);

  // Poll when workflow_id is set
  useEffect(() => {
    const workflowId = wf.workflow_id;
    if (!workflowId) return;
    const stop = startPolling(() => {
      pollWorkflow(workflowId);
      loadEvents();
    }, 3000);
    stopPolling.current = stop;
    return stop;
  }, [wf.workflow_id, pollWorkflow, loadEvents]);

  // ── Submit workflow ───────────────────────────────────────────
  const handleSubmit = async () => {
    // Validation
    if (!selectedModel) {
      alert("请选择模特图");
      return;
    }
    if (selectedTops.length === 0 && selectedPants.length === 0) {
      alert("请至少选择一个服装（上装或下装）");
      return;
    }

    // P3-4A: Real mode requires explicit confirmation
    if (generationMode === "real") {
      // P3-4B-0: Show detailed dry run preview first
      setShowDryRunPreview(true);
      return; // Wait for confirmation
    }

    await submitWorkflow("mock");
  };

  // Actual submission (called after confirmation in real mode)
  const submitWorkflow = async (mode: "mock" | "real") => {
    setSubmitting(true);
    setShowRealConfirm(false);
    setShowDryRunPreview(false);
    setWf({
      workflow_id: null,
      task_id: null,
      status: "pending",
      monitor_url: null,
      provider: null,
      parent_asset_ids: [],
      result_asset: null,
      events: [],
      error: null,
    });

    const body = {
      project: "SUPERCOLOR_MENSWEAR_WORKFLOW",
      workflow_mode: "single_outfit",
      provider: "image2",
      parent_assets: {
        model_asset_id: selectedModel,
        garment_asset_ids: [...selectedTops, ...selectedPants],
      },
      generation_config: {
        provider: "image2",
        result_type: "generated_tryon_image",
        ...(customPrompt ? { prompt: customPrompt } : {}),
        size: selectedSize,
        n: 1,
      },
      idempotency_key: idemKey,
      billing_risk_level: mode === "mock" ? "none" : "high",
      dry_run: mode === "real", // P3-4B-0: true = dry run, no real API call
      ...(mode === "mock"
        ? {
            payload: {
              __test_result: `https://cdn.supercolor.ai/generated/menswear-${Date.now()}.jpg`,
              result_type: "generated_tryon_image",
            },
          }
        : {
            // Real Image2 Dry Run: payload hints (backend won't call external API)
            payload: {
              __dry_run_hints: {
                model_asset_id: selectedModel,
                garment_asset_ids: [...selectedTops, ...selectedPants],
                note: "P3-4B-0 dry run: no real API call",
                ...(customPrompt ? { prompt: customPrompt } : {}),
                size: selectedSize,
              },
              result_type: "generated_tryon_image",
            },
          }),
    };

    try {
      const res = await fetch(`${API_BASE}/workflow/generate-outfit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || `HTTP ${res.status}`);

      setWf((prev) => ({
        ...prev,
        workflow_id: data.workflow_id,
        status: data.status,
        error: null,
      }));
      if (data.idempotent_match) {
        setIdemMessage(`🔄 已恢复已有 workflow（幂等匹配）: ${data.workflow_id}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setWf((prev) => ({ ...prev, status: null, error: `提交失败: ${msg}` }));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle garment selection ──────────────────────────────────
  const toggleGarment = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  // ── Upload asset ────────────────────────────────────────────────
  const handleUpload = async (file: File, assetType: string) => {
    setUploadingType(assetType);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("asset_type", assetType);
      formData.append("name", file.name.replace(/\.[^.]+$/, ""));

      const res = await fetch(`${API_BASE}/assets/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `上传失败: HTTP ${res.status}`);
      }

      const data = await res.json();

      // Reload assets list
      await loadAssets();

      // Auto-select the uploaded asset
      if (assetType === "model_image") {
        setSelectedModel(data.asset_id);
      } else if (assetType === "top_image") {
        setSelectedTops((prev) => [...new Set([...prev, data.asset_id])]);
      } else if (assetType === "pants_image") {
        setSelectedPants((prev) => [...new Set([...prev, data.asset_id])]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setUploadError(msg);
    } finally {
      setUploadingType(null);
    }
  };

  // ── Check if changing selection would invalidate active result ──
  const hasActiveResult = wf.result_asset?.status === "active";

  const confirmOrExecute = (
    action: typeof pendingAction extends infer T ? T extends null ? never : T : never,
    executeFn: () => void
  ) => {
    if (hasActiveResult) {
      setPendingAction(action);
    } else {
      executeFn();
    }
  };

  // ── Confirm pending action → invalidate + apply ──────────────────
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const action = pendingAction;

    // If there's an active result, call invalidate
    if (hasActiveResult && wf.result_asset) {
      try {
        await fetch(`${API_BASE}/assets/${wf.result_asset.asset_id}/invalidate`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: `${action.assetType}_${action.type === "replace" ? "replaced" : "deleted"}`,
            invalidated_by: "menswear_ui",
          }),
        });
      } catch (e) {
        console.error("Invalidate failed:", e);
      }
    }

    // Apply the change
    if (action.type === "remove") {
      if (action.assetType === "model") setSelectedModel(null);
      if (action.assetType === "top") setSelectedTops((p) => p.filter((x) => x !== action.assetId));
      if (action.assetType === "pants") setSelectedPants((p) => p.filter((x) => x !== action.assetId));
    } else if (action.type === "replace" && action.newAssetId) {
      if (action.assetType === "model") setSelectedModel(action.newAssetId);
      if (action.assetType === "top") {
        setSelectedTops((p) => [...p.filter((x) => x !== action.assetId), action.newAssetId!]);
      }
      if (action.assetType === "pants") {
        setSelectedPants((p) => [...p.filter((x) => x !== action.assetId), action.newAssetId!]);
      }
    }

    // Invalidate workflow state since parent changed
    setWf((prev) => ({
      ...prev,
      result_asset: hasActiveResult && wf.result_asset
        ? { ...wf.result_asset, status: "invalidated" }
        : prev.result_asset,
      status: hasActiveResult ? "invalidated" : prev.status,
    }));

    setPendingAction(null);
  };

  // ── Cancel pending action ────────────────────────────────────────
  const handleCancelAction = () => {
    setPendingAction(null);
  };

  // ── Invalidate result ────────────────────────────────────────
  const handleInvalidate = async (asset_id: string) => {
    if (!confirm("确定要标记该结果为失效吗？失效后将无法作为 Seedance 首帧继续使用。")) return;
    try {
      await fetch(`${API_BASE}/assets/${asset_id}/lineage`, { method: "POST" });
      // Reload assets to reflect change
      loadAssets();
      setWf((prev) => ({
        ...prev,
        status: prev.result_asset?.asset_id === asset_id ? "invalidated" : prev.status,
        result_asset: prev.result_asset?.asset_id === asset_id
          ? { ...prev.result_asset, status: "invalidated" }
          : prev.result_asset,
      }));
    } catch (e) {
      console.error("Invalidate failed:", e);
    }
  };

  // ── Can submit ───────────────────────────────────────────────
  const canSubmit =
    selectedModel &&
    (selectedTops.length > 0 || selectedPants.length > 0) &&
    !submitting &&
    !wf.workflow_id;

  const isPolling = wf.workflow_id && !["completed", "failed", "invalidated", "dry_run_pending"].includes(wf.status || "");

  // ── Upload UI ─────────────────────────────────────────────────
  // Single hidden file input, triggered by section buttons
  const [pendingUploadType, setPendingUploadType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerUpload = (assetType: string) => {
    setPendingUploadType(assetType);
    fileInputRef.current?.click();
  };
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadType) return;
    await handleUpload(file, pendingUploadType);
    setPendingUploadType(null);
    e.target.value = ""; // reset so same file can be re-selected
  };

  return (
    <AppShell>
    <div className="relative" style={{ background: "#f6f8fb", height: "calc(100vh - 64px)" }}>
      <LightBackground />

      {/* ── STUDIO HEADER ─────────────────────────────────────────────────────── */}
      <LiquidPanel variant="light" className="w-full h-14 flex items-center px-6 gap-5 rounded-b-2xl !rounded-t-none z-10">
        <span className="text-base font-semibold" style={{ color: "#0f172a", letterSpacing: "-0.08px" }}>男装工作流</span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(8,145,178,0.08)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: generationMode === "real" ? "#ef4444" : "#22c55e" }} />
          <span className="text-sm font-medium" style={{ color: "#0f172a" }}>
            {generationMode === "real" ? "⚠️ 真实模式" : "✓ 模拟模式"}
          </span>
        </div>
        <div className="flex-1" />
        <LiquidBadge
          tone={(billingRiskLevel as string) === "none" ? "slate" : (billingRiskLevel as string) === "low" ? "green" : (billingRiskLevel as string) === "medium" ? "amber" : "red"}
          label={billingRiskLabel[billingRiskLevel]?.text ?? billingRiskLevel}
          size="sm"
        />
      </LiquidPanel>

      {/* ── HIDDEN FILE INPUT ─────────────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex gap-5 p-5 h-full box-border">

        {/* ── LEFT (40%) — 参数控制面板 ──────────────────────────────────────── */}
        <div className="w-[38%] flex flex-col gap-4 overflow-y-auto">

          {/* Section 1: Size Ratio */}
          <LiquidPanel variant="light" className="flex flex-col gap-3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b", letterSpacing: "-0.08px" }}>① 尺寸比例</div>
            <div className="flex gap-2 p-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
              {["1:1", "3:4", "4:3", "9:16", "16:9"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedSize(ratio)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    background: selectedSize === ratio ? "#ffffff" : "transparent",
                    color: selectedSize === ratio ? "#111827" : "#64748b",
                    boxShadow: selectedSize === ratio ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    fontWeight: selectedSize === ratio ? 600 : 400,
                  }}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </LiquidPanel>

          {/* Section 2: Asset Slots */}
          <LiquidPanel variant="light" className="flex flex-col gap-3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b", letterSpacing: "-0.08px" }}>② 服装参考图</div>
            {/* Tops + Bottoms */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px dashed rgba(0,0,0,0.12)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                }}
                onClick={() => triggerUpload("top_image")}
              >
                <span className="text-2xl">👔</span>
                <span className="text-xs font-semibold" style={{ color: "#7c3aed" }}>
                  {selectedTops.length > 0 ? `上装 ×${selectedTops.length}` : "上装"}
                </span>
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  {selectedTops.length === 0 ? "点击上传" : "已选"}
                </span>
              </div>
              <div
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px dashed rgba(0,0,0,0.12)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                }}
                onClick={() => triggerUpload("pants_image")}
              >
                <span className="text-2xl">👖</span>
                <span className="text-xs font-semibold" style={{ color: "#0891b2" }}>
                  {selectedPants.length > 0 ? `下装 ×${selectedPants.length}` : "下装"}
                </span>
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  {selectedPants.length === 0 ? "点击上传" : "已选"}
                </span>
              </div>
            </div>
            {/* Model slot */}
            <div
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px dashed rgba(0,0,0,0.12)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              }}
              onClick={() => triggerUpload("model_image")}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                    {selectedModel ? "目标模特图" : "选择模特图"}
                  </div>
                  <div className="text-xs" style={{ color: "#94a3b8" }}>
                    {selectedModel ? selectedModel.slice(0, 24) + "..." : "点击上传模特图"}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#3b82f6" }}>更换</span>
            </div>
          </LiquidPanel>

          {/* Section 3: Prompt + Safety Gate */}
          <LiquidPanel variant="light" className="flex flex-col gap-3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b", letterSpacing: "-0.08px" }}>③ 提示词 &amp; 安全门</div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="留空使用默认模板，或输入自定义提示词..."
              className="w-full h-20 p-3 rounded-xl text-sm resize-none outline-none"
              style={{
                background: "rgba(255,255,255,0.80)",
                border: "1px solid rgba(255,255,255,0.90)",
                color: "#111827",
                fontFamily: "inherit",
              }}
            />
            {/* Safety gate */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>Real API 执行门</div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>开启后调用真实生产接口并产生计费</div>
              </div>
              <button
                onClick={() => setGenerationMode((m) => m === "mock" ? "real" : "mock")}
                disabled={!!wf.workflow_id}
                className="relative w-10 h-5 rounded-full transition-all duration-200"
                style={{
                  background: generationMode === "real" ? "#ef4444" : "#d1d5db",
                  cursor: wf.workflow_id ? "not-allowed" : "pointer",
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                  style={{ left: generationMode === "real" ? "22px" : "2px" }}
                />
              </button>
            </div>
          </LiquidPanel>
        </div>

        {/* ── RIGHT (62%) — 预览画布 ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Preview Canvas */}
          <LiquidPanel variant="light" intensity="high" className="flex-1 flex flex-col items-center justify-center rounded-2xl min-h-64 relative">
            {/* Status badge */}
            {wf.status && (
              <div
                className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
                style={{
                  background: wf.status === "completed"
                    ? "rgba(34,197,94,0.10)"
                    : wf.status === "failed"
                    ? "rgba(239,68,68,0.10)"
                    : "rgba(59,130,246,0.10)",
                  color: wf.status === "completed"
                    ? "#16a34a"
                    : wf.status === "failed"
                    ? "#ef4444"
                    : "#3b82f6",
                }}
              >
                {wf.status === "completed" ? "✅ 已完成"
                  : wf.status === "failed" ? "❌ 失败"
                  : wf.status === "external_polling" || wf.status === "running"
                  ? "🔄 处理中"
                  : `⏳ ${wf.status}`}
              </div>
            )}

            {/* Canvas frame */}
            <div
              className="flex flex-col items-center justify-center rounded-lg overflow-hidden"
              style={{
                width: selectedSize === "9:16" ? 200 : selectedSize === "3:4" ? 260 : 280,
                height: selectedSize === "9:16" ? 356 : selectedSize === "3:4" ? 347 : 210,
                background: wf.result_asset?.remote_url ? "transparent" : "#ffffff",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              {wf.result_asset?.remote_url ? (
                <img
                  src={wf.result_asset.remote_url}
                  alt="生成结果"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-3">👕</div>
                  <div className="text-xs font-mono" style={{ color: "#94a3b8" }}>
                    穿搭结果预览 ({selectedSize})
                  </div>
                </div>
              )}
            </div>

            {/* Lineage bar */}
            <div
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(255,255,255,0.90)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: "#16a34a" }}>🪵</span>
                <span className="text-xs" style={{ color: "#64748b" }}>
                  {wf.parent_asset_ids.length > 0
                    ? `${wf.parent_asset_ids.length} 个母资产 → 有效结果`
                    : "暂无资产血脉"}
                </span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  background: wf.result_asset?.status === "active"
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(0,0,0,0.03)",
                  color: wf.result_asset?.status === "active" ? "#16a34a" : "#94a3b8",
                }}
              >
                {wf.result_asset?.status === "active" ? "有效"
                  : wf.result_asset?.status === "invalidated" ? "已失效"
                  : "草稿"}
              </span>
            </div>
          </LiquidPanel>

          {/* Action Dock */}
          <LiquidDock
            mode="light"
            items={[
              {
                icon: "🔍",
                label: "干跑预览",
                onClick: () => setShowDryRunPreview(true),
                active: false,
              },
              {
                icon: generationMode === "real" ? "⚡" : "🚀",
                label: generationMode === "real" ? "Real 生产" : "Mock 生成",
                onClick: handleSubmit,
                active: true,
                danger: generationMode === "real",
              },
              {
                icon: "↺",
                label: "重置",
                onClick: () => { clearSession(); setWf({ workflow_id: null, task_id: null, status: null, monitor_url: null, provider: null, parent_asset_ids: [], result_asset: null, events: [], error: null }); },
                danger: true,
              },
              {
                icon: "↗",
                label: "查看任务",
                onClick: () => wf.task_id ? window.open(`/tasks/${wf.task_id}`, "_blank") : undefined,
              },
            ]}
          />

          {/* Idempotency key */}
          <div className="text-xs font-mono text-right" style={{ color: "#94a3b8" }} title={idemKey}>
            idem: {idemKey}
          </div>

          {/* Error */}
          {wf.error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444",
              }}
            >
              {wf.error}
            </div>
          )}

          {/* Idempotency message */}
          {idemMessage && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                color: "#3b82f6",
              }}
            >
              {idemMessage}
            </div>
          )}
        </div>
      </div>

      {/* ── DRY RUN MODAL ────────────────────────────────────────────────────── */}
      {showDryRunPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.30)" }}
        >
          <LiquidPanel variant="lightStrong" className="max-w-lg w-[90%] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ background: "rgba(251,191,36,0.12)" }}
              >
                🔍
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold" style={{ color: "#111827", margin: 0 }}>
                  真实图生图 干跑预览
                </h3>
                <div className="flex gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                  >
                    billing_risk_level: high
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ background: "rgba(251,191,36,0.08)", color: "#d97706" }}
                  >
                    DRY RUN — 不调用真实 API
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "供应商", value: "OpenAI GPT Image 2", sub: "image2" },
                  { label: "幂等键", value: idemKey.slice(0, 24) + "..." },
                  { label: "模特资产", value: selectedModel ? selectedModel.slice(0, 20) + "..." : "—" },
                  { label: "服装数量", value: `${selectedTops.length + selectedPants.length} 件`, sub: `上装 ${selectedTops.length} / 下装 ${selectedPants.length}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.03)" }}
                  >
                    <div className="text-xs mb-1" style={{ color: "#94a3b8" }}>{item.label}</div>
                    <div className="text-sm font-mono font-semibold truncate" style={{ color: "#0f172a" }}>{item.value}</div>
                    {item.sub && <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{item.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Payload JSON */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>完整请求体</div>
                <div
                  className="rounded-xl p-4 max-h-48 overflow-auto"
                  style={{ background: "#0f172a" }}
                >
                  <pre
                    className="text-xs font-mono"
                    style={{ color: "#4ade80", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0 }}
                  >
                    {JSON.stringify(dryRunPayload(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 p-5 border-t"
              style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}
            >
              <button
                onClick={() => setShowDryRunPreview(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "#111827",
                }}
              >
                取消
              </button>
              <button
                onClick={() => submitWorkflow("real")}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "#d97706",
                  border: "none",
                  color: "#ffffff",
                  opacity: submitting ? 0.5 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "提交中..." : "✅ 确认 Dry Run"}
              </button>
            </div>
          </LiquidPanel>
        </div>
      )}
    </div>
    </AppShell>
  );
}
