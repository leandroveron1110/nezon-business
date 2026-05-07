// Replicamos los Enums para el Front (o importalos de tus tipos compartidos)
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

export enum DeliveryStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  PENDING = 'PENDING',
  REQUESTED = 'REQUESTED',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// --- MÁQUINAS DE ESTADOS ---

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.REJECTED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.IN_PROGRESS, PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
  [PaymentStatus.IN_PROGRESS]: [PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
  [PaymentStatus.CONFIRMED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.REJECTED]: [PaymentStatus.IN_PROGRESS, PaymentStatus.PENDING],
  [PaymentStatus.REFUNDED]: [],
};

export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.NOT_APPLICABLE]: [],
  [DeliveryStatus.PENDING]: [DeliveryStatus.REQUESTED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.REQUESTED]: [DeliveryStatus.SHIPPED, DeliveryStatus.CANCELLED, DeliveryStatus.PENDING],
  [DeliveryStatus.SHIPPED]: [DeliveryStatus.COMPLETED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.CANCELLED]: [DeliveryStatus.PENDING],
  [DeliveryStatus.COMPLETED]: [],
};

// --- VALIDACIONES DE TRANSICIÓN ---

export const canChangeOrderStatus = (
  current: OrderStatus,
  next: OrderStatus,
): boolean => {
  return ORDER_TRANSITIONS[current]?.includes(next) ?? false;
};

/**
 * Validación de hilos cruzados para el Frontend (Modo Offline-Ready)
 * Esta función es la que decidirá si un botón se habilita o no en la UI del local.
 */
export const canChangeDeliveryStatus = (
  next: DeliveryStatus,
  currentOrder: { status: OrderStatus; deliveryStatus: DeliveryStatus },
): boolean => {
  // 1. No podés pedir cadete (REQUESTED) si la orden no fue aceptada o está en proceso
  if (next === DeliveryStatus.REQUESTED) {
    const validOrderStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
    ];
    if (!validOrderStatuses.includes(currentOrder.status)) return false;
  }

  // 2. No podés despachar (SHIPPED) si la orden no está físicamente lista (READY)
  // Esto evita que el negocio mande al cadete antes de terminar la comida.
  if (
    next === DeliveryStatus.SHIPPED &&
    currentOrder.status !== OrderStatus.READY
  ) {
    return false;
  }

  // 3. Verificación de transición lógica dentro del hilo de entrega
  return (
    DELIVERY_TRANSITIONS[currentOrder.deliveryStatus]?.includes(next) ?? false
  );
};