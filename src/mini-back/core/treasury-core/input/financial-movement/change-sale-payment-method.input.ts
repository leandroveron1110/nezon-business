import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

export interface ChangeSalePaymentMethodInput {
  orderId: string;
  paymentMethod: PaymentMethodTypeFinancial;
  treasuryAccountId: string;
}