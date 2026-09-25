export interface TransferStockInput {
  businessId: string;
  inventoryProductIdTemp: string;
  fromLocationIdTemp: string;
  toLocationIdTemp: string;
  quantityBase: number;
  lotIdTemp?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}