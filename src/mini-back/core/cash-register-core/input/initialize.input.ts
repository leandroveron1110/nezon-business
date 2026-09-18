export interface InitializeCashRegisterTurnInput {
  businessId: string;
  userId: string;
 treasuryAccountIdTemp: string;
  idTemp: string;
  openingAmount: number;
  cashRegisterId: string;
  openingNotes?: string;
}