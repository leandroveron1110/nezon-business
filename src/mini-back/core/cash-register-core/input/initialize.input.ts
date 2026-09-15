export interface InitializeCashRegisterTurnInput {
  businessId: string;
  userId: string;
  treasuryAccountId: string;
  clientTurnId: string;
  openingAmount: number;
  cashRegisterId: string;
  openingNotes?: string;
}