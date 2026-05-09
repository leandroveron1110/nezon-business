import { v4 as uuid } from "uuid";
import { LocalOrder } from "../shcema/orders.schema";
import { db } from "..";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/order-state-machine";
import { OrderIdentityService } from "../../utils/order-identity.service";

export const createOrderInteractor = async (orderData: LocalOrder) => {
  if (orderData) {
    // 1. LÓGICA DE NEGOCIO: Generación de Turno Diario (P-1, A-52, etc.)
    // 1. Obtener Identidad Operativa
    const origin = "BUSINESS";
    const nextNumber = await OrderIdentityService.getNextDailyNumber(origin);
    const shortCode = OrderIdentityService.formatShortCode(nextNumber, origin);

    const newOrder: LocalOrder = {
      idTemp: uuid(),
      id: null,
      syncStatus: "pending_creation", // TypeScript ahora sabe que es el literal exacto
      customerName: orderData.customerName?.trim() || shortCode, // Si no hay nombre, usamos el turno diario
      customerPhone: orderData.customerPhone || "",
      customerAddress: orderData.customerAddress || "",
      total: orderData.total || 0,
      deliveryType: orderData.deliveryType || "PICKUP",
      deliveryProvider: orderData.deliveryProvider || "PLATFORM",
      deliveryPriceMode:
        orderData.deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC",
      totalDeliveryCost:
        orderData.deliveryType === "DELIVERY" ? orderData.totalDeliveryCost : 0,
      orderPaymentMethod: orderData.orderPaymentMethod || "CASH",
      paymentStatus: orderData.paymentStatus || PaymentStatus.PENDING,
      items: [...orderData.items], // Copia superficial para evitar mutaciones
      status: orderData.status,
      origin: "BUSINESS",
      createdAt: new Date(),
      updatedAt: new Date(),
      shortCode: shortCode,
      dailyNumber: nextNumber,
      deliveryStatus:
        orderData.deliveryType === "DELIVERY"
          ? DeliveryStatus.PENDING
          : DeliveryStatus.NOT_APPLICABLE,
    };

    // 3. PERSISTENCIA
    // Si mañana cambiamos Dexie por una API, solo tocamos esta línea
    return await db.orders.add(newOrder);
  }
};
