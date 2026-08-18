import { AdministrationSummary } from "../domain/summary/administration-summary";
import { GetAdministrationSummaryInput } from "../input/summary/get-administration-summary.input";
import { CashQueryPort } from "../port/summary/cash-query.port";
import { OrdersQueryPort } from "../port/summary/orders-query.port";
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


export interface IAdminSummaryService {
  execute(input: GetAdministrationSummaryInput): Promise<AdministrationSummary>
}

interface AdminSummaryPort {
  ordersQuery: OrdersQueryPort;
  cashQuery: CashQueryPort;
}

export const AdminSummaryServicePublic = (
  adminSummary: AdminSummaryPort): IAdminSummaryService => {
  return new SummaryService(
    adminSummary.ordersQuery,
    adminSummary.cashQuery,
  );
};
