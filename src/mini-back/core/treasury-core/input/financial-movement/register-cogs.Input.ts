export interface RegisterCogsInput {
  businessId: string;

  userId: string;
  approvedByUserId: string;

  clientMovementId?: string;

  amount: number;

  clientTurnId?: string;

  description: string;

  orderId?: string;

  notes?: string;
}
