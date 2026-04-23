import { IOrder } from "@/features/order/types/order";
import { OrderStatus, PaymentMethodType, PaymentStatus } from "@/types/order";

export const getOrderPriority = (order: IOrder): number => {
  // 1. Lo más urgente: Pendientes
  if (order.status === OrderStatus.PENDING) return 1;
  
  // 2. Pagos en proceso
  if (order.paymentStatus === PaymentStatus.IN_PROGRESS) return 2;

  // 3. En preparación o listos
  // Definimos el array con el tipo explícito para que TS no chille
  const activeStatuses: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.PREPARING];
  if (activeStatuses.includes(order.status)) return 3;

  // 4. Finalizados o entregados
  const finishedStatuses: OrderStatus[] = [OrderStatus.COMPLETED, OrderStatus.DELIVERED];
  if (finishedStatuses.includes(order.status)) return 4;

  return 5;
};

export const filterOrdersByBusinessRules = (order: IOrder): boolean => {
  if (order.orderPaymentMethod === PaymentMethodType.CASH) return true;

  // Usamos un array tipado para la comparación de estados de pago
  const invalidTransferStatuses: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.REJECTED];
  return !invalidTransferStatuses.includes(order.paymentStatus);
};