import {
  AdministrationSummary,
  AdminSummaryServicePublic,
  GetAdministrationSummaryInput,
  IAdminSummaryService,
} from "../core/admin-core/public";
import { db } from "../infrastructure/dexie/db";
import { CashAdminRepository } from "../infrastructure/dexie/repositories/admin/summary/cash-admin.repository";
import { OrderAdminRepository } from "../infrastructure/dexie/repositories/admin/summary/order-admin.repository";

export class AdministrationOrchestrator {
  private readonly summaryService: IAdminSummaryService;

  constructor() {
    // 1. Instanciamos los adaptadores de infraestructura (repositorios)
    const ordersQueryRepo = new OrderAdminRepository(db);
    const cashQueryRepo = new CashAdminRepository(db);

    // 2. Inyectamos los puertos en el servicio puro de dominio
    this.summaryService = AdminSummaryServicePublic({
      cashQuery: cashQueryRepo,
      ordersQuery: ordersQueryRepo,
    });
  }

  /**
   * Método principal consumido por la UI / Presentadores
   */
  async getGeneralSummary(
    input: GetAdministrationSummaryInput,
  ): Promise<AdministrationSummary> {
    return this.summaryService.execute(input);
  }
}
