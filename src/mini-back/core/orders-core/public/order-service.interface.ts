// core/public/order-service.interface.ts

import { Order } from "../domain/order.entity";
import { ApplyOrderDiscountInput } from "../input/apply-order-discount.input";
import { ChangeConfirmedPaymentMethodInput } from "../input/change-confirmed-payment-method.input";
import { ChangeOrderPaymentMethodInput } from "../input/change-order-payment-method.input";
import { CreateOrderInput } from "../input/create-order.input";
import { MutateOrderStateInput } from "../input/mutate-order.input";
import { UpdateOrderStatusInput } from "../input/update-order-status.input";
import { UpdateOrderInput } from "../input/update-order.input";

export interface IOrderPublicService {
  /**
   * Punto de entrada principal para crear órdenes.
   * El Core validará, asignará números y decidirá la prioridad de sincronización.
   */
  createOrder(input: CreateOrderInput): Promise<OrderServiceResponse>;

  updateStatus(input: UpdateOrderStatusInput): Promise<OrderServiceResponse>;

  updateOrder(input: UpdateOrderInput): Promise<OrderServiceResponse>;

  /**
   * Aplica o reemplaza el descuento actual de la orden.
   *
   * El descuento se aplica sobre el subtotal completo
   * de la orden.
   */
  applyDiscount(input: ApplyOrderDiscountInput): Promise<OrderServiceResponse>;

  assignCourierName(idTemp: string, courierName: string): Promise<void>;

  mutateState(input: MutateOrderStateInput): Promise<OrderServiceResponse>;

  /**
   * Permite al orquestador marcar una orden como sincronizada
   * una vez que el proceso de red tuvo éxito.
   */
  confirmCloudSync(idTemp: string, remoteId: string): Promise<void>;

  notifySyncError(idTemp: string, error?: Error): Promise<void>;

  changePaymentMethod(
    input: ChangeOrderPaymentMethodInput,
  ): Promise<OrderServiceResponse>;

  changeConfirmedPaymentMethod(
    input: ChangeConfirmedPaymentMethodInput,
  ): Promise<OrderServiceResponse>;
}

/** Respuesta estandarizada que el Core devuelve al mundo exterior */
export interface OrderServiceResponse {
  success: boolean;
  data?: Order;
  error?: {
    code:
      | "VALIDATION_ERROR"
      | "REPOSITORY_ERROR"
      | "LOGISTICS_ERROR"
      | "INVALID_THREAD"
      | "INVALID_AUTHORIZATION_CODE";
    message: string;
  };
}
