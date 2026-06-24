// src/features/orders/mappers/order-persistence.mapper.ts

import { IOrder } from "@/features/order/types/order";
import { LocalOrder } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";

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


    let finalOrigin: "APP" | "BUSINESS" = "BUSINESS";
    if (apiOrder.origin) {
      const normalizedOrigin = String(apiOrder.origin).toUpperCase();
      if (normalizedOrigin === "APP") finalOrigin = "APP";
    }

    // =========================
    // 🚀 RESULTADO FINAL
    // =========================
    return {
      idTemp: apiOrder.idTemp ?? apiOrder.id, 
      id: apiOrder.id,
      userId: apiOrder.user?.id ?? undefined,
      businessId: apiOrder.businessId,
      syncPriority: "HIGH", 
      
      // Mantenemos lo que manda la API (luego el InboundCommand decidirá si lo pisa o no)
      dailyNumber: apiOrder.dailyNumber ?? undefined, 
      shortCode: apiOrder.shortCode ?? undefined, 

      // Al venir de la API, asumimos que este estado ya está impactado arriba
      syncStatus: "SYNCED",
      syncedDelivery: true,
      syncedPayment: true,
      syncedStatus: true,

      // Cliente
      customerName: apiOrder.user?.fullName ?? "Cliente Mostrador",
      customerPhone: apiOrder.user?.phone ?? "",
      customerAddress: apiOrder.user?.address ?? undefined,
      customerObservations: apiOrder.customerObservations ?? undefined,

      // Logística
      deliveryType,
      deliveryProvider,
      deliveryPriceMode,
      totalDeliveryCost: Number(apiOrder.totalDeliveryCost ?? 0),

      // Totales
      total: Number(apiOrder.total),

      // Pagos
      orderPaymentMethod: (apiOrder.orderPaymentMethod as "CASH" | "TRANSFER" | "QR" | "DELIVERY") ?? "CASH",
      paymentStatus: apiOrder.paymentStatus,

      // Items
      items,

      // Metadata
      status: apiOrder.status,
      
      origin: finalOrigin,

      deliveryStatus: apiOrder.deliveryStatus ?? "PENDING",

      createdAt: new Date(apiOrder.createdAt),
      updatedAt: new Date(apiOrder.updatedAt),
      
    };
  }
}