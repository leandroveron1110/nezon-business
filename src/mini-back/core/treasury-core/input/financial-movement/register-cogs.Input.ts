export interface RegisterCogsInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  idTemp?: string;

  treasuryAccountId?: string;

  description: string;

  orderId?: string;

  notes?: string;
}
