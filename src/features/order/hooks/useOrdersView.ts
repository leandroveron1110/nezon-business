"use client";

import { db } from "@/mini-back/infrastructure/dexie/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useOrdersView(businessId: string) {
  const orders = useLiveQuery(async () => {
    // Inicio del día local
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Fin del día local
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await db.orders
      .where("createdAt")
      .between(startOfDay, endOfDay, true, true)
      .reverse()
      .toArray();
  }, []);

  return {
    orders: orders ?? [],
    isLoading: orders === undefined,
    isEmpty: orders !== undefined && orders.length === 0,
  };
}
