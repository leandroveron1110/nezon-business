// src/common/database/schema/inventory-stock.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa la existencia actual de un InventoryProduct
 * dentro de una ubicación y opcionalmente un lote.
 *
 * Ejemplo:
 *
 * Coca-Cola 500ml
 * └── Depósito
 *     └── 263 UNIT
 *
 * O:
 *
 * Harina 000
 * └── Depósito
 *     └── Lote A
 *         └── 100 KG
 */
export interface LocalInventoryStock {
  /**
   * ID generado por el backend.
   */
  id?: string;

  /**
   * Identidad local estable.
   */
  idTemp: string;

  businessId: string;

  /**
   * ID del InventoryProduct en backend.
   */
  inventoryProductId?: string;

  /**
   * ID local del InventoryProduct.
   */
  inventoryProductIdTemp: string;

  /**
   * ID de la ubicación en backend.
   */
  locationId?: string;

  /**
   * ID local de la ubicación.
   */
  locationIdTemp: string;

  /**
   * ID del lote en backend.
   *
   * Es opcional porque no todos los productos necesitan
   * trazabilidad por lote.
   */
  lotId?: string | null;

  /**
   * ID local del lote.
   */
  lotIdTemp?: string | null;

  /**
   * Cantidad matemática real de inventario.
   *
   * Esta es la verdad principal de cantidad.
   *
   * Ejemplo:
   * 263 UNIT
   * 100 KG
   * 50 L
   */
  quantityBase: number;

  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

// src/common/database/schema/inventory-stock.schema.ts

export const INVENTORY_STOCK_STORE =
  "idTemp, id, businessId, inventoryProductId, inventoryProductIdTemp, locationId, locationIdTemp, lotId, lotIdTemp, [inventoryProductIdTemp+locationIdTemp]";