export interface InventoryLocationModel {
  id?: string;
  idTemp: string;
  businessId: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}