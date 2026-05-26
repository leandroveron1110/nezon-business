import { IOrder } from "@/features/order/types/order";
import { OrderPersistenceMapper } from "../mappers/order-persistence.mapper";
import { OrderIdentityService } from "../../utils/order-identity.service";
import { LocalOrder } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { db } from "@/mini-back/infrastructure/dexie/db";

export async function syncOrdersInboundCommand(
  apiOrders: IOrder[], 
  latestTimestamp: string
): Promise<void> {
  
  const processedOrders: LocalOrder[] = [];

  for (const apiOrder of apiOrders) {
    const localOrder = OrderPersistenceMapper.toLocal(apiOrder);

    // 1. Buscamos si ya existe en la base de datos local
    const existing = await db.orders.get(localOrder.id!);
    
    if (existing && existing.shortCode) {
      // Si ya existía localmente, mantenemos estrictamente lo que ya teníamos guardado
      localOrder.dailyNumber = existing.dailyNumber;
      localOrder.shortCode = existing.shortCode;
    } else {
      // Si la orden es NUEVA en nuestra base de datos local:
      
      if (apiOrder.origin === "BUSINESS" && apiOrder.shortCode) {
        // Si viene del negocio y ya trae su código (ej: "P-1"), LO RESPETAMOS
        localOrder.dailyNumber = apiOrder.dailyNumber;
        localOrder.shortCode = apiOrder.shortCode;
      } else {
        // Si el origen es "APP" o viene sin código (como el último de tu JSON que tiene shortCode: null)
        // Generamos el turno diario correspondiente para la APP ("A-X")
        const nextNumber = await OrderIdentityService.getNextDailyNumber("APP");
        localOrder.dailyNumber = nextNumber;
        localOrder.shortCode = OrderIdentityService.formatShortCode(nextNumber, "APP");
      }
    }

    processedOrders.push(localOrder);
  }

  // Guardamos todo en una sola transacción atómica
  await db.transaction('rw', [db.orders, db.metadata], async () => {
    await db.orders.bulkPut(processedOrders);
    await db.metadata.put({ id: 'last_sync_orders', value: latestTimestamp });
  });
}