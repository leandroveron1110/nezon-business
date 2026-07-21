export interface InitializeCashRegisterInput {
  businessId: string;
  userId: string;
  clientTurnId: string;
  openingAmount: number;
  openingNotes?: string;
}