import { OrdersQueryPort, TopSellingProduct } from "@/mini-back/core/admin-core/port/summary/orders-query.port";
import { HunayDB } from "../../db";
import { LocalOrder } from "../../shcema/orders.schema";

export class OrderAdminRepository implements OrdersQueryPort {
  constructor(private readonly db: HunayDB) {}

  /**
   * Obtiene la cantidad de pedidos válidos
   * dentro del período.
   *
   * No calcula dinero.
   */
  async getOrderCount(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<{ orderCount: number }> {
    let orderCount = 0;

    await this.db.orders
      .where("createdAt")
      .between(from, to, true, true)
      .filter((order) =>
        this.isValidOrderForBusiness(
          order,
          businessId,
          true,
        ),
      )
      .each(() => {
        orderCount++;
      });

    return {
      orderCount,
    };
  }

  /**
   * Obtiene los productos más vendidos
   * dentro del período.
   *
   * Se utilizan únicamente órdenes válidas.
   */
  async getTopSellingProducts(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<TopSellingProduct[]> {
    const productsMap = new Map<
      string,
      {
        productName: string;
        quantity: number;
        revenue: number;
      }
    >();

    await this.db.orders
      .where("createdAt")
      .between(from, to, true, true)
      .filter((order) =>
        this.isValidOrderForBusiness(
          order,
          businessId,
          true,
        ),
      )
      .each((order) => {
        for (const item of order.items) {
          const existing =
            productsMap.get(item.productId) ?? {
              productName: item.productName,
              quantity: 0,
              revenue: 0,
            };

          const itemRevenue =
            item.priceAtPurchase *
            item.quantity;

          productsMap.set(
            item.productId,
            {
              productName:
                item.productName,
              quantity:
                existing.quantity +
                item.quantity,
              revenue:
                existing.revenue +
                itemRevenue,
            },
          );
        }
      });

    return Array.from(
      productsMap.entries(),
    )
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort(
        (a, b) =>
          b.revenue - a.revenue,
      )
      .slice(0, 10);
  }

  private isValidOrderForBusiness(
    order: LocalOrder,
    businessId: string,
    onlyValidSales = false,
  ): boolean {
    if (order.businessId !== businessId) {
      return false;
    }

    if (onlyValidSales) {
      return (
        order.status !== "CANCELLED" &&
        order.status !== "REFUNDED"
      );
    }

    return true;
  }
}