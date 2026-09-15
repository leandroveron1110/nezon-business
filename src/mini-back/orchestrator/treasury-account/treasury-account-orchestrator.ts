// src/mini-back/orchestrator/treasury-account/treasury-account-orchestrator.ts

import {
  ITreasuryAccountPublicService,
  TreasuryAccountServicePublic,
} from "@/mini-back/core/treasury-core/public";

import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";

import { CreateTreasuryAccountInput } from "@/mini-back/core/treasury-core/input/treasury-account/create-treasury-account.input";

import { UpdateTreasuryAccountInput } from "@/mini-back/core/treasury-core/input/treasury-account/update-treasury-account.input";

import { db } from "@/mini-back/infrastructure/dexie/db";

import { FinancialMovementDexieRepository } from "@/mini-back/infrastructure/dexie/repositories/admin/financial-movement/financial-movement-dexie.repository";

import { TreasuryAccountDexieRepository } from "@/mini-back/infrastructure/dexie/repositories/admin/treasury/treasury-account.repository";

/**
 * Orquestador encargado de coordinar las operaciones
 * relacionadas con las cuentas de tesorería.
 *
 * Esta capa conecta el Business Core con las implementaciones
 * concretas de infraestructura utilizadas por la aplicación.
 *
 * El Core no conoce Dexie, IndexedDB, React ni Next.js.
 *
 * El Orchestrator conoce qué implementaciones concretas deben
 * utilizarse para ejecutar los casos de uso dentro de esta aplicación.
 *
 * Actualmente actúa principalmente como punto de composición
 * entre TreasuryAccountService y los repositories de infraestructura.
 *
 * A medida que el sistema crezca, podrá coordinar operaciones
 * que involucren otros Cores, Services u Orchestrators sin
 * introducir dependencias externas dentro del Business Core.
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
   * Crea una nueva cuenta dentro de la tesorería del negocio.
   *
   * Ejemplos:
   *
   * - Efectivo
   * - Banco Galicia
   * - Mercado Pago
   * - Caja de seguridad
   *
   * La lógica de negocio relacionada con la creación
   * permanece dentro del TreasuryAccountService.
   */
  async create(input: CreateTreasuryAccountInput): Promise<TreasuryAccount> {
    return this.treasuryAccountService.create(input);
  }

  /**
   * Actualiza los datos administrativos de una cuenta
   * de tesorería.
   *
   * La lógica que determina qué propiedades pueden
   * modificarse pertenece al Business Core.
   */
  async update(input: UpdateTreasuryAccountInput): Promise<TreasuryAccount> {
    return this.treasuryAccountService.update(input);
  }

  /**
   * Busca una cuenta de tesorería por su identificador.
   *
   * Devuelve null cuando la cuenta no existe.
   */
  async findById(accountId: string): Promise<TreasuryAccount | null> {
    return this.treasuryAccountService.findById(accountId);
  }

  /**
   * Obtiene todas las cuentas de tesorería de un negocio.
   *
   * Incluye tanto cuentas activas como inactivas.
   *
   * Resulta útil para:
   *
   * - Panel administrativo
   * - Historial
   * - Configuración de tesorería
   */
  async findByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    return this.treasuryAccountService.findByBusinessId(businessId);
  }

  /**
   * Obtiene únicamente las cuentas activas
   * de tesorería de un negocio.
   *
   * Estas cuentas son las disponibles para
   * registrar nuevas operaciones financieras.
   */
  async findActiveByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    return this.treasuryAccountService.findActiveByBusinessId(businessId);
  }

  /**
   * Desactiva una cuenta de tesorería.
   *
   * La cuenta no se elimina físicamente para
   * conservar el historial financiero asociado.
   *
   * Una cuenta desactivada deja de estar disponible
   * para nuevas operaciones.
   */
  async deactivate(accountId: string): Promise<TreasuryAccount> {
    return this.treasuryAccountService.deactivate(accountId);
  }

  /**
   * Reactiva una cuenta de tesorería previamente
   * desactivada.
   *
   * Al activarse vuelve a estar disponible para
   * nuevas operaciones financieras.
   */
  async activate(accountId: string): Promise<TreasuryAccount> {
    return this.treasuryAccountService.activate(accountId);
  }

  /**
   * Recalcula el saldo materializado de una cuenta
   * de tesorería.
   *
   * El saldo se obtiene a partir del historial
   * financiero asociado a la cuenta.
   *
   * La consulta y el cálculo se delegan al
   * Business Core y a sus Ports correspondientes.
   *
   * El Orchestrator solamente coordina la ejecución
   * utilizando las implementaciones concretas
   * de infraestructura configuradas para la aplicación.
   */
  async recalculateBalance(
    businessId: string,
    treasuryAccountId: string,
  ): Promise<TreasuryAccount> {
    return this.treasuryAccountService.recalculateBalance(
      treasuryAccountId,
      businessId,
    );
  }
}
