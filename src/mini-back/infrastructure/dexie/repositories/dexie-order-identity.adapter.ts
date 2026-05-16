// src/infra/adapters/dexie-order-identity.adapter.ts

import {
  OrderIdentityPort,
} from "@/mini-back/core/orders/public";
import { db } from "../db";

export class DexieOrderIdentityAdapter implements OrderIdentityPort {
  async getNextDailyNumber(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await db.orders.where("createdAt").above(today).count();

    return count + 1;
  }
}
