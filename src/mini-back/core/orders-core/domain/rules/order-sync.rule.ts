import { Order } from "../order.entity";

export class OrderSyncRule {
  static calculatePriority(
    order: Order
  ): "HIGH" | "LOW" {

    if (order.userId) {
      return "HIGH";
    }

    return "LOW";
  }
}