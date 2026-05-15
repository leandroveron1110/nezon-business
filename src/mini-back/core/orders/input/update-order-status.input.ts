import { DeliveryStatus, OrderStatus, PaymentStatus } from "../domain/order-state-machine";

// core/orders/input/update-order-status.input.ts
type OrderThread = 'STATUS' | 'PAYMENT' | 'DELIVERY';

export interface UpdateOrderStatusInput {
  idTemp: string;
  thread: OrderThread;
  nextValue: OrderStatus | DeliveryStatus | PaymentStatus; 
}