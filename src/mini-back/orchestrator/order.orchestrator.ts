// src/orchestrator/order.orchestrator.ts

import { CreateOrderInput, OrderServicePublic, UpdateOrderStatusInput } from "../core/orders/public";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";


export const createOrderOrchestrator = async (input: CreateOrderInput & { businessId: string }) => {
  // 1. Inicializamos Infraestructura
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter(repositoryAdapter);

  // 2. Instanciamos el Core (Inyectando soberanía)
  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter
  });

  // 3. Ejecutamos Negocio
  const result = await orderCore.createOrder(input);


if (result.success && result.data) {
  const order = result.data;
  console.log(`order syncStatus ${order.syncStatus}, syncPriority ${order.syncPriority}`);
  if (order.syncStatus === "SYNC_PENDING" && order.syncPriority === "HIGH") {
    
    // Pasamos el objeto 'order' entero, no solo el ID
    cloudSyncService.triggerImmediateSync({ ...order, businessId: input.businessId })
      .then(cloudId => {
        // ÉXITO: El Core actualiza Dexie con el ID real
        return orderCore.confirmCloudSync(order.idTemp, cloudId);
      })
      .catch(err => {
        console.error("Fallo de red en sync inmediato:", err);
        return orderCore.notifySyncError(order.idTemp);
      });
  }
  
  console.log(`Orden ${order.shortCode} lista.`);
}

  return result;
};

// src/orchestrator/update-order-status.orchestrator.ts

export const updateOrderStatusOrchestrator = async (input: UpdateOrderStatusInput) => {
  const repository = new DexieOrderRepositoryAdapter();
  const identity = new DexieOrderIdentityAdapter(repository);
  const orderCore = OrderServicePublic({ repository, identity });

  console.log("Orquestador: Actualizando estado de orden", input);

  // 1. El Core valida y guarda localmente (Paso obligatorio)
  const result = await orderCore.updateStatus(input);

  if (!result.success || !result.data) return result;

  const order = result.data;

  // 2. Orquestación de Red (Sincronización)
  // Si tiene ID remoto, intentamos avisar a la nube
  // if (order.id) {
  //   try {
  //     const success = await cloudApi.updateOrder(order.id, { [input.thread.toLowerCase()]: input.nextValue });
  //     if (success) {
  //       // 3. Volvemos al Core para confirmar que ya está en la nube
  //       await orderCore.confirmCloudSync(order.idTemp, order.id);
  //     }
  //   } catch (error) {
  //     console.warn("Sincronización fallida, el worker reintentará luego.");
  //   }
  // }

  return result;
};