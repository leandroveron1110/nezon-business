import { InventoryMovementReason } from "../enums/inventory-movement-reason.enum";
import { InventoryMovementReferenceType } from "../enums/inventory-movement-ref-type.enum";
import { InventoryMovementType } from "../enums/inventory-movement-type.enum";

export interface InventoryMovementModel {
  id?: string;
  idTemp: string;
  businessId: string;
  inventoryProductId?: string;
  inventoryProductIdTemp: string;
  stockId?: string;
  stockIdTemp: string;
  type: InventoryMovementType;
  quantityBase: number;
  reason: InventoryMovementReason;
  referenceType?: InventoryMovementReferenceType | null;
  referenceId?: string | null;
  referenceIdTemp?: string | null;
  unitCost?: number | null;
  totalCost?: number | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
}