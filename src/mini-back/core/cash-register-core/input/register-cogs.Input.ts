import { PaymentMethodTypeFinancial } from "../public";

export interface RegisterCogsInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  description: string;

  orderId?: string;

  notes?: string;
}
