// src/common/database/repositories/order.repository.ts
import { IOrder } from '@/features/order/types/order';
import { OrderMapper } from '../mappers/order.mapper';
import { db } from '@/mini-back/infrastructure/dexie/db';
import { LocalOrder } from '@/mini-back/infrastructure/dexie/shcema/orders.schema';

export const OrderRepository = {
  async saveSyncOrders(apiOrders: IOrder[], latestTimestamp: string): Promise<void> {
    const localOrders: LocalOrder[] = apiOrders.map(order => OrderMapper.toLocal(order));
    
    await db.transaction('rw', [db.orders, db.metadata], async () => {
      // bulkPut es eficiente y respeta el tipado de LocalOrder
      await db.orders.bulkPut(localOrders);
      await db.metadata.put({ id: 'last_sync_orders', value: latestTimestamp });
    });
  },

  async getOrdersByBusiness(businessId: string): Promise<LocalOrder[]> {
    return await db.orders
      .where('businessId')
      .equals(businessId)
      .reverse()
      .sortBy('createdAt');
  }
};