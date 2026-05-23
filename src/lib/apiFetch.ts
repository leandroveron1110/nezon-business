// src/api/client.ts
import { AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/types/api";
import api from "@/lib/api";
import { baseApiRequest } from "./base-api-request";

export type ApiResult<T> = T | null;


// 🔹 Método GET genérico
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return baseApiRequest(() =>
    api.get<ApiResponse<T>>(url, config),
  );
}


export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return baseApiRequest(() =>
    api.post<ApiResponse<T>>(url, body, config),
  );
}

// 🔹 Método PUT genérico
export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return baseApiRequest(() =>
    api.put<ApiResponse<T>>(url, body, config),
  );
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return baseApiRequest(() =>
    api.patch<ApiResponse<T>>(url, body),
  );
}

// 🔹 Método DELETE genérico
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return baseApiRequest(() =>
    api.delete<ApiResponse<T>>(url, config),
  );
}
