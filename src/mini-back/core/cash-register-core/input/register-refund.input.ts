import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface RegisterRefundInput {
  businessId: string;

  userId: string;
  

  clientMovementId: string;

  orderId: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;

  referenceCashRegisterTurnId?: string;
}