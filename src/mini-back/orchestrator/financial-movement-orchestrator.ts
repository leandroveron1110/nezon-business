import {
  FinancialMovement,
  FinancialMovementServicePublic,
  IFinancialMovementPublicService,
  RegisterCogsInput,
  RegisterExpenseInput,
  RegisterIncomeInput,
  RegisterRefundInput,
  RegisterSaleInput,
} from "../core/treasury-core/public";
import { db } from "../infrastructure/dexie/db";
import { FinancialMovementDexieRepository } from "../infrastructure/dexie/repositories/financial-movement-dexie.repository";

class FinancialMovementOrchetrator {
  private readonly movementService: IFinancialMovementPublicService;

  constructor() {
    const movementRepo = new FinancialMovementDexieRepository(db);
    this.movementService = FinancialMovementServicePublic({
      financialMovement: movementRepo,
    });
  }

  async getActiveTurnTotals(clientTurnId: string) {
    return await this.movementService.getActiveTurnTotals(clientTurnId);
  }

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
    input: Omit<RegisterExpenseInput, "sequence">,
  ): Promise<FinancialMovement> {
    return this.movementService.registerExpense(input);
  }

  // 4. Ingresos manuales a caja
  async processIncomeMovement(
    input: RegisterIncomeInput,
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

export const financialMovementOrchestrator = new FinancialMovementOrchetrator();
