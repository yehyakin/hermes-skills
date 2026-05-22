"use client";

import { ReactNode } from "react";

export default function DesignPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
