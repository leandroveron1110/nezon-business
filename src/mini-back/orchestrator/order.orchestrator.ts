// src/orchestrator/order.orchestrator.ts

import {
  CreateOrderInput,
  OrderServicePublic,
  UpdateOrderStatusInput,
} from "../core/orders/public";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";
import { quoteDeliveryOrchestrator } from "./delivery.orchestrator";
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

  if (
    input.deliveryType === "DELIVERY" &&
    input.deliveryProvider === "INTERNAL" &&
    input.customerAddress &&
    input.totalDeliveryCost === 0
  ) {
    const quotation = await quoteDeliveryOrchestrator(
      input.customerAddress,
      input.businessId,
      input.deliveryProvider,
    );

    if (quotation.success && quotation.data) {
      const data = quotation.data;

      input = {
        ...input,

        totalDeliveryCost: data.quotedCost || 0,
        
        // deliveryZoneId:
        //   data.zoneId || null,

        // deliveryLatitude:
        //   data.latitude || null,

        // deliveryLongitude:
        //   data.longitude || null,

        // deliveryQuotationStatus:
        //   data.quotationStatus,

        // deliveryResolutionStrategy:
        //   data.resolutionStrategy,

        // normalizedAddress:
        //   data.resolvedAddress,
      };
    }
  }

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

    // verificamos si el pedido pide delibery por la plataforma y si es así, lo mandamos a la cola de sincronización aunque no sea HIGH
    if (order.deliveryProvider === "PLATFORM") {
      // si es pedido por la plataforma, verificamos si ya se assigno el precio o no
      if (order.totalDeliveryCost === 0) {
        // console.log(
        //   `Orden ${order.shortCode} requiere delivery por plataforma pero no tiene precio asignado. Forzando sincronización...`,
        // );
      }
      // Aquí disparas tu Worker general (el que primero hace el POST de la creación de la orden
      // y luego actualiza sus estados).
      // syncQueueWorker.processQueue().catch(...);
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

  // 1. El Core valida la máquina de estados y guarda localmente (Rápido y Offline-First)
  const result = await orderCore.updateStatus(input);
  if (!result.success || !result.data) return result;

  const order = result.data;

  const esCambioCritico =
    input.thread === "DELIVERY" && input.nextValue === "REQUESTED";

  // =================================================================
  // CASO 1: La orden ya existe en la nube (Tiene ID) -> Sincronización Inmediata
  // =================================================================
  if (order.id && (order.origin === "APP" || order.syncPriority === "HIGH")) {
    // 🌟 Construimos el payload quirúrgico basado en el hilo que acaba de mutar
    const updatesPayload: {
      status?: string;
      paymentStatus?: string;
      deliveryStatus?: string;
      updatedAt: string;
    } = {
      // Usamos la fecha de modificación que nos devuelve el core local
      updatedAt: order.updatedAt
        ? new Date(order.updatedAt).toISOString()
        : new Date().toISOString(),
    };

    if (input.thread === "STATUS") updatesPayload.status = input.nextValue;
    if (input.thread === "PAYMENT")
      updatesPayload.paymentStatus = input.nextValue;
    if (input.thread === "DELIVERY")
      updatesPayload.deliveryStatus = input.nextValue;

    // 🔥 En segundo plano para no bloquear la UI del POS
    cloudSyncService
      .syncOrderUpdatesOffline(order.id, updatesPayload)
      .then(async (success) => {
        if (success && order.id) {
          // El back ya procesó el cambio y creó el evento histórico.
          // Confirmamos la sincronización de este hilo en nuestro Dexie local.
          await orderCore.confirmCloudSync(order.idTemp, order.id);

          // Adicionalmente, como impactó en caliente con éxito, podés prender
          // las banderas específicas de hilos si tu orderCore lo requiere:
          // await db.orders.update(order.idTemp, { syncedStatus: true, ... });
        } else {
          await orderCore.notifySyncError(order.idTemp);
        }
      })
      .catch(async (error) => {
        console.warn(
          "Fallo de red al actualizar estado en caliente. El SyncWorker resolverá en el fondo.",
          error,
        );
        await orderCore.notifySyncError(order.idTemp);
      });
  }
  // =================================================================
  // CASO 2: La orden es LOCAL (sin ID de nube) pero sufrió un cambio crítico
  // =================================================================
  else if (!order.id && esCambioCritico) {
    // console.log(
    //   "Orquestador: Cambio crítico detectado en orden local. Forzando cola de sincronización...",
    // );
    // Aquí disparas tu Worker general (el que primero hace el POST de la creación de la orden
    // y luego actualiza sus estados).
    // syncQueueWorker.processQueue().catch(...);
  }

  // 🚀 Retornamos el resultado local INMEDIATAMENTE para que el cajero no espere a la red.
  return result;
};
