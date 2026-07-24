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
  CashRegister,
  FinancialMovement,
  CashRegisterTotals,
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
    // Al cerrar la caja, podríamos gatillar eventos secundarios (ej: notificar a SyncQueueWorker
    // o congelar la interfaz del POS), manteniendo la lógica decoupled.

    return closedRegister;
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
  // FLUJOS DE MOVIMIENTOS FINANCIEROS
  // ==========================================================================
  async processSaleMovement(
    input: Omit<RegisterSaleInput, "sequence" | "clientMovementId">,
  ) {
    console.group(
      "💰 [CashRegisterOrchestrator] Procesando movimiento de venta",
    );
    console.log("📥 Payload recibido:", input);

    try {
      // Delegamos al Servicio del Core la venta.
      // El Core buscará la caja activa y llamará al Repository Adapter.
      const result = await this.movementService.registerSale({
        businessId: input.businessId,
        userId: input.userId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        description: input.description,
        orderId: input.orderId,
        notes: input.notes,
        externalReference: input.externalReference,
      });

      console.log("✅ Movimiento procesado e impactado con éxito:", result);
      console.groupEnd();

      return result;
    } catch (error) {
      console.error("🚨 Falló el movimiento de venta:", error);
      console.groupEnd();
      throw error;
    }
  }

  async processExpenseMovement(
    input: Omit<RegisterExpenseInput, "sequence" | "clientTurnId">,
  ): Promise<FinancialMovement> {
    return this.movementService.registerExpense(input);
  }

  async processIncomeMovement(
    input: Omit<RegisterIncomeInput, "clientTurnId" >,
  ): Promise<FinancialMovement> {
    return this.movementService.registerIncome(input);
  }

  async processRefundMovement(
    input: RegisterRefundInput,
  ): Promise<FinancialMovement> {
    return this.movementService.registerRefund(input);
  }
}

export const cashRegisterOrchestrator = new CashRegisterOrchestrator();
