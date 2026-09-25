// src/common/database/schema/inventory-base-unit.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa una unidad de medida utilizada para controlar
 * cantidades de inventario.
 *
 * Ejemplos: KG, G, L, ML. UNIT
 */
export interface LocalInventoryBaseUnit {
  /**
   * ID generado por el servidor.
   */
  id?: string;

  /**
   * Identidad local estable utilizada por IndexedDB
   */
  idTemp: string;

  /**
   * Código de la unidad.
   * Ejemplos: KG, G, L, ML. UNIT
   */
  code: string;

  /**
   * Nombre legible de la unidad.
   * Ejemplo: "Kilogramo".
   */
  name: string;

  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export const INVENTORY_BASE_UNIT_STORE =
  "idTemp, code, name";