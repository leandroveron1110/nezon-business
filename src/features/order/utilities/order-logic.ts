import { OrderStatus, DeliveryStatus, PaymentStatus, canChangeOrderStatus, canChangeDeliveryStatus } from "@/types/order-state-machine";

export interface IOrderMinimal {
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export const getOrderPriority = (order: IOrderMinimal): number => {
  // --- PRIORIDAD 1: ACCIÓN INMEDIATA (Fuego en el local) ---
  
  // 1. Pedido nuevo del sistema (Aún no aceptado por el negocio)
  if (order.status === OrderStatus.PENDING) return 1;

  // 2. Problema logístico (Se pidió cadete y se canceló o falló)
  // Es urgente porque la comida probablemente ya se está haciendo o está lista.
  if (order.deliveryStatus === DeliveryStatus.CANCELLED && order.status !== OrderStatus.COMPLETED) {
    return 1; 
  }

  // --- PRIORIDAD 2: VALIDACIÓN DE RECURSOS (Dinero / Insumos) ---

  // 1. Si el pago falló, hay que avisar al cliente antes de seguir gastando mercadería.
  if (order.paymentStatus === PaymentStatus.REJECTED) return 2;

  // 2. Si es transferencia y aún no se confirmó (Bloqueante para algunos negocios)
  if (order.paymentStatus === PaymentStatus.PENDING && order.status === OrderStatus.CONFIRMED) {
    return 2;
  }

  // --- PRIORIDAD 3: OPERACIÓN ACTIVA (Cocina y Despacho) ---

  // Órdenes que están siendo preparadas o ya están listas en el mostrador.
  const isOperational = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status);
  if (isOperational) return 3;

  // --- PRIORIDAD 4: SEGUIMIENTO (En la calle) ---

  // La orden ya salió (SHIPPED), pero el negocio debe monitorear que llegue a COMPLETED.
  if (order.deliveryStatus === DeliveryStatus.SHIPPED) return 4;
  
  // Se solicitó cadete pero aún no salió.
  if (order.deliveryStatus === DeliveryStatus.REQUESTED) return 4;

  // --- PRIORIDAD 5: ARCHIVO (Finalizados) ---
  
  if (
    order.status === OrderStatus.COMPLETED || 
    order.status === OrderStatus.CANCELLED || 
    order.status === OrderStatus.REJECTED
  ) {
    return 5;
  }

  return 6;
};

/**
 * Ahora necesitamos saber qué hilo queremos mover.
 */
export const isTransitionAllowed = (
  type: 'ORDER' | 'DELIVERY',
  next: any,
  currentOrder: IOrderMinimal
): boolean => {
  if (type === 'ORDER') {
    return canChangeOrderStatus(currentOrder.status, next as OrderStatus);
  }
  
  if (type === 'DELIVERY') {
    return canChangeDeliveryStatus(next as DeliveryStatus, currentOrder);
  }

  return false;
};