export enum FinancialMovementStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum FinancialMovementType {
  SALE = "SALE",
  REFUND = "REFUND",
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

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
