export interface OpenCashRegisterTurnInput {
  businessId: string;
  userId: string;

  treasuryAccountId: string;

  idTemp?: string;

  cashRegisterId: string;

  openingAmount: number;

  openingNotes?: string;
}