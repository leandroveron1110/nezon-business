// src/common/database/shcema/products.schema.ts

export interface LocalOption {
  id: string;
  name: string;
  priceFinal: number;
  hasStock: boolean;
}

export interface LocalOptionGroup {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  options: LocalOption[];
}

export interface LocalProduct {
  id: string;               
  name: string;
  description: string;
  finalPrice: number;
  sectionName: string;      
  imageUrl?: string | null;
  stock: number;
  available: boolean;
  optionGroups: LocalOptionGroup[];    
}

// El string de definición para Dexie
export const PRODUCTS_STORE = 'id, name, sectionName, *foodCategories, searchString';