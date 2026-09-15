import { PaymentMethodTypeFinancial } from "../../domain/payment-summary";

export interface CreateCashRegisterPaymentMethodInput {
  idTemp: string;

  businessId: string;

  cashRegisterId: string;

  paymentMethod: PaymentMethodTypeFinancial;

  treasuryAccountId: string;
}