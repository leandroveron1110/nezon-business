import { HunayDB } from "../../../db";
import {
  CashQueryPort,
  CategoryExpenseDTO,
  SalesEvolutionItem,
} from "@/mini-back/core/admin-core/public";

export class CashAdminRepository implements CashQueryPort {
  constructor(private readonly db: HunayDB) {}

  /**
   * Obtiene el resumen financiero real del período.
   *
   * La fuente de verdad es financialMovement.
   *
   * Solo se consideran movimientos CONFIRMED.
   */
  async getFinancialSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<{
    totalSales: number;
    totalRefunds: number;
    totalExpenses: number;
  }> {
    let totalSales = 0;
    let totalRefunds = 0;
    let totalExpenses = 0;

    await this.db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId && movement.status === "CONFIRMED",
      )
      .each((movement) => {
        switch (movement.type) {
          case "SALE":
            totalSales += movement.amount;
            break;

          case "REFUND":
            totalRefunds += movement.amount;
            break;

          case "EXPENSE":
            totalExpenses += movement.amount;
            break;
        }
      });

    return {
      totalSales,
      totalRefunds,
      totalExpenses,
    };
  }

  /**
   * Evolución de ventas financieras por día.
   *
   * IMPORTANTE:
   * Esta consulta representa dinero efectivamente cobrado,
   * no órdenes creadas.
   */
  async getSalesEvolution(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<SalesEvolutionItem[]> {
    const evolutionMap = new Map<string, number>();

    await this.db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "SALE",
      )
      .each((movement) => {
        const dateKey = this.formatDateKey(new Date(movement.date));

        const currentAmount = evolutionMap.get(dateKey) ?? 0;

        evolutionMap.set(dateKey, currentAmount + movement.amount);
      });

    return Array.from(evolutionMap.entries())
      .map(([dateStr, amount]) => {
        const [year, month, day] = dateStr.split("-").map(Number);

        return {
          date: new Date(year, month - 1, day),
          amount,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Agrupa el dinero cobrado por método de pago.
   *
   * Solo se consideran ventas financieras
   * efectivamente confirmadas.
   */
  async getPaymentMethodSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      paymentMethod: string;
      amount: number;
    }[]
  > {
    const paymentMap = new Map<string, number>();

    await this.db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "SALE",
      )
      .each((movement) => {
        const method = movement.paymentMethod;
        if (method) {
          const currentAmount = paymentMap.get(method) ?? 0;

          paymentMap.set(method, currentAmount + movement.amount);
        }
      });

    return Array.from(paymentMap.entries()).map(([paymentMethod, amount]) => ({
      paymentMethod,
      amount,
    }));
  }

  /**
   * Agrupa los gastos por categoría.
   *
   * Actualmente utiliza description como categoría
   * hasta que exista una categoría de gasto real.
   */
  async getExpensesGroupedByCategory(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<CategoryExpenseDTO[]> {
    const categoryMap = new Map<
      string,
      {
        categoryName: string;
        amount: number;
      }
    >();

    await this.db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "EXPENSE",
      )
      .each((movement) => {
        const categoryId = movement.description ?? "UNCATEGORIZED";

        const categoryName = movement.description ?? "Gastos Varios";

        const existing = categoryMap.get(categoryId) ?? {
          categoryName,
          amount: 0,
        };

        categoryMap.set(categoryId, {
          categoryName: existing.categoryName,
          amount: existing.amount + movement.amount,
        });
      });

    return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      amount: data.amount,
    }));
  }

  // ============================================================
  // AUXILIAR
  // ============================================================

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
