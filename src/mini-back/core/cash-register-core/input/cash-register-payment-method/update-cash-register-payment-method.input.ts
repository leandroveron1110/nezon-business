import { PaymentMethodTypeFinancial } from "../../domain/payment-summary";

export interface UpdateCashRegisterPaymentMethodInput {
  idTemp: string;

  businessId: string;

  paymentMethod?: PaymentMethodTypeFinancial;

 treasuryAccountIdTemp?: string;

  isActive?: boolean;
}