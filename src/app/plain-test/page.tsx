"use client";

import { useCallback, useState } from "react";
import { ClientOnlyText } from "@/components/ClientOnlyText";

export default function PlainTest() {
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const text = consoleLog.length ? "mounted" : "initial";

  const recordMount = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    console.log("[PLAIN] mounted");
    const entry = `mounted at ${Date.now()}`;
    setConsoleLog((prev) => [...prev, entry]);
  }, []);

  return (
    <div ref={recordMount} style={{ padding: 40, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🔍 Plain React Test</h1>
      <p>State text: <strong id="state-text">{text}</strong></p>
      <p>If text above says &quot;mounted&quot; → React client IS running ✅</p>
      <p>If text above says &quot;initial&quot; → React client is NOT running ❌</p>
      <hr style={{ margin: "20px 0" }} />
      <p>Console logs: {consoleLog.length === 0 ? "(none)" : ""}</p>
      <ul>
        {consoleLog.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
      <hr style={{ margin: "20px 0" }} />
      <p style={{ fontSize: 12, color: "#888" }}>
        UserAgent: <ClientOnlyText fallback="SSR" render={() => navigator.userAgent} />
      </p>
      <p style={{ fontSize: 12, color: "#888" }}>
        Timestamp: <ClientOnlyText fallback="SSR" render={() => new Date().toISOString()} />
      </p>
    </div>
  );
}
