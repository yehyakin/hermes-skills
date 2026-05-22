"use client";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray" | "orange" | "slate";
  trend?: "up" | "down" | "stable";
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  gray: "bg-gray-500",
  orange: "bg-orange-500",
  slate: "bg-slate-500",
};

const textColorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
  purple: "text-purple-600",
  gray: "text-gray-600",
  orange: "text-orange-600",
  slate: "text-slate-600",
};

export default function StatusCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
}: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "stable" && "→"}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
