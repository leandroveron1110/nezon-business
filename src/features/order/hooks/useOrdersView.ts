// src/features/orders/hooks/useOrdersView.ts
import { db } from "@/mini-back/infrastructure/dexie/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useOrdersView(businessId: string) {
  // Dexie detectará automáticamente cuando el Hook de Sync 
  // haga el bulkPut y actualizará la UI al instante.
  const orders = useLiveQuery(
    () => db.orders.orderBy('createdAt').reverse().toArray(),
    [businessId]
  );

  return {
    orders: orders ?? [],
    isLoading: orders === undefined,
    isEmpty: orders !== undefined && orders.length === 0
  };
}