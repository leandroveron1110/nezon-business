// src/core/orders/ports/order-api.port.ts

import { Order } from "../domain/order.entity";

export interface OrderApiPort {
  fetchOrders(
    businessId: string, 
    lastSyncTime?: string, 
    daysBack?: number, 
    specificDate?: string
  ): Promise<{ orders: Order[]; latestTimestamp: string }>;
  
  updateOrderRemote(orderId: string, thread: string, value: string): Promise<boolean>;
}