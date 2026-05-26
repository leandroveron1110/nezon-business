// src/infrastructure/network/SyncQueueWorker.ts
import { DexieOrderRepositoryAdapter } from "../dexie/repositories/dexie-order.repository";
import { OrderServicePublic } from "../../core/orders/public";
import { DexieOrderIdentityAdapter } from "../dexie/repositories/dexie-order-identity.adapter";
import { cloudSyncService } from "./CloudSyncService";
import { db } from "../dexie/db";
import { checkServerHealth } from "../connectivity/health-monitor";
import { connectivityManager } from "../connectivity/connectivity-manager";

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

  async processQueue(options: { forceAll: boolean } = { forceAll: false }) {
    if (this.isProcessing) return;

    if (connectivityManager.isOffline()) {
      console.log("[Sync] Offline mode queueing is paused. Will retry when back online.");

      return;
    }

    try {
      // 🛑 PRE-CHEQUEO VELOZ: Validamos índices directo en Dexie
      const pendingOrdersCount = await this.repository.getPendingCount();
      const pendingEventsCount = await db.orderStateEvents
        .where("syncStatus")
        .equals("PENDING")
        .count();

      // Si no hay nada colgado en ninguna tabla, salimos sin consumir recursos
      if (pendingOrdersCount === 0 && pendingEventsCount === 0) return;

      // Si hay trabajo, verificamos la salud de la API
      const isServerAlive = await checkServerHealth();
      if (!isServerAlive) return;

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
                // Al crearse de cero limpia, seteamos los hilos en true localmente
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
            throw err; // Detiene la cola para preservar el orden FIFO
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

            // 🔍 Hilo 1: Estado General
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

            // 🔍 Hilo 2: Estado de Pago
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

            // 🔍 Hilo 3: Logística / Despacho
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

            // Si estaba marcada como pendiente pero los hilos ya estaban subidos, limpiamos estado global
            if (promises.length === 0) {
              await db.orders.update(order.idTemp, { syncStatus: "SYNCED" });
              continue;
            }

            // Se ejecutan únicamente los endpoints cuyos hilos cambiaron localmente
            const results = await Promise.all(promises);

            if (results.every((res) => res === true)) {
              // Traemos la orden fresca para ver si con estos cambios completamos todos los hilos
              const freshOrder = await db.orders.get(order.idTemp);

              const allThreadsSynced =
                (localUpdates.syncedStatus || freshOrder?.syncedStatus) &&
                (localUpdates.syncedPayment || freshOrder?.syncedPayment) &&
                (order.deliveryStatus === "NOT_APPLICABLE" ||
                  localUpdates.syncedDelivery ||
                  freshOrder?.syncedDelivery);

              if (allThreadsSynced) {
                localUpdates.syncStatus = "SYNCED"; // Pasa a limpia de forma inmutable
              }

              // Guardamos el progreso parcial o total en Dexie
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
            break;
          }
        }
      }

      // =================================================================
      // 3. SINCRONIZACIÓN DE HISTORIAL DE EVENTOS (CON LÍMITE DE RAM)
      // =================================================================
      await this.syncPendingHistoryEvents();
    } catch (error) {
      console.error(
        "SyncWorker: Error deteniendo cola por fallo de bloque.",
        error,
      );
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

  async forceManualSyncAll() {
    console.log("SyncWorker: Sincronización manual forzada iniciada por el usuario.");
    return await this.processQueue({ forceAll: true });
  }
}

let syncQueueWorker: SyncQueueWorker | null = null;

export function getSyncQueueWorker() {
  if (!syncQueueWorker) {
    syncQueueWorker = new SyncQueueWorker();
  }

  return syncQueueWorker;
}