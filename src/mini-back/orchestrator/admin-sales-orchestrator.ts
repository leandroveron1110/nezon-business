import { AdminSales } from "../core/admin-core/domain/sales/admin-sales";
import { GetAdminSalesInput } from "../core/admin-core/input/sales/get-admin-sales.input";
import {
  AdminSalesServicePublic,
  IAdminSalesService,
} from "../core/admin-core/public";
import { SalesCashRepository } from "../infrastructure/dexie/repositories/admin/sales/sales-cash.repository";
import { SalesOrderRepository } from "../infrastructure/dexie/repositories/admin/sales/sales-order.repository";

export class AdminSalesOrchestrator {
  private readonly salesService: IAdminSalesService;
  constructor() {
    // 1. Instanciamos los adaptadores de infraestructura (repositorios)
    const cashQueryRepo = new SalesCashRepository();
    const ordersQueryRepo = new SalesOrderRepository();

    // 2. Inyectamos los puertos en el servicio puro de dominio
    this.salesService = AdminSalesServicePublic(cashQueryRepo, ordersQueryRepo);
  }

  async execute(input: GetAdminSalesInput): Promise<AdminSales> {
    return this.salesService.execute(input);
  }
}
