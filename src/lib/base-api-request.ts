import { circuitBreaker } from "@/mini-back/infrastructure/connectivity/circuit-breaker";
import { connectivityManager } from "@/mini-back/infrastructure/connectivity/connectivity-manager";
import axios, { AxiosResponse } from "axios";

export async function baseApiRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
): Promise<T> {
  // 🌟 Si el manager detectó el offline por el ping real, 
  // rebotamos la petición en un milisegundo sin generar tráfico en la red.
  if (connectivityManager.isOffline()) {
    throw new Error("OFFLINE_MODE");
  }

  try {
    const response = await circuitBreaker.execute(async () => {
      return await requestFn();
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || error.response?.status === 502) {
        connectivityManager.setState("OFFLINE");
      }
    }
    throw error;
  }
}
