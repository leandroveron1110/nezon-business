export interface InitializeCashRegisterTurnInput {
  businessId: string;
  userId: string;
  treasuryAccountId: string;
  idTemp: string;
  openingAmount: number;
  cashRegisterId: string;
  openingNotes?: string;
}