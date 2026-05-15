// core/domain/order-state-machine.ts

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