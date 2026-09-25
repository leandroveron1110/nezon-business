// src/common/database/schema/inventory-presentation.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa una forma de presentar/agrupar físicamente
 * un InventoryProduct.
 *
 * Ejemplos:
 * - UNIT
 * - PACK
 * - CAJA
 * - BOLSA
 *
 * La presentación define una conversión respecto de la
 * unidad base del InventoryProduct.
 */
export interface LocalInventoryPresentation {
  /**
   * ID generado por el backend.
   */
  id?: string;

  /**
   * Identidad local estable.
   */
  idTemp: string;

  /**
   * ID del InventoryProduct en backend.
   *
   * Puede no existir todavía si el producto fue creado offline.
   */
  inventoryProductId?: string;

  /**
   * ID local del InventoryProduct.
   *
   * Permite relacionar registros creados offline.
   */
  inventoryProductIdTemp: string;

  /**
   * Nombre de la presentación.
   *
   * Ejemplos:
   * - "Unidad"
   * - "Pack"
   * - "Caja"
   * - "Bolsa 25kg"
   */
  name: string;

  /**
   * Cantidad de unidades base que representa esta presentación.
   *
   * Ejemplo:
   *
   * Coca-Cola:
   * PACK = 6
   * CAJA = 24
   *
   * Si la unidad base es UNIT:
   * 1 CAJA = 24 UNIT
   */
  conversionFactor: number;

  /**
   * Código de barras asociado específicamente
   * a esta presentación.
   *
   * Ejemplo:
   * una unidad puede tener un EAN y la caja otro.
   */
  barcode?: string | null;

  /**
   * Indica si esta es la presentación predeterminada
   * para determinadas operaciones del sistema.
   */
  isDefault: boolean;

  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}


export const INVENTORY_PRESENTATION_STORE =
  "idTemp, id, inventoryProductId, inventoryProductIdTemp, barcode, isDefault";