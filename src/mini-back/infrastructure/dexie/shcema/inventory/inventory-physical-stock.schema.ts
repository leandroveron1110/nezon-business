// src/common/database/schema/inventory-physical-stock.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa cómo está físicamente distribuido un Stock
 * utilizando las distintas presentaciones disponibles.
 *
 * No representa una cantidad independiente del Stock.
 * Es la composición física de ese Stock.
 */
export interface LocalInventoryPhysicalStock {
  /**
   * ID generado por el backend.
   */
  id?: string;

  /**
   * Identidad local estable.
   */
  idTemp: string;

  /**
   * ID del Stock en backend.
   */
  stockId?: string;

  /**
   * ID local del Stock.
   *
   * Permite crear el stock y su composición física
   * completamente offline.
   */
  stockIdTemp: string;

  /**
   * ID de la Presentation en backend.
   */
  presentationId?: string;

  /**
   * ID local de la Presentation.
   */
  presentationIdTemp: string;

  /**
   * Cantidad física de esa presentación.
   *
   * Ejemplo:
   *
   * presentation = CAJA
   * quantity = 10
   *
   * significa que físicamente existen 10 cajas.
   */
  quantity: number;

  syncStatus: SyncStatus;

  createdAt: string;
  updatedAt: string;
}


export const INVENTORY_PHYSICAL_STOCK_STORE =
  "idTemp, id, stockId, stockIdTemp, presentationId, presentationIdTemp";