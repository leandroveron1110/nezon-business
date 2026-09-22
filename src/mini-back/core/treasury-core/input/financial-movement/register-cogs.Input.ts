export interface RegisterCogsInput {
  idTemp: string;
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  cashRegisterTurnId?: string;

  treasuryAccountIdTemp?: string;

  description: string;

  orderId?: string;

  notes?: string;
}
