// src/infra/adapters/dexie-order-repository.adapter.ts

import {
  CoreOrderStateEvent,
  Order,
  OrderRepositoryPort,
} from "@/mini-back/core/orders-core/public";
import { db } from "../db";
import { SyncStatus } from "../shcema/orders.schema";

export class DexieOrderRepositoryAdapter implements OrderRepositoryPort {
  async save(input: Order): Promise<void> {
    // console.log("Guardando orden en Dexie:", input.idTemp);
    await db.orders.add({
      idTemp: input.idTemp,
      businessId: input.businessId,
      syncStatus: input.syncStatus,
      syncPriority: input.syncPriority,
      customerName: input.customerName,
      customerPhone: input.customerPhone || "",
      customerAddress: input.customerAddress,
      customerObservations: input.customerObservations,
      total: input.total,
      deliveryType: input.deliveryType,
      deliveryProvider: input.deliveryProvider,
      deliveryPriceMode: input.deliveryPriceMode,
      totalDeliveryCost: input.totalDeliveryCost,
      orderPaymentMethod: input.orderPaymentMethod,
      paymentStatus: input.paymentStatus,
      deliveryQuotationStatus: input.deliveryQuotationStatus,
      deliveryStatus: input.deliveryStatus,
      status: input.status,
      origin: input.origin,
      items: input.items,
      shortCode: input.shortCode,
      dailyNumber: input.dailyNumber,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      syncedDelivery: false,
      syncedPayment: false,
      syncedStatus: false, 
    }); // Adaptamos la entidad del core a la tabla
  }

  // async saveOrderEvent(event: CoreOrderStateEvent) {
  //   // El evento nace en local como pendiente de subir a la nube
  //   // console.log("Infraestructura procesando y guardando evento en Dexie...");

  //   const id = this.nextUUID();

  //   // console.log(
  //   //   "Evento preparado para guardar en Dexie con id:",
  //   //   id,
  //   //   "y estado:",
  //   //   event.value,
  //   // );

  //   // La infraestructura toma el dato puro del core y le inyecta la tecnología
  //   await db.orderStateEvents.add({
  //     id: id,
  //     idTemp: event.idTemp,
  //     orderId: event.orderId,
  //     stateType: event.stateType,
  //     value: event.value,
  //     author: event.author,
  //     createdAt: event.createdAt,
  //     syncStatus: "PENDING", // Control exclusivo del motor de sincronización offline
  //   });
  // }

  nextUUID(): string {
    // Generamos un UUID simple para identificar eventos localmente
    return crypto.randomUUID();
  }

  async findByIdTemp(idTemp: string): Promise<Order | null> {
    // console.log("Buscando orden en Dexie por idTemp:", idTemp);
    const result = await db.orders.where("idTemp").equals(idTemp).first();
    return (result as Order) || null;
  }

  async update(order: Order): Promise<void> {
    // console.log("Actualizando orden en Dexie:", order);
    // await db.orders.put(order as LocalOrder);
  }

  // Este método cumple con lo que el Core necesita para su identidad diaria
  async getNextDailyNumber(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await db.orders.where("createdAt").above(today).count();

    return count + 1;
  }

  async updateStatuses(idTemp: string, updates: Partial<Order>): Promise<void> {
    await db.orders.update(idTemp, updates);
  }

  async getPendingQueue(options?: { forceAll?: boolean }): Promise<Order[]> {
    const targetStatuses: SyncStatus[] = ["SYNC_PENDING", "SYNC_ERROR"];

    if (options?.forceAll) {
      targetStatuses.push("LOCAL_ONLY");
    }

    const query = db.orders.where("syncStatus").anyOf(targetStatuses);

    if (options?.forceAll) {
      const orders = await query.sortBy("createdAt");
      return orders as unknown as Order[];
    }

    const allPending = await query.sortBy("createdAt");

    // Filtramos: Creaciones de alta prioridad u órdenes existentes con ID que mutaron sus hilos
    const filteredOrders = allPending.filter(
      (order) => order.syncPriority === "HIGH" || !!order.id,
    );

    return filteredOrders as unknown as Order[];
  }

  /**
   * ⚡ Cuenta órdenes pendientes reales en 0ms sin traerlas a memoria
   */
  async getPendingCount(options?: { forceAll?: boolean }): Promise<number> {
    const targetStatuses: SyncStatus[] = ["SYNC_PENDING", "SYNC_ERROR"];

    if (options?.forceAll) {
      targetStatuses.push("LOCAL_ONLY");
    }

    return await db.orders
      .where("syncStatus")
      .anyOf(targetStatuses)
      .count();
  }
}
