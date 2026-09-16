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
import { CashRegisterOrchestrator } from "./cash-register/cash-register-orchestrator";

class CashRegisterTurnOrchestrator {
  private readonly CashRegisterTurnService: ICashRegisterTurnService;
  private readonly treasuryAccountOrchestrator: TreasuryAccountOrchestrator;
  private readonly cashRegisterOrchestrator: CashRegisterOrchestrator;

  constructor() {
    // 💡 Inyección de Infraestructura en los Puertos del Core
    const cashRegisterTurnRepo = new CashRegisterTurnDexieRepository(db);
    const cashRegisterRepo = new CashRegisterDexieRepository();

    this.treasuryAccountOrchestrator = new TreasuryAccountOrchestrator();
    this.treasuryAccountOrchestrator = new TreasuryAccountOrchestrator();
    this.cashRegisterOrchestrator = new CashRegisterOrchestrator();
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

  async openCashRegisterTurn(input: {
    businessId: string;
    userId: string;
    idTemp?: string;
    cashRegisterId: string;
    openingAmount: number;
    openingNotes?: string;
    forceOpen?: boolean;
  }): Promise<boolean> {
    const cashRegister = await this.cashRegisterOrchestrator.findById(
      input.cashRegisterId,
      input.businessId,
    );
    if (!cashRegister) {
      throw new Error("La caja registradora seleccionada no existe.");
    }

    const treasuryAccountId = cashRegister.defaultTreasuryAccountId;
    if (!treasuryAccountId) {
      throw new Error(
        "La caja registradora no tiene una cuenta de Tesorería asociada.",
      );
    }

    if (input.forceOpen) {
      await this.CashRegisterTurnService.open({
        businessId: input.businessId,
        userId: input.userId,
        idTemp: input.idTemp,
        cashRegisterId: input.cashRegisterId,
        openingAmount: input.openingAmount,
        openingNotes: input.openingNotes,
        treasuryAccountId,
      });
      return true;
    }

    const treasuryAccount =
      await this.treasuryAccountOrchestrator.recalculateBalance(
        input.businessId,
        treasuryAccountId,
      );

    if (input.openingAmount !== treasuryAccount.currentBalance) {
      return false;
    }

    await this.CashRegisterTurnService.open({ ...input, treasuryAccountId });
    return true;
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
