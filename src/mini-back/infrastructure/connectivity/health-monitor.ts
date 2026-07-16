// health-monitor.ts
import { connectivityManager } from "./connectivity-manager";

export async function checkServerHealth() {
  if (typeof window === "undefined") return false;

  // Si el navegador DICE con certeza que no hay red, no gastamos batería haciendo pings
  if (!navigator.onLine) {
    connectivityManager.forceState("OFFLINE"); // Forzado inmediato sin período de gracia
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
      connectivityManager.reportHeartbeat(true); // Servidor vivo e internet funcionando
      return true;
    } else {
      // El servidor respondió pero con error (ej: 502, 500, 503)
      connectivityManager.reportHeartbeat(false);
      return false;
    }
  } catch {
    clearTimeout(timeout);
    // Error de red o timeout total
    connectivityManager.reportHeartbeat(false);
    return false;
  }
}

export function startHealthMonitor() {
  if (typeof window === "undefined") return;

  // Escuchar eventos nativos del navegador para reaccionar al instante
  window.addEventListener("online", () => {
    // Si vuelve el cable/wifi, pasamos a CHECKING y forzamos un ping inmediato
    connectivityManager.forceState("CHECKING");
    checkServerHealth();
  });

  window.addEventListener("offline", () => {
    connectivityManager.forceState("OFFLINE");
  });

  // Ejecución inicial y loop
  checkServerHealth();
  setInterval(checkServerHealth, 5000);
}
