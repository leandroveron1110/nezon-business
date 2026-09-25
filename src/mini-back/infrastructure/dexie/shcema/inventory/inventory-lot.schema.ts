// src/common/database/schema/inventory-lot.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa un lote o partida de un InventoryProduct.
 *
 * Ejemplo:
 *
 * Harina 000
 * ├── Lote A
 * └── Lote B
 *
 * Cada lote puede tener una fecha de vencimiento diferente.
 */
export interface LocalInventoryLot {
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
   *
   * Permite crear producto y lote offline
   * sin esperar sincronización.
   */
  inventoryProductIdTemp: string;

  /**
   * Número o código del lote.
   *
   * Puede ser el número proporcionado por el fabricante
   * o uno generado por el sistema.
   */
  lotNumber: string;

  /**
   * Fecha de vencimiento del lote.
   */
  expirationDate?: string | null;

  /**
   * Fecha de fabricación del lote.
   */
  manufactureDate?: string | null;

  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export const INVENTORY_LOT_STORE =
  "idTemp, id, businessId, inventoryProductId, inventoryProductIdTemp, lotNumber, expirationDate";