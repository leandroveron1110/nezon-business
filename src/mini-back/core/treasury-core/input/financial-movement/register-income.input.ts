import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterIncomeInput {
  idTemp: string;
  businessId: string;

  userId: string;

  approvedByUserId: string;
  clientMovementId?: string;

  amount: number;

  cashRegisterTurnId?: string;

  treasuryAccountIdTemp: string;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;
  externalReference?: string;
}
