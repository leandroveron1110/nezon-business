// core/orders/domain/rules/order-state-machine.ts

import { DeliveryStatus, OrderStatus, PaymentStatus } from "../order-state-machine";


export class OrderStateMachine {
  // 1. Mapas de transiciones (Tus reglas actuales)
  private static readonly ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  private static readonly PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.IN_PROGRESS, PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
    [PaymentStatus.IN_PROGRESS]: [PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
    [PaymentStatus.CONFIRMED]: [PaymentStatus.REFUNDED],
    [PaymentStatus.REJECTED]: [PaymentStatus.IN_PROGRESS, PaymentStatus.PENDING],
    [PaymentStatus.REFUNDED]: [],
  };

  private static readonly DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
    [DeliveryStatus.NOT_APPLICABLE]: [],
    [DeliveryStatus.PENDING]: [DeliveryStatus.REQUESTED, DeliveryStatus.CANCELLED],
    [DeliveryStatus.REQUESTED]: [DeliveryStatus.SHIPPED, DeliveryStatus.CANCELLED, DeliveryStatus.PENDING],
    [DeliveryStatus.SHIPPED]: [DeliveryStatus.COMPLETED, DeliveryStatus.CANCELLED],
    [DeliveryStatus.CANCELLED]: [DeliveryStatus.PENDING],
    [DeliveryStatus.COMPLETED]: [],
  };

  // 2. Métodos de validación
  
  static canChangeStatus(current: OrderStatus, next: OrderStatus): boolean {
    return this.ORDER_TRANSITIONS[current]?.includes(next) ?? false;
  }

  static canChangePayment(current: PaymentStatus, next: PaymentStatus): boolean {
    return this.PAYMENT_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Validación cruzada: Soberanía de Locus.
   * El negocio decide si se puede cambiar el envío basado en el estado de la orden.
   */
  static canChangeDelivery(next: DeliveryStatus, currentOrder: { status: OrderStatus, deliveryStatus: DeliveryStatus }): boolean {
    // Regla: No se puede pedir cadete si no está confirmada o en preparación
    if (next === DeliveryStatus.REQUESTED) {
      const allowed = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY];
      if (!allowed.includes(currentOrder.status)) return false;
    }

    // Regla: No se puede marcar como "Enviado" (SHIPPED) si la orden no está "Lista" (READY)
    if (next === DeliveryStatus.SHIPPED && currentOrder.status !== OrderStatus.READY) {
      return false;
    }

    return this.DELIVERY_TRANSITIONS[currentOrder.deliveryStatus]?.includes(next) ?? false;
  }
}