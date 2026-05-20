// src/features/orders/mappers/order-persistence.mapper.ts

import { IOrder } from "@/features/order/types/order";
import { LocalOrder } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
// 👇 Extendemos el tipo SIN usar any
type ApiOrderExtended = IOrder & {
  deliveryProvider?: "PLATFORM" | "INTERNAL";
};

export class OrderPersistenceMapper {
  static toLocal(apiOrder: ApiOrderExtended): LocalOrder {
    
    // =========================
    // 🧠 Normalización logística
    // =========================

    const deliveryType: "DELIVERY" | "PICKUP" =
      apiOrder.deliveryType === "DELIVERY" ? "DELIVERY" : "PICKUP";

    const deliveryProvider: "PLATFORM" | "INTERNAL" =
      apiOrder.deliveryProvider ?? "PLATFORM";

    const deliveryPriceMode: "AUTOMATIC" | "MANUAL" =
      deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC";

    // =========================
    // 🧠 Normalización pagos
    // =========================

    const paymentStatus= apiOrder.paymentStatus;

    // =========================
    // 🧠 Items
    // =========================

    const items = apiOrder.items.map((item) => ({
      productId: item.id,
      productName: item.productName,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtPurchase),
      notes: item.notes ?? undefined,

      optionGroups:
        item.optionGroups?.map((og) => ({
          groupName: og.groupName,
          options: og.options.map((opt) => ({
            optionId: opt.id,
            optionName: opt.optionName,
            priceFinal: Number(opt.priceFinal),
            quantity: opt.quantity,
          })),
        })) ?? [],
    }));

    // =========================
    // 🚀 RESULTADO FINAL
    // =========================

    return {
      // IDs
      idTemp: apiOrder.id,
      id: apiOrder.id,
      userId: apiOrder.user?.id,
      businessId: apiOrder.businessId,
      syncPriority: "HIGH", // Todo: Podríamos tener una lógica más compleja para esto
      dailyNumber: 0, // Se asignará en el comando de sincronización
      shortCode: "", // Se asignará en el comando de sincronización
      // Sync
      syncStatus: "SYNCED",

      syncedDelivery: true,
      syncedPayment: true,
      syncedStatus: true,

      // Cliente
      customerName: apiOrder.user.fullName,
      customerPhone: apiOrder.user.phone,
      customerAddress: apiOrder.user.address ?? undefined,
      customerObservations: apiOrder.customerObservations ?? undefined,

      // Logística
      deliveryType,
      deliveryProvider,
      deliveryPriceMode,
      totalDeliveryCost: Number(apiOrder.totalDeliveryCost ?? 0),

      // Totales
      total: Number(apiOrder.total),

      // Pagos
      orderPaymentMethod: apiOrder.orderPaymentMethod as
        | "CASH"
        | "TRANSFER"
        | "QR"
        | "DELIVERY",

      paymentStatus,

      // Items
      items,

      // Metadata
      status: apiOrder.status,
      origin: "APP",

      deliveryStatus: apiOrder.deliveryStatus ?? "PENDING",

      createdAt: new Date(apiOrder.createdAt),
      updatedAt: new Date(apiOrder.updatedAt),
    };
  }
}