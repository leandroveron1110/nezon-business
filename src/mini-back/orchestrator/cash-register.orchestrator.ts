// Adapters de Infraestructura (Dexie)

// Capa pública del Core de Caja
import {
  CashRegisterServicePublic,
  InitializeCashRegisterInput,
  OpenCashRegisterInput,
  CloseCashRegisterInput,
  CashRegister,
  CashRegisterTotals,
  HistoryFiltersInput,
} from "@/mini-back/core/cash-register-core/public";
import { CashRegisterDexieRepository } from "../infrastructure/dexie/repositories/cash-register-dexie.repository";
import { FinancialMovementDexieRepository } from "../infrastructure/dexie/repositories/financial-movement-dexie.repository";
import { ICashRegisterService } from "../core/cash-register-core/public/cash-register-service.interface";
import { db } from "../infrastructure/dexie/db";
import { financialMovementOrchestrator } from "./financial-movement-orchestrator";

class CashRegisterOrchestrator {
  private readonly cashRegisterService: ICashRegisterService;

  constructor() {
    // 💡 Inyección de Infraestructura en los Puertos del Core
    const cashRegisterRepo = new CashRegisterDexieRepository(db);

    this.cashRegisterService = CashRegisterServicePublic({
      cashRegister: cashRegisterRepo,
    });
  }

  // ==========================================================================
  // FLUJOS DE CAJA
  // ==========================================================================

  async initializeCashRegister(
    input: InitializeCashRegisterInput,
  ): Promise<CashRegister> {
    return this.cashRegisterService.initialize(input);
  }

  async getCashTurn(businessId: string): Promise<{ clientTurnId?: string }> {
    return this.cashRegisterService.getCashTurn(businessId);
  }

  async openCashRegister(input: OpenCashRegisterInput): Promise<CashRegister> {
    return this.cashRegisterService.open(input);
  }

  async closeCashRegister(
    input: CloseCashRegisterInput,
  ): Promise<CashRegister | null> {
    const closedRegister = await this.cashRegisterService.close(input, {
      getActiveTurnTotals(clientTurnId) {
        return financialMovementOrchestrator.getActiveTurnTotals(clientTurnId);
      },
    });

    // 💡 REACCIÓN TÁCTICA DE ORQUESTATOR:
    // Al cerrar la caja, podríamos gatillar eventos secundarios (ej: notificar a SyncQueueWorker)
    return closedRegister;
  }

  async historyCashRegiter(
    filter: HistoryFiltersInput,
  ): Promise<CashRegister[]> {
    return await this.cashRegisterService.historyCashRegiter(filter);
  }

  async reopenCashRegister(
    businessId: string,
    turnId: string,
  ): Promise<CashRegister> {
    return this.cashRegisterService.reopen(businessId, turnId);
  }
}

export const cashRegisterOrchestrator = new CashRegisterOrchestrator();
