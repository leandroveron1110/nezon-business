// core/ports/order-repository.port.ts
import { OrderStatus, PaymentStatus, DeliveryStatus } from "@/types/order-state-machine";
import { Order } from "../domain/order.entity";

export interface OrderRepositoryPort {
  // Persistencia base
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  findByIdTemp(idTemp: string): Promise<Order | null>;
  
  // Datos correlativos (Soberanía del Negocio)
  getNextDailyNumber(): Promise<number>;

  // Actualizaciones atómicas de estado (ideales para el mundo offline)
  updateStatuses(idTemp: string, updates: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryStatus?: DeliveryStatus;
  }): Promise<void>;
}