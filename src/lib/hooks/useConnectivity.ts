// useConnectivity.ts
import { connectivityManager } from "@/mini-back/infrastructure/connectivity/connectivity-manager";
import { useSyncExternalStore } from "react";

export function useConnectivity() {
  const state = useSyncExternalStore(
    (callback) => connectivityManager.subscribe(callback),
    () => connectivityManager.getState(),
    // Fallback de Server-Side Rendering (Next.js / SSR) para evitar hydration mismatch
    () => "ONLINE"
  );

  return {
    state,
    isOnline: state === "ONLINE",
    isOffline: state === "OFFLINE",
    isChecking: state === "CHECKING",
  };
}