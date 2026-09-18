import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterExpenseInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  idTemp?: string;

 treasuryAccountIdTemp: string;

  orderId?: string;

  notes?: string;
  externalReference?: string;
}