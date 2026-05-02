// src/common/database/index.ts
import Dexie, { type Table } from 'dexie';
import { type LocalProduct, PRODUCTS_STORE } from './shcema/products.schema';
import { type LocalOrder, ORDERS_STORE } from './shcema/orders.schema';
import { type LocalLogisticsConfig, DELIVERY_STORE, LocalConfigRecord } from './shcema/delivery.schema';

export class NezonDB extends Dexie {
  products!: Table<LocalProduct>;
  orders!: Table<LocalOrder>;
  deliveryConfig!: Table<LocalConfigRecord>;
  metadata!: Table<{ id: string; value: string }>;

  constructor() {
    super('NezonBusinessDB');
    
    this.version(1).stores({
      products: PRODUCTS_STORE,
      orders: ORDERS_STORE,
      deliveryConfig: DELIVERY_STORE,
      metadata: 'id'
    });
  }
}

export const db = new NezonDB();