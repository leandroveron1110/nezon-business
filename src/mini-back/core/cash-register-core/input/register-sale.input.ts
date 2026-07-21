import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface RegisterSaleInput {
  businessId: string;

  userId: string;

  clientMovementId: string;

  orderId: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;
}