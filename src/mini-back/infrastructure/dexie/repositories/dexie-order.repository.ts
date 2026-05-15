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
    
    const count = await db.orders
      .where("createdAt")
      .above(today)
      .count();
      
    return count + 1;
  }

  async updateStatuses(idTemp: string, updates: any): Promise<void> {
    await db.orders.update(idTemp, updates);
  }
}