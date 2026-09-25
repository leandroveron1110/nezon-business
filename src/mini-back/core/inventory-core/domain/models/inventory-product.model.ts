export interface InventoryProductModel {
  id?: string;
  idTemp: string;
  businessId: string;
  code?: string | null;
  name: string;
  description?: string | null;
  baseUnitId?: string;
  baseUnitIdTemp?: string;
  minStock?: number | null;
  maxStock?: number | null;
  /**
   * Indica si este producto exige lote y fecha de vencimiento
   * para cualquier operación de entrada de stock.
   */
  trackLots: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}