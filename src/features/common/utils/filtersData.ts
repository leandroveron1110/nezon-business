import { IOrderShortDto } from "@/types/order";
import { OrderStatus, DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";

export interface ISimplifiedFilter {
  label: string;
  condition: (order: IOrderShortDto) => boolean;
}

export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Todos",
    condition: () => true,
  },
  {
    label: "Pendientes",
    // Prioridad 1: Órdenes nuevas o pagos por validar
    condition: (o) => 
      o.status === OrderStatus.PENDING || 
      o.paymentStatus === PaymentStatus.IN_PROGRESS
  },
  {
    label: "En curso",
    // Órdenes que ya están en cocina o listas, pero no finalizadas
    condition: (o) => 
      [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(o.status) &&
      o.deliveryStatus !== DeliveryStatus.COMPLETED
  },
  {
    label: "En la calle",
    // Hilo de logística activo
    condition: (o) => o.deliveryStatus === DeliveryStatus.SHIPPED
  },
  {
    label: "Completados",
    // El hilo principal llegó al final
    condition: (o) => o.status === OrderStatus.COMPLETED
  },
  {
    label: "Cancelados",
    // Cualquiera de los hilos que haya terminado en error/cancelación
    condition: (o) => 
      o.status === OrderStatus.CANCELLED || 
      o.status === OrderStatus.REJECTED ||
      o.deliveryStatus === DeliveryStatus.CANCELLED
  },
];