export enum FinancialMovementStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum FinancialMovementType {
  /**
   * Entrada de dinero producida por una venta.
   *
   * Afecta positivamente la TreasuryAccount asociada.
   */
  SALE = "SALE",

  /**
   * Devolución de dinero al cliente.
   *
   * Afecta negativamente la TreasuryAccount asociada.
   */
  REFUND = "REFUND",

  /**
   * Ingreso de dinero que no corresponde directamente
   * a una venta.
   *
   * Ejemplo:
   * - Aporte de capital
   * - Ingreso extraordinario
   *
   * Afecta positivamente la TreasuryAccount asociada.
   */
  INCOME = "INCOME",

  /**
   * Salida de dinero por un gasto operativo.
   *
   * Afecta negativamente la TreasuryAccount asociada.
   */
  EXPENSE = "EXPENSE",

  /**
   * Pérdida real de dinero.
   *
   * Afecta negativamente la TreasuryAccount asociada.
   */
  MERMAS = "MERMAS",

  /**
   * Costo económico de la mercadería vendida.
   *
   * No representa una nueva salida de dinero y no
   * afecta directamente ninguna TreasuryAccount.
   */
  COGS = "COGS",

  /**
   * Movimiento de dinero entre dos cuentas de tesorería
   * del mismo negocio.
   *
   * El dinero sale de una TreasuryAccount y entra
   * en otra.
   *
   * No representa un ingreso ni un gasto real del negocio.
   *
   * Ejemplo:
   * Mercado Pago -> Caja Mostrador
   * $50.000
   */
  INTERNAL_TRANSFER = "INTERNAL_TRANSFER",

  INTERNAL_TRANSFER_OUT = "INTERNAL_TRANSFER_OUT",

  INTERNAL_TRANSFER_IN = "INTERNAL_TRANSFER_IN",
}

export enum PaymentMethodTypeFinancial {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QR = "QR",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}
