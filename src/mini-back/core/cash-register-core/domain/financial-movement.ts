import { FinancialMovementStatus, FinancialMovementType, PaymentMethodTypeFinancial } from "./financial-movement-status.enum";

export interface FinancialMovement {
  id: string;

  clientMovementId: string;

  businessId: string;

  userId: string;
  approvedByUserId?: string;

  type: FinancialMovementType;

  status: FinancialMovementStatus;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;

  sequence: number;

  date: Date;

  orderId?: string;

  cashRegisterTurnId: string;

  referenceCashRegisterTurnId?: string;
}