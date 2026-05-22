"use client";
import "@/styles/light-tokens.css";
import "@/app/globals.css";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Dark pages — design showcase + terminal (intentionally dark)
  const isDarkPage =
    pathname === "/design-preview" ||
    pathname === "/codex-hermes";

  // Pages using Light AppShell (inline sidebar, no old Navigation)
  const isLightShell =
    pathname === "/" ||
    pathname === "/agents" ||
    pathname === "/tasks" ||
    pathname === "/menswear" ||
    pathname === "/glass-demo" ||
    pathname.startsWith("/tasks/");

  // Light standalone pages (gradient bg, own page-level container)
  const isLightPage =
    pathname === "/assets" ||
    pathname === "/risks" ||
    pathname === "/logs";

  // Light shell gradient — three soft radial layers for spatial depth
  const lightBg =
    "radial-gradient(circle at 20% 10%, rgba(96,165,250,0.14), transparent 32%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.10), transparent 30%), radial-gradient(circle at 50% 100%, rgba(20,184,166,0.08), transparent 34%), #f6f8fb";

  return (
    <html lang="en" className="h-full">
      <body
        className={`min-h-full flex antialiased ${
          isLightShell ? "" : isDarkPage ? "bg-[#05070a]" : "bg-[#f6f8fb]"
        }`}
        style={isLightShell || isLightPage ? { background: lightBg } : undefined}
      >
        {!isDarkPage && !isLightShell && !isLightPage && <Navigation />}
        <main className={`${isDarkPage ? "w-full h-screen flex flex-col" : "flex-1 overflow-auto"}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
