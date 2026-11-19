"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

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
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return <>{isClient ? render() : fallback}</>;
}
