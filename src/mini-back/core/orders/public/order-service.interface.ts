// core/public/order-service.interface.ts

import { Order } from "../domain/order.entity";
import { CreateOrderInput } from "../input/create-order.input";
import { UpdateOrderStatusInput } from "../input/update-order-status.input";


export interface IOrderPublicService {
  /** 
   * Punto de entrada principal para crear órdenes. 
   * El Core validará, asignará números y decidirá la prioridad de sincronización.
   */
  createOrder(input: CreateOrderInput): Promise<OrderServiceResponse>;

  updateStatus(input: UpdateOrderStatusInput): Promise<OrderServiceResponse>; // Nuevo

  /** 
   * Permite al orquestador marcar una orden como sincronizada 
   * una vez que el proceso de red tuvo éxito.
   */
  confirmCloudSync(idTemp: string, remoteId: string): Promise<void>;

  notifySyncError(idTemp: string, error: Error): Promise<void>;

  
}

/** Respuesta estandarizada que el Core devuelve al mundo exterior */
export interface OrderServiceResponse {
  success: boolean;
  data?: Order;
  error?: {
    code: 'VALIDATION_ERROR' | 'REPOSITORY_ERROR' | 'LOGISTICS_ERROR';
    message: string;
  };
}