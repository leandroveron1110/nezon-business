import { DeliveryStatus } from "../domain/order-state-machine";
import { OrderItem } from "../domain/order.entity";

export interface CreateOrderInput {
  idTemp: string; // El front genera un UUID v4 y lo envía para mantener la trazabilidad local
  customerName?: string;

  businessId: string;

  customerPhone?: string;

  customerAddress?: string;

  customerObservations?: string;

  instantPrepare: boolean;

  origin: 'APP' | 'BUSINESS';

  items: OrderItem[];

  deliveryType: "DELIVERY" | "PICKUP";
  deliveryStatus: DeliveryStatus;

  deliveryProvider: "PLATFORM" | "INTERNAL";

  orderPaymentMethod:
    | "CASH"
    | "TRANSFER"
    | "QR"
    | "DELIVERY";

  total: number;

  totalDeliveryCost: number;
}