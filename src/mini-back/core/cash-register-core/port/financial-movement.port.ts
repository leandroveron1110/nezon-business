import { FinancialMovement } from "../domain/financial-movement";

export interface FinancialMovementPort {
  save(movement: FinancialMovement): Promise<FinancialMovement>;

  update(movement: FinancialMovement): Promise<FinancialMovement>;

  findByCashRegister(cashRegisterId: string): Promise<FinancialMovement[]>;

  // 💡 Necesarios para evitar duplicados en sincronización y reportes del día
  findByClientMovementId(clientMovementId: string): Promise<FinancialMovement | null>;
  findByBusinessAndDateRange(businessId: string, from: Date, to: Date): Promise<FinancialMovement[]>;
}
