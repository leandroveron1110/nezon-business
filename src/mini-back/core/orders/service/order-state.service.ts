import { DeliveryStatus } from "@/types/order-state-machine";
import { OrderRepositoryPort } from "../ports/order-repository.port";
import { IOrderStateMachinePublic } from "../public/order-state-machine.interface";
import { DELIVERY_TRANSITIONS, OrderStatus } from "../domain/order-state-machine";

// core/service/order-state.service.ts
export class OrderStateService implements IOrderStateMachinePublic {
  constructor(private readonly repository: OrderRepositoryPort) {}

canChangeDeliveryStatus(
  next: DeliveryStatus,
  currentOrder: { status: OrderStatus; deliveryStatus: DeliveryStatus },
){
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
}