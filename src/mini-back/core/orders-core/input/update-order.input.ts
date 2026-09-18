import { OrderItem, PaymentMethodTypeFinancial } from "../domain/order.entity";

export interface UpdateOrderInput {
  idTemp: string;

  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerObservations?: string;

  items: OrderItem[];

  subtotal: number;

  discountType?: "PERCENTAGE" | "FIXED" | null;
  discountValue?: number | null;

  deliveryType: "DELIVERY" | "PICKUP";
  deliveryProvider: "PLATFORM" | "INTERNAL";
  totalDeliveryCost: number;

  deliveryQuotationStatus?:
    | "PENDING"
    | "WAITING_BASE"
    | "RESOLVED"
    | "MANUAL"
    | "ERROR";

  orderPaymentMethod: PaymentMethodTypeFinancial;

  scheduledAt?: Date | null;
}
