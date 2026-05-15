// src/infra/adapters/dexie-order-identity.adapter.ts

import { OrderIdentityPort, OrderRepositoryPort } from "@/mini-back/core/orders/public";


export class DexieOrderIdentityAdapter implements OrderIdentityPort {
  constructor(private readonly repo: OrderRepositoryPort) {}

  async getNextDailyNumber(): Promise<number> {
    return await this.repo.getNextDailyNumber();
  }
}