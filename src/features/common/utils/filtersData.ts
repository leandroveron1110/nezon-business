import { IOrderShortDto, OrderStatus, PaymentMethodType } from "@/types/order";

// Mantenemos tu mapa de prioridades para el ordenamiento
export const statusPriority: Record<OrderStatus, number> = {
  [OrderStatus.PENDING]: 1,
  [OrderStatus.WAITING_FOR_PAYMENT]: 2,
  [OrderStatus.PAYMENT_IN_PROGRESS]: 3,
  [OrderStatus.PAYMENT_CONFIRMED]: 4,
  [OrderStatus.PENDING_CONFIRMATION]: 5,
  [OrderStatus.CONFIRMED]: 6,
  [OrderStatus.PREPARING]: 7,
  [OrderStatus.REJECTED_BY_BUSINESS]: 20,
  [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: 8,
  [OrderStatus.READY_FOR_DELIVERY_PICKUP]: 9,
  [OrderStatus.DELIVERY_PENDING]: 10,
  [OrderStatus.DELIVERY_ASSIGNED]: 11,
  [OrderStatus.DELIVERY_ACCEPTED]: 12,
  [OrderStatus.DELIVERY_REJECTED]: 21,
  [OrderStatus.DELIVERY_REASSIGNING]: 13,
  [OrderStatus.OUT_FOR_PICKUP]: 14,
  [OrderStatus.PICKED_UP]: 15,
  [OrderStatus.OUT_FOR_DELIVERY]: 16,
  [OrderStatus.DELIVERED]: 30,
  [OrderStatus.DELIVERY_FAILED]: 22,
  [OrderStatus.RETURNED]: 23,
  [OrderStatus.REFUNDED]: 40,
  [OrderStatus.COMPLETED]: 50,
  [OrderStatus.CANCELLED_BY_USER]: 60,
  [OrderStatus.CANCELLED_BY_BUSINESS]: 61,
  [OrderStatus.CANCELLED_BY_DELIVERY]: 62,
  [OrderStatus.FAILED]: 70,
};

// Definimos la interfaz del filtro para que TypeScript no se queje
export interface ISimplifiedFilter {
  label: string;
  statuses: OrderStatus[];
  condition?: (order: IOrderShortDto) => boolean;
}

export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Todos",
    statuses: [], // Se maneja por lógica de "mostrar todo"
  },
  {
    label: "Pendientes",
    statuses: [
      OrderStatus.PENDING,
      OrderStatus.WAITING_FOR_PAYMENT,
      OrderStatus.PENDING_CONFIRMATION
    ],
    // Simplificamos la condición: Si es transferencia y está en estado inicial, es pendiente.
    // El DTO corto nos obliga a confiar más en el status general.
    condition: (order: IOrderShortDto) => 
      order.status === OrderStatus.PENDING || 
      order.status === OrderStatus.WAITING_FOR_PAYMENT ||
      order.status === OrderStatus.PENDING_CONFIRMATION
  },
  {
    label: "En curso",
    statuses: [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_CUSTOMER_PICKUP,
      OrderStatus.READY_FOR_DELIVERY_PICKUP,
      OrderStatus.DELIVERY_PENDING,
      OrderStatus.DELIVERY_ASSIGNED,
      OrderStatus.DELIVERY_ACCEPTED,
      OrderStatus.OUT_FOR_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERY_REASSIGNING,
    ],
  },
  {
    label: "Completados",
    statuses: [
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
    ],
  },
  {
    label: "Cancelados",
    statuses: [
      OrderStatus.REJECTED_BY_BUSINESS,
      OrderStatus.DELIVERY_REJECTED,
      OrderStatus.DELIVERY_FAILED,
      OrderStatus.RETURNED,
      OrderStatus.REFUNDED,
      OrderStatus.CANCELLED_BY_USER,
      OrderStatus.CANCELLED_BY_BUSINESS,
      OrderStatus.CANCELLED_BY_DELIVERY,
      OrderStatus.FAILED,
    ],
  },
];