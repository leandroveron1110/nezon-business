import {
  AdminSales,
  SalesPaymentMethod,
  SalesEvolutionItem,
  SalesByHourItem,
  SalesByOrderType,
  SalesByCashRegister,
} from "../../domain/sales/admin-sales";

import { GetAdminSalesInput } from "../../input/sales/get-admin-sales.input";

import { SalesCashQueryPort } from "../../port/sales/sales-cash-query.port";
import { SalesOrdersQueryPort } from "../../port/sales/sales-orders-query.port";
import { IAdminSalesService } from "../../public";

export class AdminSalesService implements IAdminSalesService {
  constructor(
    private readonly cashQuery: SalesCashQueryPort,
    private readonly ordersQuery: SalesOrdersQueryPort,
  ) {}

async execute(input: GetAdminSalesInput): Promise<AdminSales> {
    const { businessId, from, to } = input;

    const [
      financialSummary,
      orderCount,
      salesEvolution,
      salesByHour,
      paymentMethodsRaw,
      salesByOrderTypeRaw,
      salesByCashRegisterRaw,
    ] = await Promise.all([
      this.cashQuery.getSalesSummary(businessId, from, to),
      this.ordersQuery.getOrderCount(businessId, from, to),
      this.cashQuery.getSalesEvolution(businessId, from, to),
      this.cashQuery.getSalesByHour(businessId, from, to),
      this.cashQuery.getPaymentMethodSummary(businessId, from, to),
      this.ordersQuery.getSalesByOrderType(businessId, from, to),
      this.cashQuery.getSalesByCashRegister(businessId, from, to),
    ]);

    // ============================================================
    // ECUAClONES FINANCIERAS ADMINISTRATIVAS
    // ============================================================

    // 1. Ventas Netas = Ventas Brutas - Devoluciones
    const netSales = financialSummary.totalSales - financialSummary.totalRefunds;

    // 2. Margen Bruto ($) = Ventas Netas - COGS
    const grossMargin = netSales - financialSummary.totalCogs;

    // 3. Porcentaje de Margen Bruto (%)
    const grossMarginPercentage = netSales > 0 ? (grossMargin / netSales) * 100 : 0;

    // 4. Ganancia Operativa ($) = Margen Bruto - Mermas
    const grossProfit = grossMargin - financialSummary.totalWaste;

    const averageTicket = this.calculateAverageTicket(
      financialSummary.totalSales,
      orderCount,
    );

    // ============================================================
    // ANALYTICS
    // ============================================================

    const paymentMethods = this.calculatePaymentMethodPercentages(paymentMethodsRaw);
    const salesByCashRegister = this.calculateCashRegisterPercentages(salesByCashRegisterRaw);
    const salesByOrderType = this.calculateOrderTypePercentages(salesByOrderTypeRaw);

    const evolution = salesEvolution.map((item) => ({
      date: this.formatDateToLocalISO(item.date),
      amount: item.amount,
    }));

    // ============================================================
    // RESULT
    // ============================================================

    return {
      summary: {
        totalSales: financialSummary.totalSales,
        totalRefunds: financialSummary.totalRefunds,
        netSales,
        totalCogs: financialSummary.totalCogs,
        totalWaste: financialSummary.totalWaste,
        grossMargin,
        grossMarginPercentage,
        grossProfit,
        orderCount,
        averageTicket,
      },
      paymentMethods,
      evolution,
      byHour: salesByHour,
      byOrderType: salesByOrderType,
      byCashRegister: salesByCashRegister,
    };
  }

  // ============================================================
  // CALCULATIONS
  // ============================================================

  private calculateAverageTicket(
    totalSales: number,
    orderCount: number,
  ): number {
    if (orderCount <= 0) {
      return 0;
    }

    return totalSales / orderCount;
  }

  private calculatePaymentMethodPercentages(
    methods: {
      paymentMethod: string;
      amount: number;
    }[],
  ): SalesPaymentMethod[] {
    const total = methods.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    );

    return methods.map((item) => ({
      method: item.paymentMethod,

      amount: item.amount,

      percentage:
        total > 0
          ? (item.amount / total) * 100
          : 0,
    }));
  }

  private calculateCashRegisterPercentages(
    registers: {
      cashRegisterId: string;
      cashRegisterName: string;
      amount: number;
    }[],
  ): SalesByCashRegister[] {
    const total = registers.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    );

    return registers.map((item) => ({
      cashRegisterId:
        item.cashRegisterId,

      cashRegisterName:
        item.cashRegisterName,

      amount: item.amount,

      percentage:
        total > 0
          ? (item.amount / total) * 100
          : 0,
    }));
  }

  private calculateOrderTypePercentages(
    types: {
      type: string;
      orderCount: number;
    }[],
  ): SalesByOrderType[] {
    const totalOrders =
      types.reduce(
        (sum, item) =>
          sum + item.orderCount,
        0,
      );

    return types.map((item) => ({
      type: item.type,

      orderCount:
        item.orderCount,

      amount: 0,

      percentage:
        totalOrders > 0
          ? (item.orderCount / totalOrders) *
            100
          : 0,
    }));
  }

  private formatDateToLocalISO(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}