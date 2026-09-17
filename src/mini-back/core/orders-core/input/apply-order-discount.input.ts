// core/orders/input/apply-order-discount.input.ts

import { OrderDiscountType } from "../domain/order.entity";

export interface ApplyOrderDiscountInput {
  orderId: string;
  type: OrderDiscountType;
  value: number;
}