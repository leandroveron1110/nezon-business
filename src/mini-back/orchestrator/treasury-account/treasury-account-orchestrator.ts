// src/mini-back/orchestrator/treasury-account/treasury-account-orchestrator.ts

import {
  FinancialMovement,
  ITreasuryAccountPublicService,
  TreasuryAccountServicePublic,
} from "@/mini-back/core/treasury-core/public";

import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";

import { CreateTreasuryAccountInput } from "@/mini-back/core/treasury-core/input/treasury-account/create-treasury-account.input";

import { UpdateTreasuryAccountInput } from "@/mini-back/core/treasury-core/input/treasury-account/update-treasury-account.input";

import { db } from "@/mini-back/infrastructure/dexie/db";

import { FinancialMovementDexieRepository } from "@/mini-back/infrastructure/dexie/repositories/admin/financial-movement/financial-movement-dexie.repository";

import { TreasuryAccountDexieRepository } from "@/mini-back/infrastructure/dexie/repositories/admin/treasury/treasury-account.repository";

import { RegisterInternalTransferInput } from "@/mini-back/core/treasury-core/input/financial-movement/register-internal-transfer.input";

import { financialMovementOrchestrator } from "../financial-movement-orchestrator";
import { businessCapabilities } from "@/mini-back/shared/business-capabilities/business-capabilities";

/**
 * Orquestador encargado de coordinar las operaciones
 * relacionadas con las cuentas de tesorería.
 *
 * Treasury y Financial Movements son Cores independientes,
 * pero Treasury puede utilizar Financial Movements para
 * registrar los movimientos que afectan sus cuentas.
 *
 * Relación:
 *
 * Financial Movements
 *        ▲
 *        │ utiliza
 *        │
 *     Treasury
 *
 * Financial Movements puede funcionar sin Treasury.
 * Treasury, en cambio, necesita Financial Movements
 * para registrar correctamente las operaciones que
 * modifican los fondos.
 *
 * El Orchestrator conoce las implementaciones concretas
 * de infraestructura utilizadas por la aplicación.
 *
 * El Business Core no conoce Dexie, IndexedDB, React
 * ni Next.js.
 */
export class TreasuryAccountOrchestrator {
  private readonly treasuryAccountService: ITreasuryAccountPublicService;

  constructor() {
    this.treasuryAccountService = TreasuryAccountServicePublic({
      treasuryAccount: new TreasuryAccountDexieRepository(),

      financialMovement: new FinancialMovementDexieRepository(db),
    });
  }

  /**
   * Determina si el negocio tiene habilitado
   * el Core de Tesorería.
   */
  private canUseTreasury(businessId: string): boolean {
    return businessCapabilities.canUse(businessId, "TREASURY");
  }

  /**
   * Transfiere fondos entre dos cuentas de tesorería.
   *
   * Treasury coordina la operación, pero delega en
   * FinancialMovementOrchestrator el registro de los
   * movimientos financieros.
   *
   * Ejemplo:
   *
   * Caja
   *   - $10.000
   *
   * Banco
   *   + $10.000
   *
   * Si Financial Movements está deshabilitado,
   * no se registran los movimientos y Treasury
   * tampoco recalcula los saldos.
   */
  async transfer(
    input: RegisterInternalTransferInput,
  ): Promise<FinancialMovement[]> {
    /**
     * Primero protegemos la frontera de Treasury.
     */
    if (!this.canUseTreasury(input.businessId)) {
      return [];
    }

    /**
     * Treasury utiliza Financial Movements,
     * pero no implementa directamente esa lógica.
     *
     * FinancialMovementOrchestrator tiene su propia
     * validación de capacidad.
     */
    const movements =
      await financialMovementOrchestrator.registerInternalTransfer(input);

    /**
     * Si Financial Movements no está habilitado,
     * no hubo movimientos que registrar.
     *
     * Por lo tanto, no debemos modificar/recalcular
     * los saldos de Treasury.
     */
    if (movements.length === 0) {
      return [];
    }

    /**
     * Los movimientos ya fueron registrados.
     *
     * Ahora Treasury actualiza los saldos materializados
     * de las cuentas involucradas.
     */
    await this.recalculateBalance(
      input.businessId,
      input.sourceTreasuryAccountId,
    );

    await this.recalculateBalance(
      input.businessId,
      input.destinationTreasuryAccountId,
    );

    return movements;
  }

  /**
   * Crea una nueva cuenta dentro de Treasury.
   *
   * Ejemplos:
   *
   * - Efectivo
   * - Banco Galicia
   * - Mercado Pago
   * - Caja fuerte
   */
  async create(input: CreateTreasuryAccountInput): Promise<TreasuryAccount> {
    return this.treasuryAccountService.create(input);
  }

  /**
   * Actualiza los datos administrativos
   * de una cuenta de Treasury.
   */
  async update(input: UpdateTreasuryAccountInput): Promise<TreasuryAccount> {
    return this.treasuryAccountService.update(input);
  }

  /**
   * Busca una cuenta de Treasury por ID.
   */
  async findById(accountId: string): Promise<TreasuryAccount | null> {
    return this.treasuryAccountService.findById(accountId);
  }

  /**
   * Obtiene todas las cuentas de Treasury
   * pertenecientes a un negocio.
   */
  async findByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    if (!this.canUseTreasury(businessId)) {
      return [];
    }

    return this.treasuryAccountService.findByBusinessId(businessId);
  }

  /**
   * Obtiene únicamente las cuentas activas
   * de Treasury de un negocio.
   */
  async findActiveByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    if (!this.canUseTreasury(businessId)) {
      return [];
    }

    return this.treasuryAccountService.findActiveByBusinessId(businessId);
  }

  /**
   * Desactiva una cuenta de Treasury.
   *
   * La cuenta no se elimina físicamente para
   * conservar el historial asociado.
   */
  async deactivate(accountId: string): Promise<TreasuryAccount> {
    return this.treasuryAccountService.deactivate(accountId);
  }

  /**
   * Reactiva una cuenta de Treasury.
   */
  async activate(accountId: string): Promise<TreasuryAccount> {
    return this.treasuryAccountService.activate(accountId);
  }

  /**
   * Recalcula el saldo materializado de una cuenta
   * de Treasury.
   *
   * El cálculo pertenece al Business Core.
   * El Orchestrator solamente coordina la ejecución.
   */
  async recalculateBalance(
    businessId: string,
    treasuryAccountIdTemp: string,
  ): Promise<TreasuryAccount> {
    if (!this.canUseTreasury(businessId)) {
      throw new Error("Treasury is not enabled for this business");
    }

    return this.treasuryAccountService.recalculateBalance(
      treasuryAccountIdTemp,
      businessId,
    );
  }
}
