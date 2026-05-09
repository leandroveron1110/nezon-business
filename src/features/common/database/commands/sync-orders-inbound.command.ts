
import { IOrder } from "@/features/order/types/order";
import { OrderPersistenceMapper } from "../mappers/order-persistence.mapper";
import { db } from "..";
import { OrderIdentityService } from "../../utils/order-identity.service";
import { LocalOrder } from "../shcema/orders.schema";

export async function syncOrdersInboundCommand(
  apiOrders: IOrder[], 
  latestTimestamp: string
): Promise<void> {
  
  // Procesamos las órdenes una por una para manejar sus turnos
  const processedOrders: LocalOrder[] = [];

  for (const apiOrder of apiOrders) {
    const localOrder = OrderPersistenceMapper.toLocal(apiOrder);

    // 🧠 LÓGICA DE TURNO PARA APP
    // Si la orden ya está en nuestra DB, mantenemos su shortCode.
    // Si es nueva y viene de la APP, le asignamos el turno A-X.
    const existing = await db.orders.get(localOrder.id!);
    
    if (!existing || !existing.shortCode) {
      const nextNumber = await OrderIdentityService.getNextDailyNumber("APP");
      localOrder.dailyNumber = nextNumber;
      localOrder.shortCode = OrderIdentityService.formatShortCode(nextNumber, "APP");
    } else {
      localOrder.dailyNumber = existing.dailyNumber;
      localOrder.shortCode = existing.shortCode;
    }

    processedOrders.push(localOrder);
  }

  await db.transaction('rw', [db.orders, db.metadata], async () => {
    await db.orders.bulkPut(processedOrders);
    await db.metadata.put({ id: 'last_sync_orders', value: latestTimestamp });
  });
}