// src/infrastructure/network/SyncQueueWorker.ts
import { DexieOrderRepositoryAdapter } from "../dexie/repositories/dexie-order.repository";
import { OrderServicePublic } from "../../core/orders/public";
import { DexieOrderIdentityAdapter } from "../dexie/repositories/dexie-order-identity.adapter";
import { cloudSyncService } from "./CloudSyncService";
import { db } from "../dexie/db";
import { checkServerHealth } from "../connectivity/health-monitor";
import { connectivityManager } from "../connectivity/connectivity-manager";

export type SyncResult = {
  success: boolean;
  status:
    | "NO_CHANGES"
    | "SYNCED_FULLY"
    | "PARTIAL_ERROR"
    | "OFFLINE"
    | "SERVER_DOWN";
  pendingCount?: number;
};

class SyncQueueWorker {
  private isProcessing = false;
  private repository = new DexieOrderRepositoryAdapter();
  private identity = new DexieOrderIdentityAdapter();

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () =>
        this.processQueue({ forceAll: false }),
      );
      setInterval(() => this.processQueue({ forceAll: false }), 30000);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // ... Dentro de la clase SyncQueueWorker ...

  async forceManualSyncAll(): Promise<SyncResult> {
    console.log(
      "SyncWorker: Sincronización manual forzada iniciada por el usuario.",
    );
    return await this.processQueue({ forceAll: true });
  }

  async processQueue(
    options: { forceAll: boolean } = { forceAll: false },
  ): Promise<SyncResult> {
    if (this.isProcessing) {
      return { success: false, status: "PARTIAL_ERROR" }; // Evita colisiones si ya está corriendo
    }

    if (connectivityManager.isOffline()) {
      console.log(
        "[Sync] Offline mode queueing is paused. Will retry when back online.",
      );
      return { success: false, status: "OFFLINE" };
    }

    try {
      // 🛑 PRE-CHEQUEO VELOZ
      const pendingOrdersCount = await this.repository.getPendingCount();
      const pendingEventsCount = await db.orderStateEvents
        .where("syncStatus")
        .equals("PENDING")
        .count();

      if (pendingOrdersCount === 0 && pendingEventsCount === 0) {
        return { success: true, status: "NO_CHANGES" };
      }

      // Si hay trabajo, verificamos la salud de la API
      const isServerAlive = await checkServerHealth();
      if (!isServerAlive) {
        return { success: false, status: "SERVER_DOWN" };
      }

      this.isProcessing = true;

      const orderCore = OrderServicePublic({
        repository: this.repository,
        identity: this.identity,
      });

      const pendingOrders = await this.repository.getPendingQueue({
        forceAll: options.forceAll,
      });
      const ordersToCreate = pendingOrders.filter((o) => !o.id);
      const ordersToUpdateStatus = pendingOrders.filter((o) => !!o.id);

      // =================================================================
      // 1. PROCESAMIENTO EN LOTES PARA ÓRDENES COMPLETAMENTE NUEVAS
      // =================================================================
      if (ordersToCreate.length > 0) {
        const CHUNK_SIZE = 50;
        const chunks = this.chunkArray(ordersToCreate, CHUNK_SIZE);

        for (const chunk of chunks) {
          try {
            const businessId = chunk[0].businessId;
            const syncResults = await cloudSyncService.triggerBatchSync(
              businessId,
              chunk,
            );

            for (const result of syncResults) {
              if (result.cloudId) {
                await orderCore.confirmCloudSync(result.idTemp, result.cloudId);
                await db.orders.update(result.idTemp, {
                  syncedStatus: true,
                  syncedPayment: true,
                  syncedDelivery: true,
                });
              }
            }
          } catch (err) {
            console.error(
              "SyncWorker: Falló un chunk de creación masiva.",
              err,
            );
            throw err; // Lanza al catch principal para frenar
          }
        }
      }

      // =================================================================
      // 2. MUTACIONES DE ESTADO QUIRÚRGICAS (SOLO LO QUE FALTA SUBIR)
      // =================================================================
      if (ordersToUpdateStatus.length > 0) {
        for (const order of ordersToUpdateStatus) {
          try {
            const promises = [];
            const localUpdates: Record<string, any> = {};

            if (order.syncedStatus === false) {
              promises.push(
                cloudSyncService
                  .updateOrder(order.id!, {
                    thread: "STATUS",
                    nextValue: order.status,
                  })
                  .then((res) => {
                    if (res) localUpdates.syncedStatus = true;
                    return res;
                  }),
              );
            }

            if (order.syncedPayment === false) {
              promises.push(
                cloudSyncService
                  .updateOrder(order.id!, {
                    thread: "PAYMENT",
                    nextValue: order.paymentStatus,
                  })
                  .then((res) => {
                    if (res) localUpdates.syncedPayment = true;
                    return res;
                  }),
              );
            }

            if (
              order.deliveryStatus !== "NOT_APPLICABLE" &&
              order.syncedDelivery === false
            ) {
              promises.push(
                cloudSyncService
                  .updateOrder(order.id!, {
                    thread: "DELIVERY",
                    nextValue: order.deliveryStatus,
                  })
                  .then((res) => {
                    if (res) localUpdates.syncedDelivery = true;
                    return res;
                  }),
              );
            }

            if (promises.length === 0) {
              await db.orders.update(order.idTemp, { syncStatus: "SYNCED" });
              continue;
            }

            const results = await Promise.all(promises);

            if (results.every((res) => res === true)) {
              const freshOrder = await db.orders.get(order.idTemp);
              const allThreadsSynced =
                (localUpdates.syncedStatus || freshOrder?.syncedStatus) &&
                (localUpdates.syncedPayment || freshOrder?.syncedPayment) &&
                (order.deliveryStatus === "NOT_APPLICABLE" ||
                  localUpdates.syncedDelivery ||
                  freshOrder?.syncedDelivery);

              if (allThreadsSynced) {
                localUpdates.syncStatus = "SYNCED";
              }
              await db.orders.update(order.idTemp, localUpdates);
            } else {
              throw new Error("Fallo parcial en la ráfaga de estados remotos");
            }
          } catch (err) {
            console.error(
              `SyncWorker: Error en estados de orden ${order.shortCode}. Deteniendo ciclo.`,
              err,
            );
            await db.orders.update(order.idTemp, { syncStatus: "SYNC_ERROR" });
            throw err; // 🌟 Cambiado de break a throw para romper el flujo global e informar error
          }
        }
      }

      // =================================================================
      // 3. SINCRONIZACIÓN DE HISTORIAL DE EVENTOS
      // =================================================================
      await this.syncPendingHistoryEvents();

      // Verificación final post-proceso
      const remainingOrders = await this.repository.getPendingCount();
      const remainingEvents = await db.orderStateEvents
        .where("syncStatus")
        .equals("PENDING")
        .count();
      const totalRemaining = remainingOrders + remainingEvents;

      if (totalRemaining === 0) {
        return { success: true, status: "SYNCED_FULLY" };
      } else {
        return {
          success: false,
          status: "PARTIAL_ERROR",
          pendingCount: totalRemaining,
        };
      }
    } catch (error) {
      console.error(
        "SyncWorker: Error deteniendo cola por fallo de bloque.",
        error,
      );
      return { success: false, status: "PARTIAL_ERROR" };
    } finally {
      this.isProcessing = false;
    }
  }

  private async syncPendingHistoryEvents() {
    try {
      // Traemos únicamente los eventos colgados usando el índice rápido con límite de seguridad
      const localEvents = await db.orderStateEvents
        .where("syncStatus")
        .equals("PENDING")
        .limit(100)
        .toArray();

      if (localEvents.length === 0) return;

      const validEventsToSend = [];

      for (const event of localEvents) {
        if (event.orderId) {
          validEventsToSend.push(event);
        } else {
          // Si es un evento creado offline, cruzamos rápido contra la orden local a ver si ya tiene ID remoto
          const localOrder = await db.orders.get(event.idTemp);
          if (localOrder && localOrder.id) {
            event.orderId = localOrder.id;
            validEventsToSend.push(event);
          }
        }
      }

      if (validEventsToSend.length === 0) return;

      const success =
        await cloudSyncService.syncOrderStateEvents(validEventsToSend);

      if (success) {
        // En lugar de hacer toArray() o bulkDelete destructivos, mutamos el syncStatus del evento a 'SYNCED'
        const eventIds = validEventsToSend.map((e) => e.id);
        await db.orderStateEvents
          .where("id")
          .anyOf(eventIds)
          .modify({ syncStatus: "SYNCED" });

        console.log(
          `SyncWorker: ${validEventsToSend.length} eventos de historial subidos con éxito.`,
        );
      }
    } catch (error) {
      console.error(
        "SyncWorker: No se pudo completar la sincronización del historial.",
        error,
      );
    }
  }
}

let syncQueueWorker: SyncQueueWorker | null = null;

export function getSyncQueueWorker() {
  if (!syncQueueWorker) {
    syncQueueWorker = new SyncQueueWorker();
  }

  return syncQueueWorker;
}
