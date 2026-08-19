import {
  AdministrationSummary,
  SummaryAnalytics,
} from "../../domain/summary/administration-summary";
import {
  ExpenseSummary,
  PaymentMethodSummary,
} from "../../domain/summary/summary-visualizations";
import { GetAdministrationSummaryInput } from "../../input/summary/get-administration-summary.input";
import { CashQueryPort } from "../../port/summary/cash-query.port";
import { OrdersQueryPort } from "../../port/summary/orders-query.port";
import { IAdminSummaryService } from "../../public";

export class SummaryService implements IAdminSummaryService {
  constructor(
    private readonly ordersQuery: OrdersQueryPort,
    private readonly cashQuery: CashQueryPort,
  ) {}

  async execute(
    input: GetAdministrationSummaryInput,
  ): Promise<AdministrationSummary> {
    const { businessId, from, to } = input;

    // ============================================================
    // 1. RANGOS TEMPORALES
    // ============================================================

    const now = new Date();

    // ----------------------------
    // Hoy
    // ----------------------------

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    // ----------------------------
    // Ayer
    // ----------------------------

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // ----------------------------
    // Semana actual
    // Últimos 7 días incluyendo hoy
    // ----------------------------

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    // ----------------------------
    // Semana anterior
    // ----------------------------

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setMilliseconds(-1);

    // ----------------------------
    // Mes actual
    // Desde inicio de mes hasta hoy
    // ----------------------------

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    // ----------------------------
    // Mes anterior
    // ----------------------------

    const prevMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );

    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setMilliseconds(-1);

    // ============================================================
    // 2. CONSULTAS
    // ============================================================
    const [
      currentFinancial,
      currentOrders,
      salesEvolution,
      paymentMethodsRaw,
      topProducts,
      rawExpenses,

      todayFinancial,
      yesterdayFinancial,
      weekFinancial,
      prevWeekFinancial,
      monthFinancial,
      prevMonthFinancial,
    ] = await Promise.all([
      this.cashQuery.getFinancialSummary(businessId, from, to),
      this.ordersQuery.getOrderCount(businessId, from, to),
      this.cashQuery.getSalesEvolution(businessId, from, to),
      this.cashQuery.getPaymentMethodSummary(businessId, from, to),
      this.ordersQuery.getTopSellingProducts(businessId, from, to),
      this.cashQuery.getExpensesGroupedByCategory(businessId, from, to),
      this.cashQuery.getFinancialSummary(businessId, todayStart, todayEnd),
      this.cashQuery.getFinancialSummary(
        businessId,
        yesterdayStart,
        yesterdayEnd,
      ),
      this.cashQuery.getFinancialSummary(businessId, weekStart, todayEnd),
      this.cashQuery.getFinancialSummary(
        businessId,
        prevWeekStart,
        prevWeekEnd,
      ),
      this.cashQuery.getFinancialSummary(businessId, monthStart, todayEnd),
      this.cashQuery.getFinancialSummary(
        businessId,
        prevMonthStart,
        prevMonthEnd,
      ),
    ]);

    // ============================================================
    // 3. CÁLCULOS FINANCIEROS
    // ============================================================
    const netSales =
      currentFinancial.totalSales - currentFinancial.totalRefunds;

    const estimatedProfit = netSales - currentFinancial.totalExpenses;

    const estimatedMargin =
      netSales > 0 ? (estimatedProfit / netSales) * 100 : 0;

    const averageTicket = this.calculateAverageTicket(
      currentFinancial.totalSales,
      currentOrders.orderCount,
    );

    // ============================================================
    // 4. ANALYTICS
    // ============================================================

    const paymentMethods: PaymentMethodSummary[] =
      this.calculatePaymentMethodPercentages(paymentMethodsRaw);

    const expenses: ExpenseSummary[] =
      this.calculateExpensePercentages(rawExpenses);

    // ============================================================
    // 5. RESULTADO
    // ============================================================

    return {
      indicators: {
        salesToday: todayFinancial.totalSales,
        salesWeek: weekFinancial.totalSales,
        salesMonth: monthFinancial.totalSales,

        orderCount: currentOrders.orderCount,

        averageTicket,

        totalReturns: currentFinancial.totalRefunds,
        totalExpenses: currentFinancial.totalExpenses,

        estimatedProfit,
        estimatedMargin,
      },

      comparisons: {
        todayVsYesterday: this.calculateComparison(
          todayFinancial.totalSales,
          yesterdayFinancial.totalSales,
        ),

        weekVsPreviousWeek: this.calculateComparison(
          weekFinancial.totalSales,
          prevWeekFinancial.totalSales,
        ),

        monthVsPreviousMonth: this.calculateComparison(
          monthFinancial.totalSales,
          prevMonthFinancial.totalSales,
        ),
      },

      analytics: {
        salesEvolution: salesEvolution.map((item) => ({
          date: this.formatDateToLocalISO(item.date),
          amount: item.amount,
        })),

        paymentMethods,

        topProducts,

        expenses,
      },
    };
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  private calculateAverageTicket(sales: number, orders: number): number {
    if (orders <= 0) {
      return 0;
    }

    return sales / orders;
  }

  private calculateComparison(current: number, previous: number) {
    const variation = current - previous;

    let variationPercentage = 0;

    if (previous === 0) {
      variationPercentage = current > 0 ? 100 : 0;
    } else {
      variationPercentage = (variation / previous) * 100;
    }

    return {
      current,
      previous,
      variation,
      variationPercentage,
    };
  }

  private calculatePaymentMethodPercentages(
    paymentMethods: {
      paymentMethod: string;
      amount: number;
    }[],
  ): PaymentMethodSummary[] {
    const totalAmount = paymentMethods.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return paymentMethods.map((item) => ({
      method: item.paymentMethod,
      amount: item.amount,
      percentage: totalAmount === 0 ? 0 : (item.amount / totalAmount) * 100,
    }));
  }

  private calculateExpensePercentages(
    expenses: {
      categoryId: string;
      categoryName: string;
      amount: number;
    }[],
  ): ExpenseSummary[] {
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return expenses.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.amount,
      percentage: totalExpenses === 0 ? 0 : (item.amount / totalExpenses) * 100,
    }));
  }

  private formatDateToLocalISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
