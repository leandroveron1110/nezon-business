export interface OpenCashRegisterTurnInput {
  businessId: string;
  userId: string;

  treasuryAccountId: string;

  clientTurnId?: string;

  cashRegisterId: string;

  openingAmount: number;

  openingNotes?: string;
}