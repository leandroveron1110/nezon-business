// core/orders/domain/rules/order-discount.ts

import { OrderDiscountType } from "../order.entity";

export interface OrderDiscountResult {
  discountAmount: number;
  total: number;
}

export class OrderDiscountRule {
  static calculate(
    subtotal: number,
    type: OrderDiscountType,
    value: number,
  ): OrderDiscountResult {
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      throw new Error("El subtotal de la orden no es válido.");
    }

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("El valor del descuento no es válido.");
    }

    let discountAmount: number;

    switch (type) {
      case "PERCENTAGE": {
        if (value > 100) {
          throw new Error(
            "El porcentaje de descuento no puede ser mayor al 100%.",
          );
        }

        discountAmount = subtotal * (value / 100);

        break;
      }

      case "FIXED": {
        if (value > subtotal) {
          throw new Error("El descuento fijo no puede ser mayor al subtotal.");
        }

        discountAmount = value;

        break;
      }

      default:
        throw new Error("Tipo de descuento no válido.");
    }

    return {
      discountAmount,
      total: subtotal - discountAmount,
    };
  }
}
