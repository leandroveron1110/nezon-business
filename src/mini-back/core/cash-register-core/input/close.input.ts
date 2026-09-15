export interface CloseCashRegisterTurnInput {
  businessId: string;

  userId: string;

  declaredClosingAmount: number;

  closingNotes?: string;
}