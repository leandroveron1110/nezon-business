import { IOrder } from "@/features/order/types/order";
import {
  LocalOrder,
  LocalOrderItem,
  LocalOrderOption,
  LocalOrderOptionGroup,
} from "../shcema/orders.schema";

export class OrderMapper {
  static toLocal(apiOrder: IOrder): LocalOrder {
    return {
      idTemp: apiOrder.id, // Usamos el ID del back como temp para consistencia
      id: apiOrder.id,
      syncStatus: "synced",
      userId: apiOrder.userId,

      // Datos del cliente
      customerName: apiOrder.user.fullName,
      customerPhone: apiOrder.user.phone,
      customerAddress: apiOrder.user.address ?? undefined,
      customerObservations: apiOrder.customerObservations ?? undefined,

      // Logística y Totales
      deliveryType: apiOrder.deliveryType === "PICKUP" ? "PICKUP" : "DELIVERY",
      total: Number(apiOrder.total),
      totalDeliveryCost: Number(apiOrder.totalDeliveryCost),

      // Pagos (Mapeo de Enums a tus literales)
      orderPaymentMethod: this.mapPaymentMethod(apiOrder.orderPaymentMethod),
      paymentStatus:
        apiOrder.paymentStatus === "CONFIRMED" ? "PAID" : "PENDING",

      // El Corazón: Mapeo recursivo de items
      items: apiOrder.items.map(
        (item): LocalOrderItem => ({
          productId: item.id,
          productName: item.productName,
          quantity: item.quantity,
          priceAtPurchase: Number(item.priceAtPurchase),
          notes: item.notes ?? undefined,
          optionGroups: item.optionGroups.map(
            (og): LocalOrderOptionGroup => ({
              groupName: og.groupName,
              options: og.options.map(
                (opt): LocalOrderOption => ({
                  optionId: opt.id,
                  optionName: opt.optionName,
                  priceFinal: Number(opt.priceFinal),
                  quantity: opt.quantity,
                }),
              ),
            }),
          ),
        }),
      ),

      status: apiOrder.status,
      origin: apiOrder.origin === "BUSINESS" ? "BUSINESS" : "APP",
      createdAt: new Date(apiOrder.createdAt),
      updatedAt: new Date(apiOrder.updatedAt),
    };
  }

  private static mapPaymentMethod(method: string): "CASH" | "TRANSFER" | "QR" {
    if (method === "CASH") return "CASH";
    if (method === "TRANSFER") return "TRANSFER";
    return "QR"; // Default o mapeo para QR
  }
}
