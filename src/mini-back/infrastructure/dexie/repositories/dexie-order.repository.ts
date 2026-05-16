// src/infra/adapters/dexie-order-repository.adapter.ts

import { Order, OrderRepositoryPort } from "@/mini-back/core/orders/public";
import { db } from "../db";
import { LocalOrder } from "../shcema/orders.schema";

export class DexieOrderRepositoryAdapter implements OrderRepositoryPort {
  async save(order: Order): Promise<void> {
    // console.log("Guardando orden en Dexie:", order);
    await db.orders.add(order as LocalOrder); // Adaptamos la entidad del core a la tabla
  }

  async findByIdTemp(idTemp: string): Promise<Order | null> {
    console.log("Buscando orden en Dexie por idTemp:", idTemp);
    const result = await db.orders.where("idTemp").equals(idTemp).first();
    return (result as Order) || null;
  }

  async update(order: Order): Promise<void> {
    console.log("Actualizando orden en Dexie:", order);
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
  // 1. Definimos qué estados de sincronización queremos buscar
  const targetStatuses = ["SYNC_PENDING", "SYNC_ERROR"];

  // Si es forzado (Cierre de caja / Botón manual), sumamos las órdenes que eran puramente locales
  if (options?.forceAll) {
    targetStatuses.push("LOCAL_ONLY"); // 👈 Reemplazá "LOCAL_ONLY" por el string exacto que usás en tu enum de Dexie para el mostrador
  }

  // 2. Hacemos la query a Dexie con los estados dinámicos
  const query = db.orders
    .where("syncStatus")
    .anyOf(targetStatuses);

  if (options?.forceAll) {
    // Si es manual, devolvemos absolutamente todo lo que matcheó (Pendientes, Errores y Locales)
    const orders = await query.sortBy("createdAt");
    return orders.map((order) => order as Order);
  }

  // 3. Flujo por defecto (Automático en segundo plano cada 30s)
  const allPending = await query.sortBy("createdAt");

  // Filtro estricto para no saturar en horas pico
  const orders = allPending.filter(
    (order) => order.syncPriority === "HIGH" || !!order.id,
  );
  
  return orders.map((order) => order as Order);
}
}
