import { PaymentMethodTypeFinancial } from "../public";

// src/core/orders/input/change-order-payment-method.input.ts import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
export interface ChangeOrderPaymentMethodInput {
  orderId: string;
  paymentMethod: PaymentMethodTypeFinancial;
}
