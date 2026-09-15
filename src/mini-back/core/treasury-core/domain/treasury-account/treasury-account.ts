// treasury-core/domain/treasury-account/treasury-account.ts

export type TreasuryAccountType =
  | "CASH"
  | "BANK"
  | "DIGITAL_WALLET"
  | "SAFE_BOX";

export interface TreasuryAccount {
  id?: string;

  idTemp: string;

  businessId: string;

  /**
   * Nombre identificable de la cuenta.
   *
   * Ej:
   * - Efectivo
   * - Mercado Pago
   * - Banco Galicia
   * - Caja Fuerte
   */
  name: string;

  /**
   * Tipo de cuenta dentro de la tesorería.
   */
  type: TreasuryAccountType;

  /**
   * Moneda utilizada por la cuenta.
   *
   * Ej:
   * - ARS
   * - USD
   */
  currency: string;

  /**
   * Saldo actual materializado.
   *
   * FinancialMovement representa el historial
   * de los movimientos.
   *
   * currentBalance permite consultar rápidamente
   * el saldo actual de la cuenta.
   */
  currentBalance: number;

  /**
   * Permite conservar el historial de la cuenta
   * sin permitir nuevos movimientos sobre ella.
   */
  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}