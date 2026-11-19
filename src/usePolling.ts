"use client";

import { useEffect, useEffectEvent } from "react";

export function startPolling(poll: () => void, intervalMs: number) {
  const initialTick = setTimeout(poll, 0);
  const interval = setInterval(poll, intervalMs);
  return () => {
    clearTimeout(initialTick);
    clearInterval(interval);
  };
}

export function usePolling(poll: () => void, intervalMs: number) {
  const tick = useEffectEvent(poll);

  useEffect(() => startPolling(() => tick(), intervalMs), [intervalMs]);
}
