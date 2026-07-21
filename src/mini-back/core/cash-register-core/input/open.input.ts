export interface OpenCashRegisterInput {
  businessId: string;
  userId: string;

  clientTurnId: string;

  openingAmount: number;

  openingNotes?: string;
}