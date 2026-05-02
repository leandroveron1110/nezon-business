// import { useEffect, useRef, useCallback } from "react";
// import { useGlobalBusinessOrdersStore } from "@/lib/stores/orderStoreGlobal";
// import { getDisplayErrorMessage } from "@/lib/uiErrors";
// import { useAlert } from "@/features/common/ui/Alert/Alert";
// import { syncOrdersByBusinessId } from "../api/catalog-api";

// export function useFetchBusinessOrders(
//   businessId: string, 
//   daysBack: number | null, 
//   specificDate: string | null
// ) {
//   const getLastSyncTime = useGlobalBusinessOrdersStore((s) => s.getLastSyncTime);
//   const setOrdersForBusiness = useGlobalBusinessOrdersStore((s) => s.setOrdersForBusiness);
//   const getOrders = useGlobalBusinessOrdersStore((s) => s.getOrders);
//   const { addAlert } = useAlert();

//   const isSyncingRef = useRef(false);

//   const syncOrdersByBusiness = useCallback(async (forceFullLoad: boolean = false) => {
//     if (!businessId || isSyncingRef.current) return;
//     isSyncingRef.current = true;

//     // Si cambiamos el filtro de días o fecha, NO mandamos lastSyncTime para traer todo el lote nuevo
//     const lastSyncTime = forceFullLoad ? undefined : getLastSyncTime(businessId);

//     try {
//       const res = await syncOrdersByBusinessId(
//         businessId, 
//         lastSyncTime, 
//         daysBack, 
//         specificDate
//       );

//       if (!res) return;

//       const { orders, latestTimestamp } = res;
      
//       if (forceFullLoad) {
//         // Reemplazo total de órdenes para el nuevo rango de fechas
//         setOrdersForBusiness(businessId, orders, latestTimestamp);
//       } else {
//         // Lógica de merge incremental (la que ya tenías)
//         const currentOrders = getOrders(businessId) || [];
//         const existingMap = new Map(currentOrders.map((o) => [o.id, o]));
//         orders.forEach((updated) => existingMap.set(updated.id, updated));
//         setOrdersForBusiness(businessId, Array.from(existingMap.values()), latestTimestamp);
//       }
//     } catch (error) {
//       addAlert({ message: getDisplayErrorMessage(error), type: "error" });
//     } finally {
//       isSyncingRef.current = false;
//     }
//   }, [businessId, daysBack, specificDate, getLastSyncTime, setOrdersForBusiness, getOrders, addAlert]);

//   // EFECTO 1: Cuando cambia el filtro (días o calendario), forzamos carga completa
//   useEffect(() => {
//     syncOrdersByBusiness(true);
//   }, [daysBack, specificDate, businessId]);

//   // EFECTO 2: Intervalo para actualizaciones incrementales (opcional)
//   useEffect(() => {
//     const interval = setInterval(() => syncOrdersByBusiness(false), 30000); // cada 30s
//     return () => clearInterval(interval);
//   }, [syncOrdersByBusiness]);
// }
