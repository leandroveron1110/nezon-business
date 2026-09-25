import { InventoryMovementReason } from "../../domain/enums/inventory-movement-reason.enum";

import { InventoryMovementReferenceType } from "../../domain/enums/inventory-movement-ref-type.enum";

import { StockWithdrawalStrategy } from "../../domain/enums/stock-withdrawal-strategy.enum";

export interface ConsumeStockSelectionInput {
  stockIdTemp: string;

  quantityBase: number;
}

export interface ConsumeStockInput {
  businessId: string;

  inventoryProductIdTemp: string;

  locationIdTemp: string;

  quantityBase: number;

  reason: InventoryMovementReason;

  // ============================================================
  // ESTRATEGIA DE RETIRO
  // ============================================================

  withdrawalStrategy: StockWithdrawalStrategy;

  // ============================================================
  // LOTE EXPLÍCITO
  // ============================================================

  /**
   * Requerido cuando:
   *
   * withdrawalStrategy === EXPLICIT_LOT
   */
  lotIdTemp?: string | null;

  // ============================================================
  // SELECCIÓN MANUAL
  // ============================================================

  /**
   * Requerido cuando:
   *
   * withdrawalStrategy === MANUAL_SELECTION
   *
   * Permite indicar exactamente de qué stocks
   * y qué cantidad se debe retirar.
   */
  manualSelections?: ConsumeStockSelectionInput[];

  // ============================================================
  // REFERENCIA DEL MOVIMIENTO
  // ============================================================

  referenceType?: InventoryMovementReferenceType | null;

  referenceIdTemp?: string | null;

  // ============================================================
  // INFORMACIÓN ADICIONAL
  // ============================================================

  notes?: string | null;

  createdBy?: string | null;
}
