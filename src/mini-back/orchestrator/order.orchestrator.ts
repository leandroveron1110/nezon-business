// src/orchestrator/order.orchestrator.ts

import {
  CreateOrderInput,
  OrderServicePublic,
  UpdateOrderStatusInput,
} from "../core/orders/public";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";
import { syncQueueWorker } from "../infrastructure/network/SyncQueueWorker";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const createOrderOrchestrator = async (input: CreateOrderInput) => {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
  });

  // 1. Ejecución soberana del negocio en Local (Dexie)
  const result = await orderCore.createOrder(input);

  if (result.success && result.data) {
    const order = result.data;

    // 2. Control de Sincronización Inmediata para pedidos HIGH (Síncrono y agresivo)
    if (order.syncStatus === "SYNC_PENDING" && order.syncPriority === "HIGH") {
      let attempts = 0;
      let cloudId: string | null = null;
      let success = false;

      while (attempts < MAX_RETRIES && !success) {
        try {
          attempts++;
          // Enviamos payload completo asegurando idempotencia mediante idTemp
          cloudId = await cloudSyncService.triggerImmediateSync({
            ...order,
          });
          success = true;
        } catch (err) {
          console.warn(
            `Intento ${attempts} falló para orden ${order.shortCode}. Red inestable.`,
          );
          if (attempts < MAX_RETRIES) await delay(RETRY_DELAY_MS);
        }
      }

      // 3. El Orquestador le comunica el resultado de la infraestructura al Core
      if (success && cloudId) {
        await orderCore.confirmCloudSync(order.idTemp, cloudId);
        // Mutamos el retorno para avisarle a la UI que impactó en la nube
        order.id = cloudId;
        order.syncStatus = "SYNCED";
      } else {
        console.error(
          `Sincronización inmediata fallida tras ${MAX_RETRIES} intentos.`,
        );
        await orderCore.notifySyncError(order.idTemp);
        order.syncStatus = "SYNC_ERROR";
      }
    }
  }

  return result;
};

export const updateOrderStatusOrchestrator = async (
  input: UpdateOrderStatusInput,
) => {
  const repository = new DexieOrderRepositoryAdapter();
  const identity = new DexieOrderIdentityAdapter();
  const orderCore = OrderServicePublic({ repository, identity });

  // 1. El Core valida la máquina de estados y guarda localmente (Paso obligatorio)
  const result = await orderCore.updateStatus(input);
  if (!result.success || !result.data) return result;

  const order = result.data;

  // Evaluamos si el cambio de estado exige que impacte ya mismo en la calle
  const esCambioCritico =
    input.thread === "DELIVERY" && input.nextValue === "REQUESTED";

  // =================================================================
  // CASO 1: La orden YA EXISTE en la nube. Sincronizamos solo el hilo que cambió.
  // =================================================================
  if (order.id) {
    try {
      const success = await cloudSyncService.updateOrder(order.id, {
        thread: input.thread,
        nextValue: input.nextValue,
      });

      if (success) {
        await orderCore.confirmCloudSync(order.idTemp, order.id);
        order.syncStatus = "SYNCED";
      }
    } catch (error) {
      console.warn(
        "Fallo de red al actualizar estado, el SyncWorker resolverá en el fondo.",
      );
      await orderCore.notifySyncError(order.idTemp);
      order.syncStatus = "SYNC_ERROR";
    }
  }
  // =================================================================
  // CASO 2: La orden es LOCAL pero sufrió un cambio crítico (ej: mutó a envío a domicilio)
  // =================================================================
  else if (esCambioCritico) {
    console.log(
      "Orquestador: Cambio crítico detectado en orden local. Forzando sincronización completa...",
    );

    // Despertamos al Worker en caliente. No esperamos los 30 segundos.
    // El worker va a ver que no tiene order.id, va a llamar a triggerImmediateSync(order)
    // mandando todo el DTO con el deliveryStatus ya seteado en REQUESTED y el idTemp puesto.
    // NestJS lo inserta limpio en Postgres en un solo viaje.

    // Ejecutamos de forma asíncrona para no bloquear la UI del POS
    syncQueueWorker
      .processQueue()
      .catch((err) =>
        console.error("Fallo el intento de sync inmediato del Worker", err),
      );
  }

  return result;
};
