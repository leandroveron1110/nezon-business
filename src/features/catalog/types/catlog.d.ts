// -----------------------------
// BASE TYPES
// -----------------------------

interface OptionBase {
  name: string;
  hasStock: boolean;
  index: number;
  priceFinal: string;
  menuProductId?: string;
  priceWithoutTaxes: string;
  taxesAmount: string;
  priceModifierType: "NOT_CHANGE" | "INCREASE" | string;
  maxQuantity?: number;
  images?: string[];
  optionGroupId: string;
}

interface OptionGroupBase {
  name: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: "FIXED" | "MIN_MAX" | string;
  options?: IOption[];
}

interface MenuProductBase {
  name: string;
  description: string;

  preparationTime?: number | null;
  stock?: number;
  available?: boolean;
  enabled: boolean;

  finalPrice: number | string;
  originalPrice?: number | string;
  currency?: string;
  currencyMask?: string;
  finalPriceWithoutTaxes?: number | string;
  taxesAmount?: number | string;
  discountAmount?: number | string;
  discountPercentage?: number | string;
  discountType?: string[];

  rating?: number;
  hasOptions?: boolean;
  isMostOrdered?: boolean;
  isRecommended?: boolean;

  optionGroups?: IOptionGroup[];
  imageUrl?: string | null;
  seccionId: string;

  acceptsCash: boolean;
  acceptsTransfer: boolean;
  acceptsQr: boolean;
  cost: number;
}

// -----------------------------
// CREATE TYPES (DTOs)
// -----------------------------

export interface MenuCreate {
  name: string;
  businessId: string;
  ownerId: string;
}

export interface SectionCreate {
  name: string;
  index: number;
  imageUrls: string[];
  ownerId: string;
  businessId: string;
  menuId: string;
}

export interface MenuProductCreate extends MenuProductBase {
  businessId: string;
  menuId: string;
  ownerId: string;
}

export interface OptionGroupCreate extends OptionGroupBase {
  menuProductId: string;
}

export interface OptionCreate extends OptionBase {
  optionGroupId: string;
}

// -----------------------------
// QUERY TYPES (READ/EDIT/DELETE)
// -----------------------------

export interface IOption extends OptionBase {
  id: string;
  images: string[];
}

export interface IOptionGroup extends OptionGroupBase {
  id: string;
  options: IOption[];
}

export interface IMenuProduct extends MenuProductBase {
  id: string;
  enabled: boolean;
  currency: string;
  optionGroups: IOptionGroup[];
  imageUrl: string | null;
  available: boolean;
  stock: number;
  preparationTime: number | null;
  acceptsCash: boolean;
  acceptsTransfer: boolean;
  acceptsQr: boolean;
}

export interface IMenuSectionWithProducts {
  id: string;
  name: string;
  imageUrls: string[];
  index: number;
  products: IMenuProduct[];
}

export interface IMenu {
  id: string;
  businessId: string;
  name: string;
  sections: IMenuSectionWithProducts[];
}
