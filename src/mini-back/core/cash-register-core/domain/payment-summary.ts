export enum PaymentMethodTypeFinancial {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QR = "QR",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  MERCADO_PAGO = "MERCADO_PAGO",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}
export interface PaymentSummary {

  paymentMethod: PaymentMethodTypeFinancial;

  income: number;

  expense: number;

  net: number;

}