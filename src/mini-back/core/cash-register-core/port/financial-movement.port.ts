import { FinancialMovement } from "../domain/financial-movement";

export interface FinancialMovementPort {
  save(movement: FinancialMovement): Promise<FinancialMovement>;

  update(movement: FinancialMovement): Promise<FinancialMovement>;

  findByCashRegister(cashRegisterId: string): Promise<FinancialMovement[]>;
}
