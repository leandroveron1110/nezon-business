
import { IOrder } from "@/features/order/types/order";
import { OrderPersistenceMapper } from "../mappers/order-persistence.mapper";
import { db } from "..";

export async function syncOrdersInboundCommand(
  apiOrders: IOrder[], 
  latestTimestamp: string
): Promise<void> {
  const localOrders = apiOrders.map(OrderPersistenceMapper.toLocal);

  await db.transaction('rw', [db.orders, db.metadata], async () => {
    // bulkPut: Si existe lo actualiza, si no lo crea.
    await db.orders.bulkPut(localOrders);
    await db.metadata.put({ id: 'last_sync_orders', value: latestTimestamp });
  });
}