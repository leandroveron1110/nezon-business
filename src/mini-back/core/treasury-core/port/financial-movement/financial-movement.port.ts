import { FinancialMovement } from "../../domain/financial-movement/financial-movement";
import { TreasuryAccount } from "../../domain/treasury-account/treasury-account";

export interface FinancialMovementPort {
  save(movement: FinancialMovement): Promise<FinancialMovement>;

  saveMany(movements: FinancialMovement[]): Promise<FinancialMovement[]>;

  update(movement: FinancialMovement): Promise<FinancialMovement>;

  findByCashRegister(cashRegisterId: string): Promise<FinancialMovement[]>;

  findByOrderId(orderId: string): Promise<FinancialMovement | null>;

  findByBusinessId(businessId: string): Promise<FinancialMovement[]>;

  // 💡 Necesarios para evitar duplicados en sincronización y reportes del día
  findByClientMovementId(
    clientMovementId: string,
  ): Promise<FinancialMovement | null>;
  findByBusinessAndDateRange(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<FinancialMovement[]>;

  /**
   * Recalcula el saldo actual de una cuenta de tesorería
   * a partir de todos los movimientos financieros asociados.
   *
   * FinancialMovement representa el historial de operaciones.
   * currentBalance es un saldo materializado derivado de ese historial.
   *
   * Este método permite reconstruir o corregir el saldo materializado
   * sin modificar manualmente el balance.
   */
  calculateBalanceByTreasuryAccount(
    accountId: string,
    businessId: string,
  ): Promise<number>;
}
