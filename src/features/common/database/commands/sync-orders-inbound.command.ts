// sync-orders-inbound.command.ts
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

    // 1. BUSQUEDA INTELIGENTE: Buscamos por ID real o por ID Temporal
    let existing = await db.orders.get(localOrder.idTemp);
    if (!existing && localOrder.id) {
      existing = await db.orders.get(localOrder.id);
    }

    console.log(`orgin API: ${apiOrder.origin} | existing origin: ${existing?.origin} | shortCode API: ${apiOrder.shortCode} | existing shortCode: ${existing?.shortCode}`);
      
    if (existing && existing.shortCode) {
      // Si ya existía localmente, mantenemos estrictamente la identidad que ya tenía
      localOrder.dailyNumber = existing.dailyNumber;
      localOrder.shortCode = existing.shortCode;
      localOrder.origin = existing.origin; // Preservamos también el origen original
    } else {
      const incomingOrigin = String(apiOrder.origin).toUpperCase();

      // Si es de Business con código válido, lo respetamos
      if (incomingOrigin === "BUSINESS" && apiOrder.shortCode) {
        localOrder.dailyNumber = apiOrder.dailyNumber;
        localOrder.shortCode = apiOrder.shortCode;
        localOrder.origin = "BUSINESS";
      } else {
        // Para cualquier otro caso (Es "APP" o vino de "BUSINESS" sin código)
        const nextNumber = await OrderIdentityService.getNextDailyNumber("APP");
        localOrder.dailyNumber = nextNumber;
        localOrder.shortCode = OrderIdentityService.formatShortCode(nextNumber, "APP");
        localOrder.origin = "APP";
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