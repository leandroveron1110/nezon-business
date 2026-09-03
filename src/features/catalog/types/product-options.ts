export interface AvailableMenuProduct {
  id: string;

  name: string;

  finalPrice: string;

  available: boolean;

  imageUrl?: string | null;
}

export interface CreateOptionGroupData {
  name: string;

  minQuantity: number;

  maxQuantity: number;
}

export interface CreateOptionData {
  name: string;

  priceFinal: string;

  hasStock: boolean;

  /**
   * Si existe, esta opción representa
   * un producto real del menú.
   */
  menuProductId?: string | null;
}