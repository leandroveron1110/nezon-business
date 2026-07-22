// health-monitor.ts
import { connectivityManager } from "./connectivity-manager";

export async function checkServerHealth() {
  if (typeof window === "undefined") return false;

  // Si el celular explícitamente dice sin red
  if (!navigator.onLine) {
    connectivityManager.forceState("OFFLINE");
    return false;
  }

  const controller = new AbortController();
  // Ampliamos a 5s porque la CPU del celu puede demorar la respuesta de red
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${baseUrl}/health/ping?t=${Date.now()}`;

    const response = await fetch(url, {
      method: "GET",
      // 'cors' es estricto en celulares. 'no-store' evita cache.
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      }
    });

    clearTimeout(timeout);

    // En celulares, si responde 200 OK (o status < 400), hay server y red
    if (response.status < 400) {
      connectivityManager.reportHeartbeat(true);
      return true;
    } else {
      console.warn("[HealthMonitor] El servidor respondió con error:", response.status);
      connectivityManager.reportHeartbeat(false);
      return false;
    }
  } catch (error: any) {
    clearTimeout(timeout);
    
    // LOG DE DIAGNÓSTICO PARA MOVILES (podés mirarlo con VConsole o Inspeccionar)
    console.error("[HealthMonitor] Error de ping en celular:", error?.message || error);
    
    connectivityManager.reportHeartbeat(false);
    return false;
  }
}

export function startHealthMonitor() {
  if (typeof window === "undefined") return;

  const handleWakeUp = () => {
    if (document.visibilityState === "visible") {
      checkServerHealth();
    }
  };

  window.addEventListener("online", () => {
    connectivityManager.forceState("CHECKING");
    checkServerHealth();
  });

  window.addEventListener("offline", () => {
    connectivityManager.forceState("OFFLINE");
  });

  document.addEventListener("visibilitychange", handleWakeUp);
  window.addEventListener("focus", handleWakeUp);

  // Ejecución inicial y loop
  checkServerHealth();
  setInterval(checkServerHealth, 6000);
}