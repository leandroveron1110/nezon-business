// src/features/orders/mappers/order-persistence.mapper.ts

import { IOrder } from "@/features/order/types/order";
import { LocalOrder } from "../shcema/orders.schema";

export class OrderPersistenceMapper {
  static toLocal(apiOrder: IOrder): LocalOrder {
    return {
      idTemp: apiOrder.id, // En sync, usamos el ID real como temp
      id: apiOrder.id,
      syncStatus: 'synced',
      customerName: apiOrder.user.fullName,
      customerPhone: apiOrder.user.phone,
      customerAddress: apiOrder.user.address ?? undefined,
      customerObservations: apiOrder.customerObservations ?? undefined,
      deliveryType: apiOrder.deliveryType as 'DELIVERY' | 'PICKUP',
      total: Number(apiOrder.total),
      totalDeliveryCost: Number(apiOrder.totalDeliveryCost),
      orderPaymentMethod: apiOrder.orderPaymentMethod as 'CASH' | 'TRANSFER' | 'QR',
      paymentStatus: apiOrder.paymentStatus === 'CONFIRMED' ? 'PAID' : 'PENDING',
      status: apiOrder.status,
      origin: 'APP',
      items: apiOrder.items.map(item => ({
        productId: item.id,
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        notes: item.notes ?? undefined,
        optionGroups: item.optionGroups.map(og => ({
          groupName: og.groupName,
          options: og.options.map(opt => ({
            optionId: opt.id,
            optionName: opt.optionName,
            priceFinal: Number(opt.priceFinal),
            quantity: opt.quantity
          }))
        }))
      })),
      createdAt: new Date(apiOrder.createdAt),
      updatedAt: new Date(apiOrder.updatedAt),
    };
  }
}