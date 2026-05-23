import { connectivityManager } from "./connectivity-manager";

export async function checkServerHealth() {
  if (typeof window === "undefined") return false;

  if (!navigator.onLine) {
    connectivityManager.reportHeartbeat(true); // El navegador detecta que estamos offline, reportamos la falla
    return false;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 3000);

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
      connectivityManager.reportHeartbeat(false); // Reportamos que el servidor está vivo
      return true;
    }

    connectivityManager.reportHeartbeat(false);
    return false;
  } catch {
    clearTimeout(timeout);

    connectivityManager.reportHeartbeat(false);
    return false;
  }
}

export function startHealthMonitor() {
  if (typeof window === "undefined") return false;

  checkServerHealth();

  setInterval(() => {
    checkServerHealth();
  }, 5000);
}
