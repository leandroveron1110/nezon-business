import { PaymentMethodTypeFinancial } from "../../domain/payment-summary";

export interface UpdateCashRegisterPaymentMethodInput {
  idTemp: string;

  businessId: string;

  paymentMethod?: PaymentMethodTypeFinancial;

  treasuryAccountId?: string;

  isActive?: boolean;
}