// src/orchestrator/order.orchestrator.ts

import {
  CreateOrderInput,
  OrderServicePublic,
  UpdateOrderStatusInput,
} from "../core/orders/public";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";
// import { syncQueueWorker } from "../infrastructure/network/SyncQueueWorker";

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
  let result = await orderCore.createOrder(input);

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
        // El core impacta el ID remoto, corre el mutateState interno y guarda en Dexie
        await orderCore.confirmCloudSync(order.idTemp, cloudId);
      } else {
        console.error(
          `Sincronización inmediata fallida tras ${MAX_RETRIES} intentos.`,
        );
        // El core pasa la orden a SYNC_ERROR e impacta el historial en Dexie
        await orderCore.notifySyncError(order.idTemp);
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
  // ESTO ES LOCAL Y RÁPIDO.
  const result = await orderCore.updateStatus(input);
  if (!result.success || !result.data) return result;

  const order = result.data;

  const esCambioCritico =
    input.thread === "DELIVERY" && input.nextValue === "REQUESTED";

  // =================================================================
  // CASO 1: La orden YA EXISTE en la nube. Sincronizamos en SEGUNDO PLANO.
  // =================================================================
  if (order.id) {
    // 🔥 QUITAMOS EL AWAIT. Dejamos que la promesa se resuelva en el fondo.
    cloudSyncService
      .updateOrder(order.id, {
        thread: input.thread,
        nextValue: input.nextValue,
      })
      .then(async (success) => {
        if (success && order.id) {
          await orderCore.confirmCloudSync(order.idTemp, order.id);
          // Nota: Si necesitás que la UI se entere del cambio de 'SYNCED',
          // deberías manejarlo con un estado global/reactivo (ej: un hook que escuche Dexie),
          // pero la UI ya continuó su flujo hace rato.
        } else {
          await orderCore.notifySyncError(order.idTemp);
        }
      })
      .catch(async (error) => {
        console.warn(
          "Fallo de red al actualizar estado, el SyncWorker resolverá en el fondo.",
        );
        await orderCore.notifySyncError(order.idTemp);
      });
  }
  // =================================================================
  // CASO 2: La orden es LOCAL pero sufrió un cambio crítico
  // =================================================================
  else if (esCambioCritico) {
    console.log(
      "Orquestador: Cambio crítico detectado en orden local. Forzando sincronización completa...",
    );

    // Esto ya lo tenías bien (sin await), ideal para el fondo.
    // syncQueueWorker.processQueue().catch(...);
  }

  // 🚀 Retornamos el resultado local INMEDIATAMENTE.
  // La UI se desbloquea instantáneamente.
  return result;
};
