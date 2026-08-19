import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface RegisterExpenseInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  orderId?: string;

  notes?: string;
  externalReference?: string;
}