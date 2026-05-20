// src/core/orders/signals/order-signals.port.ts
export interface OrderSignalsPort {
  emit(event: "ORDER_MUTATED", payload: { orderId: string; thread: string; value: string }): void;
}