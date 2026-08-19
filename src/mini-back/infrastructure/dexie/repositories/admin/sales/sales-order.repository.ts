import { SalesOrdersQueryPort } from "@/mini-back/core/admin-core/port/sales/sales-orders-query.port";
import { db } from "../../../db";
import { LocalOrder } from "../../../shcema/orders.schema";

export class SalesOrderRepository implements SalesOrdersQueryPort {
  /**
   * Cantidad de pedidos válidos dentro
   * del período.
   *
   * No calcula dinero.
   */
  async getOrderCount(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    let orderCount = 0;

    await db.orders
      .where("createdAt")
      .between(from, to, true, true)
      .filter((order) => this.isValidOrder(order, businessId))
      .each(() => {
        orderCount++;
      });

    return orderCount;
  }

  /**
   * Cantidad de pedidos agrupados
   * por tipo de pedido.
   *
   * Ejemplo:
   *
   * DELIVERY -> 30
   * TAKEAWAY -> 20
   * DINE_IN  -> 15
   */
  async getSalesByOrderType(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      type: string;
      orderCount: number;
    }[]
  > {
    const orderTypeMap = new Map<string, number>();

    await db.orders
      .where("createdAt")
      .between(from, to, true, true)
      .filter((order) => this.isValidOrder(order, businessId))
      .each((order) => {
        /**
         * Ajustar este campo al nombre real
         * que tenga LocalOrder.
         */
        const type = order.deliveryType;

        const current = orderTypeMap.get(type) ?? 0;

        orderTypeMap.set(type, current + 1);
      });

    return Array.from(orderTypeMap.entries())
      .map(([type, orderCount]) => ({
        type,
        orderCount,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
  }

  // ============================================================
  // AUXILIAR
  // ============================================================

  private isValidOrder(order: LocalOrder, businessId: string): boolean {
    if (order.businessId !== businessId) {
      return false;
    }

    return order.status !== "CANCELLED" && order.status !== "REFUNDED";
  }
}
