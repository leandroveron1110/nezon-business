import { InventoryMovementReason } from "../../domain/enums/inventory-movement-reason.enum";

export interface AdjustStockInput {
  businessId: string;
  inventoryProductIdTemp: string;
  locationIdTemp: string;
  lotIdTemp?: string | null;
  countedQuantityBase: number; // Cantidad real contada
  reason: InventoryMovementReason;
  notes?: string | null;
  createdBy?: string | null;
}