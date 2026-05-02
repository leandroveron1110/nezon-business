import { IOrder } from "@/features/order/types/order";
import {
  LocalOrder,
  LocalOrderItem,
  LocalOrderOption,
  LocalOrderOptionGroup,
} from "../shcema/orders.schema";

// 👇 Extensión tipada (sin any)
type ApiOrderExtended = IOrder & {
  deliveryProvider?: "PLATFORM" | "INTERNAL";
};

export class OrderMapper {
  static toLocal(apiOrder: ApiOrderExtended): LocalOrder {
    
    // =========================
    // 🧠 Normalización logística
    // =========================

    const deliveryType: "DELIVERY" | "PICKUP" =
      apiOrder.deliveryType === "PICKUP" ? "PICKUP" : "DELIVERY";

    const deliveryProvider: "PLATFORM" | "INTERNAL" =
      apiOrder.deliveryProvider ?? "PLATFORM";

    const deliveryPriceMode: "AUTOMATIC" | "MANUAL" =
      deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC";

    // =========================
    // 🧠 Pagos
    // =========================

    const paymentStatus: "PAID" | "PENDING" =
      apiOrder.paymentStatus === "CONFIRMED" ? "PAID" : "PENDING";

    // =========================
    // 🧠 Items (safe mapping)
    // =========================

    const items: LocalOrderItem[] = apiOrder.items.map((item) => ({
      productId: item.id,
      productName: item.productName,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtPurchase),
      notes: item.notes ?? undefined,

      optionGroups:
        item.optionGroups?.map(
          (og): LocalOrderOptionGroup => ({
            groupName: og.groupName,
            options: og.options.map(
              (opt): LocalOrderOption => ({
                optionId: opt.id,
                optionName: opt.optionName,
                priceFinal: Number(opt.priceFinal),
                quantity: opt.quantity,
              })
            ),
          })
        ) ?? [],
    }));

    // =========================
    // 🚀 RESULTADO FINAL
    // =========================

    return {
      // IDs
      idTemp: apiOrder.id,
      id: apiOrder.id,
      userId: apiOrder.userId ?? apiOrder.user?.id,

      // Sync
      syncStatus: "synced",

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
      orderPaymentMethod: this.mapPaymentMethod(apiOrder.orderPaymentMethod),
      paymentStatus,

      // Items
      items,

      // Metadata
      status: apiOrder.status,
      origin: apiOrder.origin === "BUSINESS" ? "BUSINESS" : "APP",

      createdAt: new Date(apiOrder.createdAt),
      updatedAt: new Date(apiOrder.updatedAt),
    };
  }

  private static mapPaymentMethod(
    method: string
  ): "CASH" | "TRANSFER" | "QR" | "DELIVERY" {
    if (method === "CASH") return "CASH";
    if (method === "TRANSFER") return "TRANSFER";
    if (method === "DELIVERY") return "DELIVERY";
    return "QR"; // fallback seguro
  }
}