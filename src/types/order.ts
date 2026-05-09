import { DeliveryStatus, OrderStatus, PaymentStatus } from "./order-state-machine";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  address?: string | null; // dirección completa como string
  avatarId?: string | null;
}

export interface Bussiness {
  name: string;
  address: string; // dirección completa como string
  phone: string;
}

export interface OrderOption {
  id: string;
  opcionId?: string | null;
  optionName: string;
  priceFinal: number;
  priceWithoutTaxes: number;
  taxesAmount: number;
  priceModifierType: string;
  quantity: number;
}

export interface OrderOptionGroup {
  id: string;
  opcionGrupoId?: string | null;
  groupName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: string;
  options: OrderOption[];
}

export type ProductPaymentMethod = 'TRANSFER' | 'CASH'

export interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string | null;
  productImageUrl?: string | null;
  productPaymentMethod: ProductPaymentMethod;
  quantity: number;
  priceAtPurchase: number;
  notes?: string | null;
  optionGroups: OrderOptionGroup[];
}

export interface OrderDiscount {
  id: string;
  amount: number;
  type: string;
  notes?: string | null;
  paidBy?: string | null;
}



export enum DeliveryType {
  PICKUP = "PICKUP", // El cliente retira en el local
  DELIVERY = "DELIVERY",
  IN_HOUSE_DELIVERY = "IN_HOUSE_DELIVERY", // El negocio entrega por su cuenta
  EXTERNAL_DELIVERY = "EXTERNAL_DELIVERY", // Se usa una cadetería externa
}

export enum PaymentMethodType {
  TRANSFER = "TRANSFER",
  CASH = "CASH",
  QR = "QR",
  OTHER="OTHER"
}

export type Origin = 'APP' | 'BUSINESS'

export interface IOrderShortDto {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  deliveryType: DeliveryType;
  deliveryStatus: DeliveryStatus;
  orderPaymentMethod: PaymentMethodType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  origin: Origin
  shortCode: string;
}