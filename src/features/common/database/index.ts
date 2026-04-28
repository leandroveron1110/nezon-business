// src/common/database/index.ts
import Dexie, { type Table } from 'dexie';
import { type LocalProduct, PRODUCTS_STORE } from './products.schema';
import { type LocalOrder, ORDERS_STORE } from './orders.schema';
import { type LocalLogisticsConfig, DELIVERY_STORE } from './delivery.schema';

export class NezonDB extends Dexie {
  products!: Table<LocalProduct>;
  orders!: Table<LocalOrder>;
  deliveryConfig!: Table<LocalLogisticsConfig>;

  constructor() {
    super('NezonBusinessDB');
    
    this.version(1).stores({
      products: PRODUCTS_STORE,
      orders: ORDERS_STORE,
      deliveryConfig: DELIVERY_STORE,
    });
  }
}

export const db = new NezonDB();