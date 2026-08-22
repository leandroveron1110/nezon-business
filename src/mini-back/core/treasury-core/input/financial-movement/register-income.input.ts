import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterIncomeInput {
  businessId: string;

  userId: string;

  approvedByUserId: string;
  clientMovementId?: string;

  amount: number;

  clientTurnId?: string;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;
  externalReference?: string
}