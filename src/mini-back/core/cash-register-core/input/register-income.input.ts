import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface RegisterIncomeInput {
  businessId: string;

  userId: string;

  approvedByUserId: string;
  clientMovementId?: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;
  externalReference?: string
}