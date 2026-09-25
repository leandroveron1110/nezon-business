// src/common/database/schema/inventory-product.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa un elemento que el negocio reconoce y controla como inventario.
 *
 * Ejemplos:
 * - Harina 000
 * - Queso
 * - Masa
 * - Coca-Cola 500ml
 * - Caja para pizza
 * - Bujía NGK
 * - Aceite
 *
 * IMPORTANTE:
 * InventoryProduct NO representa necesariamente algo que se vende.
 * Puede ser comprado, producido, consumido, transformado o vendido.
 */
export interface LocalInventoryProduct {
  /**
   * ID generado por servidor
   */
  id?: string;

  /**
   * Identidad local estable del registro.
   */
  idTemp: string;

  /**
   * Negocio al que pertenece este producto de inventario.
   */
  businessId: string;

  /**
   * Código interno o SKU utilizado por el negocio.
   * Ejemplos:HAR-000, COCA-500, NGK-BP6ES
   */
  code?: string | null;

  /**
   * Nombre del elemento de inventario.
   * Ejemplo: "Harina 000".
   */
  name: string;

  /**
   * Descripción opcional del elemento.
   */
  description?: string | null;

  /**
   * Unidad matemática en la que se controla el stock.
   * Ejemplos: KG, G, L, ML. UNIT
   */
  baseUnitId: string;

  /**
   * Cantidad mínima deseada antes de generar una alerta
   * de stock bajo.
   * Se expresa en la unidad base.
   */
  minStock?: number | null;

  /**
   * Cantidad máxima deseada de stock.
   * Se expresa en la unidad base.
   */
  maxStock?: number | null;

  /**
   * Indica si el producto puede seguir utilizándose.
   *
   * Se puede desactivar en lugar de eliminarlo físicamente,
   * especialmente si ya posee movimientos históricos.
   */

  /**
   * Indica si al ingresar stock de este producto es obligatorio
   * registrar número de lote y/o fecha de vencimiento.
   */
  trackLots?: boolean; // o requiresLot?: boolean;
  isActive: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export const INVENTORY_PRODUCT_STORE =
  "idTemp, id, businessId, code, name, baseUnitId, isActive";