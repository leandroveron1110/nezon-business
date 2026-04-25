import { ALLOWED_TRANSITIONS, IOrderShortDto, OrderStatus, PaymentMethodType, PaymentStatus } from "@/types/order";

export const getOrderPriority = (order: IOrderShortDto): number => {
  // PRIORIDAD 1: ACCIÓN INMEDIATA REQUERIDA (Ojo del dueño)
  const urgentStatuses = [
    OrderStatus.PENDING,                // Pedido nuevo entrando
    OrderStatus.PENDING_CONFIRMATION,   // Esperando que el negocio acepte
    OrderStatus.DELIVERY_FAILED,        // El cadete no pudo entregar (Urgente resolver)
    OrderStatus.FAILED                  // Error general del sistema
  ];
  if (urgentStatuses.includes(order.status)) return 1;

  // PRIORIDAD 2: GESTIÓN DE PAGO (Bloqueante)
  // Si es transferencia y no está confirmado, es prioridad alta para no cocinar al vicio
  // if (
  //   order.orderPaymentMethod === PaymentMethodType.TRANSFER && 
  //   order.paymentStatus !== PaymentStatus.CONFIRMED
  // ) {
  //   return 2;
  // }

  // PRIORIDAD 3: OPERACIÓN ACTIVA (En la cocina / Mostrador)
  const operationalStatuses = [
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY_FOR_CUSTOMER_PICKUP,
    OrderStatus.READY_FOR_DELIVERY_PICKUP,
    OrderStatus.DELIVERY_REASSIGNING
  ];
  if (operationalStatuses.includes(order.status)) return 3;

  // PRIORIDAD 4: EN TRÁNSITO (Ya salió del local)
  const transitStatuses = [
    OrderStatus.DELIVERY_PENDING,
    OrderStatus.DELIVERY_ASSIGNED,
  ];
  if (transitStatuses.includes(order.status)) return 4;

  // PRIORIDAD 5: ARCHIVO / FINALIZADOS (Ya no hay nada que hacer)
  const archivedStatuses = [
    OrderStatus.COMPLETED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED_BY_BUSINESS,
    OrderStatus.REJECTED_BY_BUSINESS,
    OrderStatus.REFUNDED,
    OrderStatus.RETURNED
  ];
  if (archivedStatuses.includes(order.status)) return 5;

  return 6; // Por las dudas
};

// export const filterOrdersByBusinessRules = (order: IOrderShortDto): boolean => {
//   if (order.orderPaymentMethod === PaymentMethodType.CASH) return true;

//   // Usamos un array tipado para la comparación de estados de pago
//   const invalidTransferStatuses: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.REJECTED];
//   return !invalidTransferStatuses.includes(order.paymentStatus);
// };

export const getNextValidStatus = (currentStatus: OrderStatus, targetStatus: OrderStatus): boolean => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};