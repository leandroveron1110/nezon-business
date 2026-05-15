// core/public/order-state-machine.interface.ts
import { DeliveryStatus, OrderStatus, PaymentStatus } from "../domain/order-state-machine";

export interface IOrderStateMachinePublic {
  /** 
   * Valida y ejecuta el cambio de estado general de la orden.
   */
  canChangeDeliveryStatus(
    next: DeliveryStatus,
    currentOrder: { status: OrderStatus; deliveryStatus: DeliveryStatus },
  ): boolean;
}