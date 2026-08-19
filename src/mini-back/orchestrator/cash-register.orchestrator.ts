// Adapters de Infraestructura (Dexie)

// Capa pública del Core de Caja
import {
  CashRegisterServicePublic,
  FinancialMovementServicePublic,
  InitializeCashRegisterInput,
  OpenCashRegisterInput,
  CloseCashRegisterInput,
  RegisterSaleInput,
  RegisterExpenseInput,
  RegisterIncomeInput,
  RegisterRefundInput,
  RegisterCogsInput, // 👈 Importamos el nuevo DTO de COGS
  CashRegister,
  FinancialMovement,
  CashRegisterTotals,
  HistoryFiltersInput,
} from "@/mini-back/core/cash-register-core/public";
import { CashRegisterDexieRepository } from "../infrastructure/dexie/repositories/cash-register-dexie.repository";
import { FinancialMovementDexieRepository } from "../infrastructure/dexie/repositories/financial-movement-dexie.repository";
import { ICashRegisterService } from "../core/cash-register-core/public/cash-register-service.interface";
import { IFinancialMovementPublicService } from "../core/cash-register-core/public/financial-movement-service.interface";
import { db } from "../infrastructure/dexie/db";

class CashRegisterOrchestrator {
  private readonly cashRegisterService: ICashRegisterService;
  private readonly movementService: IFinancialMovementPublicService;

  constructor() {
    // 💡 Inyección de Infraestructura en los Puertos del Core
    const cashRegisterRepo = new CashRegisterDexieRepository(db);
    const movementRepo = new FinancialMovementDexieRepository(db);

    this.cashRegisterService = CashRegisterServicePublic({
      cashRegister: cashRegisterRepo,
      financialMovement: movementRepo,
    });
    this.movementService = FinancialMovementServicePublic({
      cashRegister: cashRegisterRepo,
      financialMovement: movementRepo,
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

  async openCashRegister(input: OpenCashRegisterInput): Promise<CashRegister> {
    return this.cashRegisterService.open(input);
  }

  async closeCashRegister(
    input: CloseCashRegisterInput,
  ): Promise<CashRegister | null> {
    const closedRegister = await this.cashRegisterService.close(input);

    // 💡 REACCIÓN TÁCTICA DE ORQUESTATOR:
    // Al cerrar la caja, podríamos gatillar eventos secundarios (ej: notificar a SyncQueueWorker)
    return closedRegister;
  }

  async historyCashRegiter(
    filter: HistoryFiltersInput,
  ): Promise<CashRegister[]> {
    return await this.cashRegisterService.historyCashRegiter(filter);
  }

  async getActiveTurnTotals(businessId: string): Promise<CashRegisterTotals> {
    return await this.cashRegisterService.getActiveTurnTotals(businessId);
  }

  async reopenCashRegister(
    businessId: string,
    turnId: string,
  ): Promise<CashRegister> {
    return this.cashRegisterService.reopen(businessId, turnId);
  }

  // ==========================================================================
  // FLUJOS DE MOVIMIENTOS FINANCIEROS Y CONTABLES
  // ==========================================================================

  // 1. Cobro efectivo/tarjeta
  async processSaleMovement(
    input: Omit<RegisterSaleInput, "sequence" | "clientMovementId">,
  ): Promise<FinancialMovement> {
    try {
      return await this.movementService.registerSale(input);
    } catch (error) {
      console.error("🚨 Falló el movimiento de venta:", error);
      throw error;
    }
  }

  // 2. Costo de Mercadería Vendida (Contable - No afecta saldo de caja)
  async processCogsMovement(
    input: RegisterCogsInput,
  ): Promise<FinancialMovement> {
    try {
      return await this.movementService.registerCogs(input);
    } catch (error) {
      console.error("🚨 Falló el registro de COGS:", error);
      throw error;
    }
  }

  async processMermaMovement(
    input: RegisterCogsInput,
  ): Promise<FinancialMovement> {
    try {
      return await this.movementService.registerMerma(input);
    } catch (error) {
      console.error("🚨 Falló el registro de Merma:", error);
      throw error;
    }
  }

  // 3. Gastos operativos / Mermas por cancelaciones
  async processExpenseMovement(
    input: Omit<RegisterExpenseInput, "sequence" | "clientTurnId">,
  ): Promise<FinancialMovement> {
    return this.movementService.registerExpense(input);
  }

  // 4. Ingresos manuales a caja
  async processIncomeMovement(
    input: Omit<RegisterIncomeInput, "clientTurnId">,
  ): Promise<FinancialMovement> {
    return this.movementService.registerIncome(input);
  }

  // 5. Reembolso / Devolución de dinero
  async processRefundMovement(
    input: RegisterRefundInput,
  ): Promise<FinancialMovement> {
    return this.movementService.registerRefund(input);
  }
}

export const cashRegisterOrchestrator = new CashRegisterOrchestrator();
