export interface CloseCashRegisterInput {
  businessId: string;

  userId: string;

  declaredClosingAmount: number;

  closingNotes?: string;
}