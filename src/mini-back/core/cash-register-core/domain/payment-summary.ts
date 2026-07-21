import { PaymentMethodTypeFinancial } from "./financial-movement-status.enum";

export interface PaymentSummary {

  paymentMethod: PaymentMethodTypeFinancial;

  income: number;

  expense: number;

  net: number;

}