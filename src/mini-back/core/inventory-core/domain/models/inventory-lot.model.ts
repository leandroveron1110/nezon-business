export interface InventoryLotModel {
  id?: string;
  idTemp: string;
  businessId: string;
  inventoryProductId?: string;
  inventoryProductIdTemp: string;
  lotNumber: string;
  expirationDate?: string | null;
  manufactureDate?: string | null;
  createdAt: string;
  updatedAt: string;
}