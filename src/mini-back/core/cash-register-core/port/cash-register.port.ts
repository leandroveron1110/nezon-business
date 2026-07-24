import { CashRegister } from "../domain/cash-register";

export interface CashRegisterPort {
  findActive(businessId: string): Promise<CashRegister | null>;

  findById(id: string): Promise<CashRegister | null>;

  findByClientTurnId(clientTurnId: string): Promise<CashRegister | null>;

  save(cashRegister: CashRegister): Promise<CashRegister>;

  update(cashRegister: CashRegister): Promise<CashRegister>;

  close(cashRegister: CashRegister): Promise<CashRegister>;
}