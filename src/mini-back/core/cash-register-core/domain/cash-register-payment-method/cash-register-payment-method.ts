export enum PaymentMethodTypeFinancial {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QR = "QR",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}

export interface CashRegisterPaymentMethod {
  idTemp: string;
  id: string | null;

  businessId: string;

  cashRegisterId: string;

  paymentMethod: PaymentMethodTypeFinancial;

 treasuryAccountIdTemp: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}