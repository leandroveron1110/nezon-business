export interface InventoryPresentationModel {
  id?: string;
  idTemp: string;
  inventoryProductId?: string;
  inventoryProductIdTemp: string;
  name: string;
  conversionFactor: number;
  barcode?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}