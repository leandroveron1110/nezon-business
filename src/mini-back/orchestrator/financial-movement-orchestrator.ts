// src/mini-back/orchestrator/financial-movement-orchestrator.ts

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
import { businessCapabilities } from "../shared/business-capabilities/business-capabilities";

/**
 * Orquestador encargado de coordinar
 * Financial Movements.
 *
 * Financial Movements es independiente de Treasury.
 *
 * Puede registrar:
 *
 * - Ventas
 * - Ingresos
 * - Gastos
 * - Reembolsos
 * - COGS
 * - Mermas
 * - Otros movimientos
 *
 * sin necesidad de conocer dónde se encuentra
 * físicamente el dinero.
 *
 * Treasury puede utilizar este Orchestrator cuando
 * necesita registrar movimientos relacionados
 * con cuentas de Treasury.
 */
class FinancialMovementOrchetrator {
  private readonly movementService: IFinancialMovementPublicService;

  constructor() {
    const movementRepo = new FinancialMovementDexieRepository(db);

    this.movementService = FinancialMovementServicePublic({
      financialMovement: movementRepo,
    });
  }

  /**
   * Determina si el negocio tiene habilitado
   * el Core de Financial Movements.
   */
  private canUseFinancialMovements(businessId: string): boolean {
    return businessCapabilities.canUse(businessId, "FINANCIAL_MOVEMENTS");
  }

  /**
   * Obtiene los movimientos financieros
   * pertenecientes a un negocio.
   */
  async getByBusinessId(businessId: string): Promise<FinancialMovement[]> {
    if (!this.canUseFinancialMovements(businessId)) {
      return [];
    }

    return this.movementService.getByBusinessId(businessId);
  }

  /**
   * Registra una transferencia interna.
   *
   * Este método pertenece a Financial Movements.
   *
   * Treasury puede utilizarlo para representar
   * una transferencia entre cuentas, pero el
   * movimiento en sí sigue perteneciendo a este Core.
   */
  async registerInternalTransfer(
    input: RegisterInternalTransferInput,
  ): Promise<FinancialMovement[]> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      return [];
    }

    return this.movementService.registerInternalTransfer(input);
  }

  /**
   * Obtiene los totales financieros asociados
   * al turno activo.
   *
   * NOTA:
   * Este método actualmente recibe solamente
   * idTemp porque así está definida la interfaz
   * existente.
   *
   * Si posteriormente necesitamos aplicar
   * BusinessCapabilities también a esta lectura,
   * convendrá agregar businessId al input.
   */
  async getActiveTurnTotals(idTemp: string) {
    return this.movementService.getActiveTurnTotals(idTemp);
  }

  /**
   * Registra el movimiento financiero
   * correspondiente a una venta.
   */
  async processSaleMovement(
    input: Omit<RegisterSaleInput, "sequence" | "clientMovementId">,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerSale(input);
  }

  /**
   * Registra COGS
   * (Costo de Mercadería Vendida).
   *
   * El significado económico pertenece a
   * Financial Movements.
   */
  async processCogsMovement(
    input: RegisterCogsInput,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerCogs(input);
  }

  /**
   * Registra una merma.
   */
  async processMermaMovement(
    input: RegisterMermaInput,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerMerma(input);
  }

  /**
   * Registra un gasto operativo.
   */
  async processExpenseMovement(
    input: Omit<RegisterExpenseInput, "sequence">,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerExpense(input);
  }

  /**
   * Registra un ingreso manual.
   */
  async processIncomeMovement(
    input: RegisterIncomeInput,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerIncome(input);
  }

  /**
   * Registra un reembolso/devolución.
   */
  async processRefundMovement(
    input: RegisterRefundInput,
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.registerRefund(input);
  }

  /**
   * Cambia el método de pago de una venta
   * y registra el movimiento correspondiente.
   */
  async changeSalePaymentMethod(
    input: ChangeSalePaymentMethodInput & { businessId: string },
  ): Promise<FinancialMovement> {
    if (!this.canUseFinancialMovements(input.businessId)) {
      throw new Error("Financial movements are not enabled for this business");
    }

    return this.movementService.changeSalePaymentMethod(input);
  }
}

export const financialMovementOrchestrator = new FinancialMovementOrchetrator();
