export interface TransformStockInputItem {
  inventoryProductIdTemp: string;
  quantityBase: number;
  lotIdTemp?: string | null;
}

export interface TransformStockInput {
  businessId: string;
  locationIdTemp: string;
  inputs: TransformStockInputItem[];  // Insumos a consumir
  outputs: TransformStockInputItem[]; // Productos resultantes a ingresar
  notes?: string | null;
  createdBy?: string | null;
}