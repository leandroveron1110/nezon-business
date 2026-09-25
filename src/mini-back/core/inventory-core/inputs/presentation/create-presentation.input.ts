export interface CreatePresentationInput {
  businessId: string;
  idTemp: string;
  inventoryProductIdTemp: string;
  name: string;
  conversionFactor: number;
  barcode?: string | null;
  isDefault: boolean;
}