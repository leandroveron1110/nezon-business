import { connectivityManager } from "./connectivity-manager";

export async function checkServerHealth() {
  if (typeof window === "undefined") return false;

  if (!navigator.onLine) {
    connectivityManager.setState("OFFLINE");
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
      connectivityManager.setState("ONLINE");
      return true;
    }

    connectivityManager.setState("OFFLINE");
    return false;
  } catch {
    clearTimeout(timeout);

    connectivityManager.setState("OFFLINE");
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
