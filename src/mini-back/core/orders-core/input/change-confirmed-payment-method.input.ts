// src/core/orders/input/change-confirmed-payment-method.input.ts

import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

export interface ChangeConfirmedPaymentMethodInput {
  orderId: string;
  paymentMethod: PaymentMethodTypeFinancial;
  authorizationCode: string;
}