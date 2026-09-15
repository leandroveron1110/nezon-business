export enum PaymentMethodTypeFinancial {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QR = "QR",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}
export interface PaymentSummary {

  paymentMethod: PaymentMethodTypeFinancial;

  income: number;

  expense: number;

  net: number;

}