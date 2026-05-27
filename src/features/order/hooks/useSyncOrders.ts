"use client";
// src/features/orders/hooks/useSyncOrders.ts
import { syncOrdersInteractor } from "@/features/common/database/interactors/sync-orders.interactor";
import { useEffect, useRef } from "react";

export function useSyncOrders(businessId: string, daysBack?: number, specificDate?: string) {
  const isSyncingRef = useRef(false);
  // Guardamos los filtros anteriores para saber si cambiaron de verdad
  const runSync = async (force: boolean = false) => {
    if (!businessId || isSyncingRef.current) return;
    
    try {
      isSyncingRef.current = true;
      await syncOrdersInteractor(businessId, { force, daysBack, specificDate });
    } finally {
      isSyncingRef.current = false;
    }
  };

  // EFECTO 2: Polling (Incremental siempre)
  useEffect(() => {
    const interval = setInterval(() => runSync(false), 30000);
    return () => clearInterval(interval);
  }, [businessId]); 

  return { refresh: () => runSync(true) };
}