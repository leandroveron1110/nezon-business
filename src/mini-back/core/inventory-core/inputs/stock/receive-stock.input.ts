import { InventoryMovementReason } from "../../domain/enums/inventory-movement-reason.enum";
import { InventoryMovementReferenceType } from "../../domain/enums/inventory-movement-ref-type.enum";

export interface ReceiveStockInput {
  businessId: string;
  inventoryProductIdTemp: string;
  locationIdTemp: string;
  quantityBase: number;
  reason: InventoryMovementReason;
  
  // Opcionales según el flujo/producto
  lotNumber?: string | null;
  expirationDate?: string | null;
  manufactureDate?: string | null;
  presentationIdTemp?: string | null;
  presentationQuantity?: number | null;
  unitCost?: number | null;
  referenceType?: InventoryMovementReferenceType | null;
  referenceIdTemp?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}