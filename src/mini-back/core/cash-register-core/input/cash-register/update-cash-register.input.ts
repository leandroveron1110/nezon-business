// input/update-cash-register.input.ts
export type UpdateCashRegisterInput = {
  idTemp: string;
  businessId: string;
  name: string;
  defaultTreasuryAccountId?: string;
};