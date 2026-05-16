// src/infrastructure/network/SyncQueueWorker.ts
import { DexieOrderRepositoryAdapter } from "../dexie/repositories/dexie-order.repository";
import { OrderServicePublic, Order } from "../../core/orders/public";
import { DexieOrderIdentityAdapter } from "../dexie/repositories/dexie-order-identity.adapter";
import { cloudSyncService } from "./CloudSyncService";

class SyncQueueWorker {
  private isProcessing = false;
  private repository = new DexieOrderRepositoryAdapter();
  private identity = new DexieOrderIdentityAdapter();

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.processQueue({ forceAll: false }));
      setInterval(() => this.processQueue({ forceAll: false }), 30000);
    }
  }

  // Helper para segmentar el array en pedazos manejables
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async processQueue(options: { forceAll: boolean } = { forceAll: false }) {
    console.log(`isprocessing: ${this.isProcessing}, navigator.onLine: ${typeof navigator !== "undefined" ? navigator.onLine : "N/A"}`);
    if (this.isProcessing) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    this.isProcessing = true;
    const orderCore = OrderServicePublic({ repository: this.repository, identity: this.identity });

    try {
      const pendingOrders = await this.repository.getPendingQueue({ forceAll: options.forceAll });
      console.log(`SyncWorker: ${pendingOrders.length} órdenes pendientes encontradas para sincronizar. forceAll: ${options.forceAll}`);
      if (pendingOrders.length === 0) return;

      // Separamos la cola en dos categorías para tratarlas eficientemente
      const ordersToCreate = pendingOrders.filter(o => !o.id);
      const ordersToUpdateStatus = pendingOrders.filter(o => !!o.id);

      // =================================================================
      // 1. PROCESAMIENTO POR LOTES (CHUNKS) PARA ÓRDENES NUEVAS
      // =================================================================
      if (ordersToCreate.length > 0) {
        const CHUNK_SIZE = 50;
        const chunks = this.chunkArray(ordersToCreate, CHUNK_SIZE);
        
        console.log(`SyncWorker: Procesando ${ordersToCreate.length} creaciones distribuidas en ${chunks.length} chunks.`);

        for (const chunk of chunks) {
          try {
            // Tomamos el businessId de la primera orden del lote (asumiendo POS mononegocio por sesión)
            const businessId = chunk[0].businessId;

            // Enviamos el bloque de 50 a la nube en un solo viaje HTTP
            const syncResults = await cloudSyncService.triggerBatchSync(businessId, chunk);

            // Consolidamos en lote la respuesta en nuestra DB soberana (Dexie)
            for (const result of syncResults) {
              if(result.cloudId) {
                await orderCore.confirmCloudSync(result.idTemp, result.cloudId);
              }
            }
            console.log(`SyncWorker: Bloque de ${chunk.length} órdenes procesado y consolidado con éxito.`);
          } catch (err) {
            console.error("SyncWorker: Falló un chunk de creación masiva. Frenamos para preservar consistencia FIFO.", err);
            throw err; // Rompemos el flujo general para no saltarnos el orden estricto
          }
        }
      }

      // =================================================================
      // 2. PROCESAMIENTO INDIVIDUAL PARA MUTACIONES DE ESTADO
      // =================================================================
      if (ordersToUpdateStatus.length > 0) {
        console.log(`SyncWorker: Procesando ${ordersToUpdateStatus.length} actualizaciones de estado pendientes.`);
        
        for (const order of ordersToUpdateStatus) {
          try {
            // Ejecución secuencial de hilos (STATUS, PAYMENT, DELIVERY)
            const syncStatus = await cloudSyncService.updateOrder(order.id!, { thread: "STATUS", nextValue: order.status });
            const syncPayment = await cloudSyncService.updateOrder(order.id!, { thread: "PAYMENT", nextValue: order.paymentStatus });
            
            let syncDelivery = true;
            if (order.deliveryStatus !== "NOT_APPLICABLE") {
              syncDelivery = await cloudSyncService.updateOrder(order.id!, { thread: "DELIVERY", nextValue: order.deliveryStatus });
            }

            if (syncStatus && syncPayment && syncDelivery) {
              await orderCore.confirmCloudSync(order.idTemp, order.id!);
            } else {
              throw new Error("Fallo en la ráfaga de estados remotos");
            }
          } catch (err) {
            console.error(`SyncWorker: Error actualizando estados de orden ${order.shortCode}. Deteniendo cola.`, err);
            break;
          }
        }
      }

    } catch (error) {
      console.error("SyncWorker: Deteniendo ejecución de la cola por error en lote.", error);
    } finally {
      this.isProcessing = false;
    }
  }

  async forceManualSyncAll() {
    console.log("SyncQueueWorker: Iniciando sincronización manual de todas las órdenes pendientes.");
    return await this.processQueue({ forceAll: true });
  }
}

export const syncQueueWorker = new SyncQueueWorker();