export interface InventoryStockModel {
  id?: string;
  idTemp: string;
  businessId: string;
  inventoryProductId?: string;
  inventoryProductIdTemp: string;
  locationId?: string;
  locationIdTemp: string;
  lotId?: string | null;
  lotIdTemp?: string | null;
  /**
   * Verdad principal y absoluta de saldo en la unidad base.
   */
  quantityBase: number;
  createdAt: string;
  updatedAt: string;
}