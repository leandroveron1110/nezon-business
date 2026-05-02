// src/features/orders/hooks/useOrdersView.ts
import { db } from "@/features/common/database";
import { syncOrdersInteractor } from "@/features/common/database/interactors/sync-orders.interactor";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

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