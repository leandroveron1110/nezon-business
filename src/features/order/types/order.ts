import { Origin, PaymentMethodType } from "@/types/order";
import { DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export interface SyncResponse {
  orders: IOrder[];
  latestTimestamp: string;
}

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

export type ProductPaymentMethod = "TRANSFER" | "CASH";


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


export interface IOrder {
  id: string;
  businessId: string;
  userId: string;
  deliveryCompanyId?: string | null;
  status: OrderStatus; // estado general
  origin: Origin;
  isTest: boolean;
  total: number;
  totalDeliveryCost: number;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deliveryType: DeliveryType;
  deliveryStatus: DeliveryStatus; // estado del hilo de entrega
  orderPaymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus; // estado del pago si es por trasnferencia
  paymentReceiptUrl?: string | null;
  paymentInstructions?: string | null;
  paymentHolderName?: string | null;
  customerObservations?: string | null;
  businessObservations?: string | null;

  user: User;
  bussiness: Bussiness;

  items: OrderItem[];

}

export enum DeliveryType {
  PICKUP = "PICKUP", // El cliente retira en el local
  DELIVERY = "DELIVERY",
  IN_HOUSE_DELIVERY = "IN_HOUSE_DELIVERY", // El negocio entrega por su cuenta
  EXTERNAL_DELIVERY = "EXTERNAL_DELIVERY", // Se usa una cadetería externa
}
