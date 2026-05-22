"use client";
import { useEffect, useState } from "react";

/**
 * Renders dynamic text only after client mount.
 * Use for timeAgo, relative times, current time — anything that
 * produces different output between SSR and client hydration.
 */
export function ClientOnlyText({
  render,
  fallback = "--",
}: {
  render: () => string;
  fallback?: string;
}) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(render());
  }, [render]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{value ?? fallback}</>;
}
