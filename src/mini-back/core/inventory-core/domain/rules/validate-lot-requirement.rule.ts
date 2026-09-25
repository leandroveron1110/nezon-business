import { InventoryProductModel } from "../models/inventory-product.model";

export function validateLotRequirement(
  product: InventoryProductModel,
  lotNumber?: string | null
): void {
  if (product.trackLots && !lotNumber?.trim()) {
    throw new Error(
      `Invariante Rota: El producto '${product.name}' exige número de lote y fecha de vencimiento.`
    );
  }
}