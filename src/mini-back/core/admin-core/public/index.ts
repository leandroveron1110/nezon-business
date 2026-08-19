import { AdminSales } from "../domain/sales/admin-sales";
import { AdministrationSummary } from "../domain/summary/administration-summary";
import { GetAdminSalesInput } from "../input/sales/get-admin-sales.input";
import { GetAdministrationSummaryInput } from "../input/summary/get-administration-summary.input";
import { SalesCashQueryPort } from "../port/sales/sales-cash-query.port";
import { SalesOrdersQueryPort } from "../port/sales/sales-orders-query.port";
import { CashQueryPort } from "../port/summary/cash-query.port";
import { OrdersQueryPort } from "../port/summary/orders-query.port";
import { AdminSalesService } from "../service/sales/adminstration-sales.service";
import { SummaryService } from "../service/summary/administration-summary.service";

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/summary/administration-summary";
export * from "../domain/summary/summary-visualizations";
export * from "../domain/summary/summary-comparisons";
export * from "../domain/summary/summary-indicators";

// --- EXPORTACIONES DE INPUTS ---
export * from "../input/summary/get-administration-summary.input";

// --- EXPORTACIONES DE PORTS ---
export * from "../port/summary/cash-query.port";

export interface IAdminSalesService {
  execute(input: GetAdminSalesInput): Promise<AdminSales>;
}

export interface IAdminSummaryService {
  execute(input: GetAdministrationSummaryInput): Promise<AdministrationSummary>;
}

interface AdminSummaryPort {
  ordersQuery: OrdersQueryPort;
  cashQuery: CashQueryPort;
}

export const AdminSalesServicePublic = (
  cashQuery: SalesCashQueryPort,
  ordersQuery: SalesOrdersQueryPort,
): IAdminSalesService => {
  return new AdminSalesService(cashQuery, ordersQuery);
};

export const AdminSummaryServicePublic = (
  adminSummary: AdminSummaryPort,
): IAdminSummaryService => {
  return new SummaryService(adminSummary.ordersQuery, adminSummary.cashQuery);
};
