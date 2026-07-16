"use client";

import { db } from "@/mini-back/infrastructure/dexie/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useOrdersView(businessId: string) {
  const orders = useLiveQuery(async () => {
    if (!businessId) return [];

    const now = new Date();
    // Solo mostramos órdenes de las últimas 26 horas
    const timeLimit = new Date(now.getTime() - 26 * 60 * 60 * 1000);

    // Filtramos por rango de tiempo Y por el ID del negocio para asegurar consistencia multi-tenant
    return await db.orders
      .where("createdAt")
      .aboveOrEqual(timeLimit)
      .filter(order => order.businessId === businessId) // 👈 Filtro de seguridad por negocio
      .reverse()
      .toArray();
  }, [businessId]);

  return {
    orders: orders ?? [],
    isLoading: orders === undefined,
    isEmpty: orders !== undefined && orders.length === 0,
  };
}