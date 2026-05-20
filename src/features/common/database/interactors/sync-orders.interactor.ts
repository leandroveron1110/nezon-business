// src/features/orders/interactors/sync-orders.interactor.ts
import {
  checkRealServerHealth,
  syncOrdersByBusinessId,
} from "@/features/order/api/catalog-api";
import { syncOrdersInboundCommand } from "../commands/sync-orders-inbound.command";
import { db } from "@/mini-back/infrastructure/dexie/db";

export async function syncOrdersInteractor(
  businessId: string,
  options: { force?: boolean; daysBack?: number; specificDate?: string } = {},
): Promise<void> {
  const { force = false, daysBack, specificDate } = options;

  // 1. Buscamos el post-it en metadata
  const meta = await db.metadata.get("last_sync_orders");

  // 2. Definimos si usamos el timestamp o no
  // SOLO lo seteamos como undefined si:
  // - El usuario apretó "Refrescar" (force === true)
  // - O si se aplicaron filtros de fecha (daysBack/specificDate !== undefined)
  const isFiltering = daysBack !== undefined || specificDate !== undefined;
  const lastSyncTime = force || isFiltering ? undefined : meta?.value;

  console.log(
    `[Sync] Enviando lastSyncTime: ${lastSyncTime ?? "Carga Completa"}`,
  );

  try {
    const isServerAlive = await checkRealServerHealth();
    if (!isServerAlive) return;
    const res = await syncOrdersByBusinessId(
      businessId,
      lastSyncTime,
      daysBack,
      specificDate,
    );
    if (res?.orders) {
      await syncOrdersInboundCommand(res.orders, res.latestTimestamp);
    }
  } catch (error) {
    console.error("[SyncInteractor] Error:", error);
    throw error;
  }
}
