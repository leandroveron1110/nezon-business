// base-api.ts
import { circuitBreaker } from "@/mini-back/infrastructure/connectivity/circuit-breaker";
import { connectivityManager } from "@/mini-back/infrastructure/connectivity/connectivity-manager";
import axios, { AxiosResponse } from "axios";

export async function baseApiRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
): Promise<T> {
  
  // Si estamos confirmados offline, cortamos en seco para ahorrar recursos
  if (connectivityManager.isOffline()) {
    throw new Error("OFFLINE_MODE");
  }

  try {
    const response = await circuitBreaker.execute(async () => {
      return await requestFn();
    });
    
    // Si la petición fue exitosa, le damos un "refresh" al estado online
    connectivityManager.reportHeartbeat(true);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Solo reportamos falla si son errores críticos de infraestructura (no 400 o 401)
      const isNetworkError = error.code === "ECONNABORTED" || error.code === "ERR_NETWORK";
      const isServerError = error.response && error.response.status >= 500;

      if (isNetworkError || isServerError) {
        connectivityManager.reportHeartbeat(false);
      }
    }
    throw error;
  }
}