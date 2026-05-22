"use client";

import { useState } from "react";

// Shared risk item interface (compatible with both old RiskConfirmation and new RiskItem)
interface RiskConfirmation {
  id: number | string;
  task_id: string;
  source?: "risk_confirmations" | "tasks";
  risk_level: string;
  risk_reason: string;
  status: string;
  confirmed_by?: string;
  confirmed_at?: string;
  requires_confirmation?: boolean;
  original_message?: string;
}

interface RiskConfirmCardProps {
  risk: RiskConfirmation;
  taskMessage?: string;
  onConfirm: (taskId: string) => void;
  onCancel: (taskId: string) => void;
}

const riskLevelConfig: Record<
  string,
  { color: string; icon: string; bgColor: string }
> = {
  high: { color: "text-red-600", icon: "⚠️", bgColor: "bg-red-50 border-red-200" },
  medium: {
    color: "text-yellow-600",
    icon: "⚡",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  critical: {
    color: "text-red-800",
    icon: "🚨",
    bgColor: "bg-red-100 border-red-300",
  },
};

export default function RiskConfirmCard({
  risk,
  taskMessage,
  onConfirm,
  onCancel,
}: RiskConfirmCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const config = riskLevelConfig[risk.risk_level] || riskLevelConfig.medium;

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm(risk.task_id);
  };

  const handleCancel = () => {
    onCancel(risk.task_id);
  };

  return (
    <div
      className={`border-2 rounded-xl p-6 ${config.bgColor} ${
        risk.status === "confirmed" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              Risk Confirmation Required
            </h3>
            <p className={`text-sm ${config.color} font-medium`}>
              Level: {risk.risk_level.toUpperCase()}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            risk.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {risk.status === "confirmed" ? "Confirmed" : "Pending"}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Task ID
          </p>
          <p className="font-mono text-sm bg-white px-2 py-1 rounded">
            {risk.task_id}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Risk Reason
          </p>
          <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border">
            {risk.risk_reason || "No reason provided"}
          </p>
        </div>

        {taskMessage && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Original Message
            </p>
            <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border max-h-24 overflow-y-auto">
              {taskMessage}
            </p>
          </div>
        )}

        {risk.status === "confirmed" && (
          <div className="text-xs text-gray-500">
            Confirmed by {risk.confirmed_by} at{" "}
            {risk.confirmed_at
              ? new Date(risk.confirmed_at).toLocaleString()
              : "-"}
          </div>
        )}
      </div>

      {risk.status === "pending" && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isConfirming ? "Confirming..." : "✅ Confirm & Proceed"}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ❌ Cancel Task
          </button>
        </div>
      )}
    </div>
  );
}
