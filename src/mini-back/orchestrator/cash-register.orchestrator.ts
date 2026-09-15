import { db } from "../infrastructure/dexie/db";
import { financialMovementOrchestrator } from "./financial-movement-orchestrator";
import { ICashRegisterTurnService } from "../core/cash-register-core/public/cash-register-turn-service.interface";
import { CashRegisterTurnDexieRepository } from "../infrastructure/dexie/repositories/cash-register/cash-register-turn-dexie.repository";
import {
  CashRegisterTurn,
  CashRegisterTurnServicePublic,
  CloseCashRegisterTurnInput,
  HistoryFiltersInput,
  InitializeCashRegisterTurnInput,
  OpenCashRegisterTurnInput,
} from "../core/cash-register-core/public";
import { CashRegisterDexieRepository } from "../infrastructure/dexie/repositories/cash-register/cash-register-dexie.repository";
import { TreasuryAccountOrchestrator } from "./treasury-account/treasury-account-orchestrator";

class CashRegisterTurnOrchestrator {
  private readonly CashRegisterTurnService: ICashRegisterTurnService;
  private readonly treasuryAccountOrchestrator: TreasuryAccountOrchestrator;

  constructor() {
    // 💡 Inyección de Infraestructura en los Puertos del Core
    const cashRegisterTurnRepo = new CashRegisterTurnDexieRepository(db);
    const cashRegisterRepo = new CashRegisterDexieRepository();

    this.treasuryAccountOrchestrator = new TreasuryAccountOrchestrator();
    this.CashRegisterTurnService = CashRegisterTurnServicePublic(
      cashRegisterTurnRepo,
      cashRegisterRepo,
    );
  }

  // ==========================================================================
  // FLUJOS DE CAJA
  // ==========================================================================

  async initializeCashRegisterTurn(
    input: InitializeCashRegisterTurnInput,
  ): Promise<CashRegisterTurn> {
    return this.CashRegisterTurnService.initialize(input);
  }

  async getCashTurn(businessId: string): Promise<{
    idTemp: string;
    treasuryAccountId: string;
    cashRegisterId: string;
  }> {
    return this.CashRegisterTurnService.getCashTurn(businessId);
  }

  async openCashRegisterTurn(
    input: OpenCashRegisterTurnInput,
  ): Promise<CashRegisterTurn> {
    return this.CashRegisterTurnService.open(input);
  }

  async closeCashRegisterTurn(
    input: CloseCashRegisterTurnInput,
  ): Promise<CashRegisterTurn | null> {
    const activeTurn = await this.CashRegisterTurnService.getCashTurn(
      input.businessId,
    );

    const treasuryAccount =
      await this.treasuryAccountOrchestrator.recalculateBalance(
        input.businessId,
        activeTurn.treasuryAccountId,
      );

    return this.CashRegisterTurnService.close(
      input,
      treasuryAccount.currentBalance,
    );
  }

  async historyCashRegiter(
    filter: HistoryFiltersInput,
  ): Promise<CashRegisterTurn[]> {
    return await this.CashRegisterTurnService.historyCashRegiter(filter);
  }

  async reopenCashRegisterTurn(
    businessId: string,
    turnId: string,
  ): Promise<CashRegisterTurn> {
    return this.CashRegisterTurnService.reopen(businessId, turnId);
  }
}

export const cashRegisterTurnOrchestrator = new CashRegisterTurnOrchestrator();
