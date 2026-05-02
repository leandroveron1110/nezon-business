// src/features/orders/interactors/sync-orders.interactor.ts
import { syncOrdersByBusinessId } from "@/features/order/api/catalog-api";
import { syncOrdersInboundCommand } from "../commands/sync-orders-inbound.command";
import { db } from "..";

export async function syncOrdersInteractor_(businessId: string, force: boolean = false): Promise<void> {
  // 1. Intentamos obtener el registro de metadata
  const meta = await db.metadata.get('last_sync_orders');
  
  // 2. Extraemos el valor de forma segura. 
  // Si es la primera vez, será undefined, y la API lo tratará como carga inicial.
  const lastSyncTime = meta?.value;

  // 3. Verificamos si realmente necesitamos llamar al servidor
  const count = await db.orders.count();

  console.log(count)
  
  // Si ya hay órdenes y no estamos forzando, evitamos la llamada innecesaria
  if (count > 0 && !force && lastSyncTime) {
    return;
  }

  try {
    // 4. Llamada a la API
    // Es vital que syncOrdersByBusinessId acepte string | undefined
    const res = await syncOrdersByBusinessId(businessId, lastSyncTime);

    if (res && res.orders) {
      // 5. Ejecutamos el Command para impactar la DB
      // El Command internamente hará el bulkPut y actualizará el metadata
      await syncOrdersInboundCommand(res.orders, res.latestTimestamp);
    }
  } catch (error) {
    // Aquí podrías implementar una política de reintentos o logs específicos
    console.error("[SyncInteractor] Falló la sincronización:", error);
    throw error; 
  }
}

export async function syncOrdersInteractor(
  businessId: string, 
  options: { force?: boolean; daysBack?: number; specificDate?: string } = {}
): Promise<void> {
  const { force = false, daysBack, specificDate } = options;

  // 1. Buscamos el post-it en metadata
  const meta = await db.metadata.get('last_sync_orders');
  
  // 2. Definimos si usamos el timestamp o no
  // SOLO lo seteamos como undefined si:
  // - El usuario apretó "Refrescar" (force === true)
  // - O si se aplicaron filtros de fecha (daysBack/specificDate !== undefined)
  const isFiltering = daysBack !== undefined || specificDate !== undefined;
  const lastSyncTime = (force || isFiltering) ? undefined : meta?.value;

  console.log(`[Sync] Enviando lastSyncTime: ${lastSyncTime ?? 'Carga Completa'}`);

  try {
    const res = await syncOrdersByBusinessId(businessId, lastSyncTime, daysBack, specificDate);
    if (res?.orders) {
      await syncOrdersInboundCommand(res.orders, res.latestTimestamp);
    }
  } catch (error) {
    console.error("[SyncInteractor] Error:", error);
    throw error;
  }
}
