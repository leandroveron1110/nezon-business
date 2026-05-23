"use client";
import { ApiResult } from "@/lib/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { IOrder } from "../types/order";
import { ApiError } from "@/types/api";
import { fetchOrderById } from "../api/catalog-api";

export const useFetchOrderById = (orderId: string) => {
  return useQuery<ApiResult<IOrder>, ApiError>({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5, // 5 minutos de "frescura" local
  });
};
