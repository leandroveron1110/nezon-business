import { ChangeSalePaymentMethodInput } from "../core/treasury-core/input/financial-movement/change-sale-payment-method.input";
import { RegisterInternalTransferInput } from "../core/treasury-core/input/financial-movement/register-internal-transfer.input";
import {
  FinancialMovement,
  FinancialMovementServicePublic,
  IFinancialMovementPublicService,
  RegisterCogsInput,
  RegisterExpenseInput,
  RegisterIncomeInput,
  RegisterMermaInput,
  RegisterRefundInput,
  RegisterSaleInput,
} from "../core/treasury-core/public";
import { db } from "../infrastructure/dexie/db";
import { FinancialMovementDexieRepository } from "../infrastructure/dexie/repositories/admin/financial-movement/financial-movement-dexie.repository";

class FinancialMovementOrchetrator {
  private readonly movementService: IFinancialMovementPublicService;

  constructor() {
    const movementRepo = new FinancialMovementDexieRepository(db);
    this.movementService = FinancialMovementServicePublic({
      financialMovement: movementRepo,
    });
  }

  // En TreasuryAccountOrchestrator

  async registerInternalTransfer(
    input: RegisterInternalTransferInput,
  ): Promise<FinancialMovement[]> {
    // 1. Registrar los movimientos financieros (egreso de origen e ingreso a destino)
    const movements =
      await this.movementService.registerInternalTransfer(input);
    return movements;
  }

  async getActiveTurnTotals(idTemp: string) {
    return await this.movementService.getActiveTurnTotals(idTemp);
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
    input: RegisterMermaInput,
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

  async changeSalePaymentMethod(
    input: ChangeSalePaymentMethodInput,
  ): Promise<FinancialMovement> {
    return this.movementService.changeSalePaymentMethod(input);
  }
}

export const financialMovementOrchestrator = new FinancialMovementOrchetrator();
