// src/common/database/schema/inventory-location.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

/**
 * Representa una ubicación física donde puede existir inventario.
 *
 * Ejemplos:
 * - Depósito
 * - Cocina
 * - Heladera 1
 * - Freezer
 * - Salón
 * - Sucursal 2
 */
export interface LocalInventoryLocation {
  /**
   * ID generado por el backend.
   */
  id?: string;

  /**
   * Identidad local estable.
   */
  idTemp: string;

  /**
   * Negocio al que pertenece la ubicación.
   */
  businessId: string;

  /**
   * Código interno de la ubicación.
   *
   * Ejemplo:
   * - DEP-01
   * - COC-01
   * - HEL-01
   */
  code?: string | null;

  /**
   * Nombre de la ubicación.
   * Ejemplo: "Depósito Central".
   */
  name: string;

  /**
   * Descripción opcional.
   */
  description?: string | null;

  /**
   * Indica si es la ubicación predeterminada
   * para determinadas operaciones.
   */
  isDefault: boolean;

  /**
   * Indica si la ubicación sigue disponible para utilizarse.
   */
  isActive: boolean;


  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export const INVENTORY_LOCATION_STORE =
  "idTemp, id, businessId, code, name, isDefault, isActive";