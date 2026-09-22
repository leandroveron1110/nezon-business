import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterExpenseInput {
  idTemp: string;
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  cashRegisterTurnId?: string;

  treasuryAccountIdTemp: string;

  orderId?: string;

  notes?: string;
  externalReference?: string;
}