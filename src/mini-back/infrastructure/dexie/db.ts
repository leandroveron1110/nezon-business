// src/common/database/index.ts
import Dexie, { type Table } from 'dexie';
import { type LocalProduct, PRODUCTS_STORE } from './shcema/products.schema';
import { type LocalOrder, ORDERS_STORE } from './shcema/orders.schema';
import { DELIVERY_STORE, LocalConfigRecord } from './shcema/delivery.schema';
import { ORDER_STATE_EVENTS_STORE } from './shcema/orderStateEvents';
import { BUSINESS_STORE, LocalBusiness } from './shcema/business.schema';

export class HunayDB extends Dexie {
  business!: Table<LocalBusiness>;
  products!: Table<LocalProduct>;
  orders!: Table<LocalOrder>;
  deliveryConfig!: Table<LocalConfigRecord>;
  // orderStateEvents!: Table<OrderStateEvent>;
  metadata!: Table<{ id: string; value: string }>;

  constructor() {
    super('HunayBusinessDB');
    
    this.version(3).stores({
      business: BUSINESS_STORE,
      products: PRODUCTS_STORE,
      orders: ORDERS_STORE,
      deliveryConfig: DELIVERY_STORE,
      orderStateEvents: ORDER_STATE_EVENTS_STORE,
      metadata: 'id'
    });
  }
}

let dbInstance: HunayDB | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new HunayDB();
  }

  return dbInstance;
}
export const db = getDb();