// src/common/database/schema/inventory-movement.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Dirección matemática del movimiento.
 */
export enum InventoryMovementType {
  /**
   * El inventario aumenta.
   */
  IN = "IN",

  /**
   * El inventario disminuye.
   */
  OUT = "OUT",
}

/**
 * Motivo por el cual ocurrió el movimiento.
 */
export enum InventoryMovementReason {
  /**
   * Carga inicial del inventario.
   */
  INITIAL_ADJUSTMENT = "INITIAL_ADJUSTMENT",

  /**
   * Corrección manual del inventario.
   */
  MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT",

  /**
   * Movimiento de inventario entre ubicaciones.
   */
  TRANSFER = "TRANSFER",

  /**
   * Consumo de inventario.
   *
   * Puede ser utilizado, por ejemplo, para consumir
   * ingredientes durante una producción.
   */
  CONSUMPTION = "CONSUMPTION",

  /**
   * Entrada de inventario producida por fabricación.
   */
  PRODUCTION = "PRODUCTION",

  /**
   * Entrada de inventario proveniente de una recepción.
   */
  RECEIPT = "RECEIPT",

  /**
   * Pérdida o desperdicio de inventario.
   */
  WASTE = "WASTE",             // Merma general (rotura, tirado)
  EXPIRED = "EXPIRED",         // Merma específica por vencimiento
}

/**
 * Tipo de operación externa que originó el movimiento.
 *
 * Esto permite guardar la trazabilidad sin importar
 * directamente la lógica de otros módulos/cores.
 */
export enum InventoryMovementReferenceType {
  PURCHASE = "PURCHASE",
  SALE = "SALE",
  PRODUCTION = "PRODUCTION",
  TRANSFER = "TRANSFER",
  STOCKTAKE = "STOCKTAKE",
  MANUAL = "MANUAL",
}

/**
 * Representa un movimiento histórico de inventario.
 *
 * Ejemplos:
 * - Entrada por compra
 * - Salida por consumo
 * - Producción
 * - Merma
 * - Ajuste
 * - Transferencia
 *
 * El movimiento representa lo que ocurrió.
 * Stock representa el estado actual.
 */
export interface LocalInventoryMovement {
  /**
   * ID generado por el backend.
   */
  id?: string;

  /**
   * Identidad local estable.
   */
  idTemp: string;

  businessId: string,

  /**
   * ID del InventoryProduct en backend.
   */
  inventoryProductId?: string;

  /**
   * ID local del InventoryProduct.
   */
  inventoryProductIdTemp: string;

  /**
   * ID del Stock afectado en backend.
   */
  stockId?: string;

  /**
   * ID local del Stock afectado.
   */
  stockIdTemp: string;

  /**
   * Tipo de movimiento.
   *
   * IN  = aumenta el stock.
   * OUT = disminuye el stock.
   */
  type: InventoryMovementType;

  /**
   * Cantidad expresada SIEMPRE en la unidad base.
   *
   * Ejemplo:
   *
   * Harina → 10 KG
   * Coca-Cola → 24 UNIT
   */
  quantityBase: number;

  /**
   * Motivo concreto por el cual ocurrió el movimiento.
   */
  reason: InventoryMovementReason;

  /**
   * Tipo de operación externa que originó el movimiento.
   *
   * Sirve para poder saber de dónde vino el movimiento
   * sin que Inventory tenga que conocer la lógica de esa operación.
   */
  referenceType?: InventoryMovementReferenceType | null;

  /**
   * ID del registro externo en backend.
   *
   * Ejemplo:
   * ID de una compra, venta o producción.
   */
  referenceId?: string | null;

  /**
   * ID local del registro externo.
   *
   * Necesario para mantener relaciones entre entidades
   * que todavía no fueron sincronizadas.
   */
  referenceIdTemp?: string | null;

  /**
   * Costo de UNA unidad base en este movimiento.
   *
   * Ejemplo:
   * Harina → $1.200 por KG.
   *
   * Es opcional porque todavía no todos los movimientos
   * necesariamente tendrán valoración económica.
   */
  unitCost?: number | null;

  /**
   * Costo total asociado al movimiento.
   *
   * Normalmente:
   *
   * unitCost × quantityBase
   */
  totalCost?: number | null;

  /**
   * Observaciones adicionales.
   */
  notes?: string | null;

  /**
   * Usuario que generó o autorizó el movimiento.
   *
   * Es un ID externo; el modelo de inventario no necesita
   * conocer cómo funciona Employee/Auth.
   */
  createdBy?: string | null;

  /**
   * Estado de sincronización.
   */
  syncStatus: SyncStatus;

  /**
   * Fecha en que ocurrió/registró el movimiento.
   */
  createdAt: string;
}

export const INVENTORY_MOVEMENT_STORE =
  "idTemp, id, inventoryProductId, businessId, inventoryProductIdTemp, stockId, stockIdTemp, referenceType, referenceId, referenceIdTemp, createdAt";