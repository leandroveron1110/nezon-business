export interface RegisterMermaInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  clientTurnId?: string;

  treasuryAccountId: string;

  description: string;

  orderId?: string;

  notes?: string;
}
