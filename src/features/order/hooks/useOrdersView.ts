"use client";

import { db } from "@/mini-back/infrastructure/dexie/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useOrdersView(businessId: string) {
  const orders = useLiveQuery(async () => {
    // Inicio de ayer
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);
    startDate.setHours(0, 0, 0, 0);

    // Fin de hoy
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return await db.orders
      .where("createdAt")
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray();
  }, []);

  return {
    orders: orders ?? [],
    isLoading: orders === undefined,
    isEmpty: orders !== undefined && orders.length === 0,
  };
}