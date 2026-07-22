// health-monitor.ts
import { connectivityManager } from "./connectivity-manager";

export async function checkServerHealth() {
  if (typeof window === "undefined") return false;

  // Si el navegador DICE con certeza que no hay red, no gastamos batería
  if (!navigator.onLine) {
    connectivityManager.forceState("OFFLINE");
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/health/ping?t=${Date.now()}`;
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      connectivityManager.reportHeartbeat(true);
      return true;
    } else {
      connectivityManager.reportHeartbeat(false);
      return false;
    }
  } catch {
    clearTimeout(timeout);
    connectivityManager.reportHeartbeat(false);
    return false;
  }
}

export function startHealthMonitor() {
  if (typeof window === "undefined") return;

  const triggerImmediateCheck = () => {
    // Si la pantalla se enciende o la PWA pasa a primer plano en el celu
    if (document.visibilityState === "visible") {
      // Si estábamos OFFLINE, ponemos CHECKING para feedback visual rápido y probamos salud
      if (connectivityManager.isOffline()) {
        connectivityManager.forceState("CHECKING");
      }
      checkServerHealth();
    }
  };

  // 1. Escuchar eventos nativos de red
  window.addEventListener("online", () => {
    connectivityManager.forceState("CHECKING");
    checkServerHealth();
  });

  window.addEventListener("offline", () => {
    connectivityManager.forceState("OFFLINE");
  });

  // 2. CLAVE PARA MÓVILES Y PWA: Escuchar cuando el usuario enciende la pantalla o vuelve a la App
  document.addEventListener("visibilitychange", triggerImmediateCheck);
  window.addEventListener("focus", triggerImmediateCheck);

  // 3. Ejecución inicial y loop
  checkServerHealth();
  setInterval(checkServerHealth, 5000);
}