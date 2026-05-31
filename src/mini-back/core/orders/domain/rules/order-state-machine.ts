// core/orders/domain/rules/order-state-machine.ts

import {
  DELIVERY_TRANSITIONS,
  DeliveryStatus,
  ORDER_TRANSITIONS,
  OrderStatus,
  PAYMENT_TRANSITIONS,
  PaymentStatus,
} from "../order-state-machine";

export class OrderStateMachine {
  // 1. Mapas de transiciones (Tus reglas actuales)
  private static readonly ORDER_TRANSITIONS: Record<
    OrderStatus,
    OrderStatus[]
  > = ORDER_TRANSITIONS;

  private static readonly PAYMENT_TRANSITIONS: Record<
    PaymentStatus,
    PaymentStatus[]
  > = PAYMENT_TRANSITIONS;

  private static readonly DELIVERY_TRANSITIONS: Record<
    DeliveryStatus,
    DeliveryStatus[]
  > = DELIVERY_TRANSITIONS;

  // 2. Métodos de validación

  static canChangeStatus(current: OrderStatus, next: OrderStatus): boolean {
    return this.ORDER_TRANSITIONS[current]?.includes(next) ?? false;
  }

  static canChangePayment(
    current: PaymentStatus,
    next: PaymentStatus,
  ): boolean {
    return this.PAYMENT_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Validación cruzada: Soberanía de Locus.
   * El negocio decide si se puede cambiar el envío basado en el estado de la orden.
   */
  static canChangeDelivery(
    next: DeliveryStatus,
    currentOrder: { status: OrderStatus; deliveryStatus: DeliveryStatus },
  ): boolean {

    console.log(`next: ${next}, currents: ${currentOrder}`)
    // Regla: No se puede pedir cadete si no está confirmada o en preparación
    if (next === DeliveryStatus.REQUESTED) {
      const allowed = [
        OrderStatus.COMPLETED,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
      ];
      if (!allowed.includes(currentOrder.status)) return false;
    }

    // Regla: No se puede marcar como "Enviado" (SHIPPED) si la orden no está "Lista" (READY)
    if (
      next === DeliveryStatus.SHIPPED &&
      currentOrder.status !== OrderStatus.READY
    ) {
      return false;
    }

    return (
      this.DELIVERY_TRANSITIONS[currentOrder.deliveryStatus]?.includes(next) ??
      false
    );
  }
}
