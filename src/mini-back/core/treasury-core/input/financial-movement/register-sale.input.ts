import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterSaleInput {
  idTemp: string;
  businessId: string;

  clientMovementId?: string;

  userId: string;

  orderId: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;

  cashRegisterTurnId?: string;

  treasuryAccountIdTemp: string;
}
