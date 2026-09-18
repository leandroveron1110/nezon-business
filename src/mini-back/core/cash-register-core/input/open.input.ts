export interface OpenCashRegisterTurnInput {
  businessId: string;
  userId: string;

 treasuryAccountIdTemp: string;

  idTemp?: string;

  cashRegisterId: string;

  openingAmount: number;

  openingNotes?: string;
}