// src/features/orders/interactors/sync-orders.interactor.ts
import { syncOrdersByBusinessId } from "@/features/order/api/catalog-api";
import { syncOrdersInboundCommand } from "../commands/sync-orders-inbound.command";
import { db } from "@/mini-back/infrastructure/dexie/db";
import { checkServerHealth } from "@/mini-back/infrastructure/connectivity/health-monitor";
import { connectivityManager } from "@/mini-back/infrastructure/connectivity/connectivity-manager";

export async function syncOrdersInteractor(
  businessId: string,
  options: { force?: boolean; daysBack?: number; specificDate?: string } = {},
): Promise<void> {
  if (connectivityManager.isOffline()) {
    console.log("[Sync] Offline mode");

    return;
  }

  const { force = false, daysBack, specificDate } = options;

  // 1. Buscamos el post-it en metadata
  const meta = await db.metadata.get("last_sync_orders");

  const isFiltering = daysBack !== undefined || specificDate !== undefined;
  const lastSyncTime = force || isFiltering ? undefined : meta?.value;


  try {
    const isServerAlive = await checkServerHealth();
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
