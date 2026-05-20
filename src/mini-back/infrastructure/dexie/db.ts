// src/common/database/index.ts
import Dexie, { type Table } from 'dexie';
import { type LocalProduct, PRODUCTS_STORE } from './shcema/products.schema';
import { type LocalOrder, ORDERS_STORE } from './shcema/orders.schema';
import { DELIVERY_STORE, LocalConfigRecord } from './shcema/delivery.schema';
import { ORDER_STATE_EVENTS_STORE, OrderStateEvent } from './shcema/orderStateEvents';

export class NezonDB extends Dexie {
  products!: Table<LocalProduct>;
  orders!: Table<LocalOrder>;
  deliveryConfig!: Table<LocalConfigRecord>;
  orderStateEvents!: Table<OrderStateEvent>;
  metadata!: Table<{ id: string; value: string }>;

  constructor() {
    super('NezonBusinessDB');
    
    this.version(2).stores({
      products: PRODUCTS_STORE,
      orders: ORDERS_STORE,
      deliveryConfig: DELIVERY_STORE,
      orderStateEvents: ORDER_STATE_EVENTS_STORE,
      metadata: 'id'
    });
  }
}

export const db = new NezonDB();