import { PaymentMethodTypeFinancial } from "../../domain/financial-movement/financial-movement-status.enum";

export interface RegisterRefundInput {
  businessId: string;

  idTemp: string;
  
  clientMovementId?: string;
  
  userId: string;

  orderId: string;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;
  
  referenceCashRegisterTurnId?: string;

  cashRegisterTurnId?: string;

 treasuryAccountIdTemp: string;
}