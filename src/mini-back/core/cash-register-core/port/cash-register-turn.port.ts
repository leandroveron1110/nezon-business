import { CashRegisterTurn } from "../domain/cash-register-turn";
import { CashRegisterTurnTotals } from "../public";

export interface CashRegisterTurnPort {
  findActive(businessId: string): Promise<CashRegisterTurn | null>;

  findById(id: string): Promise<CashRegisterTurn | null>;

  findByidTemp(idTemp: string): Promise<CashRegisterTurn | null>;

  findActiveByCashRegisterId(businessId: string, cashRegisterId: string): Promise<CashRegisterTurn | null>;

  save(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn>;

  update(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn>;

  close(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn>;

  findByBusinessId(businessId: string): Promise<CashRegisterTurn[]>
}

export interface CashRegisterTurnActiveTurnTotals {
  getActiveTurnTotals(idTemp: string): Promise<CashRegisterTurnTotals>
}