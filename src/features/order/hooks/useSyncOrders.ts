// src/features/orders/hooks/useSyncOrders.ts
import { syncOrdersInteractor } from "@/features/common/database/interactors/sync-orders.interactor";
import { useEffect, useRef } from "react";

export function useSyncOrders(businessId: string, daysBack?: number, specificDate?: string) {
  const isSyncingRef = useRef(false);
  // Guardamos los filtros anteriores para saber si cambiaron de verdad
  const prevFiltersRef = useRef({ daysBack, specificDate });

  const runSync = async (force: boolean = false) => {
    if (!businessId || isSyncingRef.current) return;
    
    try {
      isSyncingRef.current = true;
      await syncOrdersInteractor(businessId, { force, daysBack, specificDate });
    } finally {
      isSyncingRef.current = false;
    }
  };

  // EFECTO 1: Control de carga al montar y cambio de filtros
  useEffect(() => {
    // Verificamos si los filtros cambiaron realmente
    const filtersChanged = 
      prevFiltersRef.current.daysBack !== daysBack || 
      prevFiltersRef.current.specificDate !== specificDate;

    if (filtersChanged) {
      // Si cambiaron los filtros, SÍ forzamos carga completa (force: true)
      runSync(true);
      prevFiltersRef.current = { daysBack, specificDate };
    } else {
      // Si solo se montó el componente (volver a la página), 
      // hacemos carga incremental (force: false) para usar el metadata
      runSync(false);
    }
  }, [businessId, daysBack, specificDate]);

  // EFECTO 2: Polling (Incremental siempre)
  useEffect(() => {
    const interval = setInterval(() => runSync(false), 30000);
    return () => clearInterval(interval);
  }, [businessId]); 

  return { refresh: () => runSync(true) };
}