// core/orders/input/create-order.input.ts

import {
  OrderDiscountType,
  OrderItem,
  Origin,
  PaymentMethodTypeFinancial,
} from "../domain/order.entity";

export interface CreateOrderInput {
  idTemp: string;

  businessId: string;

  origin: Origin;

  customerName?: string;

  customerPhone?: string;

  customerAddress?: string;

  customerObservations?: string;

  items: OrderItem[];

  subtotal: number;

  /**
   * Descuento inicial de la orden.
   *
   * null/undefined = sin descuento.
   */
  discountType?: OrderDiscountType | null;

  /**
   * Valor del descuento.
   *
   * PERCENTAGE:
   * 100 = 100%
   *
   * FIXED:
   * 2500 = $2500
   */
  discountValue?: number | null;

  /**
   * Este valor NO debería venir del exterior.
   *
   * El Core lo calcula.
   */

  total: number;

  deliveryType: "DELIVERY" | "PICKUP";

  deliveryProvider: "PLATFORM" | "INTERNAL";

  totalDeliveryCost: number;

  deliveryQuotationStatus?: any;

  orderPaymentMethod: PaymentMethodTypeFinancial;

  deliveryStatus?: any;

  instantPrepare: boolean;

  scheduledAt?: Date | null;
}
