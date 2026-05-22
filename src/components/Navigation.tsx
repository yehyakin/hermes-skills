"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/risks", label: "Risks", icon: "⚠️" },
  { href: "/logs", label: "Logs", icon: "📝" },
  { href: "/menswear", label: "男装工作流", icon: "👔" },
  { href: "/codex-hermes", label: "Codex ↔ Hermes", icon: "🔄" },
  { href: "/assets", label: "素材库", icon: "🗂️" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="min-h-screen w-64 bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-400">SUPERCOLOR AI</h1>
        <p className="text-sm text-gray-400">Command Center v1.0</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p>Backend: /api (proxy)</p>
          <p>Frontend: LAN mode</p>
        </div>
      </div>
    </nav>
  );
}
