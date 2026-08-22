export enum FinancialMovementStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum FinancialMovementType {
  SALE = "SALE",       // 💵 Entrada de dinero por venta (+ $5.000) -> Afecta Caja
  REFUND = "REFUND",   // 💸 Devolución de dinero al cliente (- $1.000) -> Afecta Caja
  INCOME = "INCOME",   // 📥 Otros ingresos en efectivo (+ $10.000) -> Afecta Caja
  EXPENSE = "EXPENSE", // 📤 Gastos operativos generales / MERMAS (- $3.000) -> Afecta Caja o Ganancia
  MERMAS = "MERMAS",
  COGS = "COGS",       // 📦 Costo de la mercadería vendida (- $2.000) -> NO afecta saldo de Caja
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
