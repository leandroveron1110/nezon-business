import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface RegisterSaleInput {
  businessId: string;

  clientMovementId?: string;
  
  userId: string;

  orderId: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;
}