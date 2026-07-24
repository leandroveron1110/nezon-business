import { OrderStatus } from "@/features/order/types/order";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";


export enum PaymentStatus {
  PENDING = "PENDING", 
  IN_PROGRESS = "IN_PROGRESS",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
}

export interface CreateOrderOption {
  optionName: string;
  priceModifierType: string;
  quantity: number;
  priceFinal: string;        
  priceWithoutTaxes: string; 
  taxesAmount: string;       
  opcionId?: string;
}

export interface CreateOrderOptionGroup {
  groupName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: string;
  opcionGrupoId?: string;
  options: CreateOrderOption[];
}

export interface CreateOrderItem {
  menuProductId: string;
  productName: string;
  productDescription?: string;
  productImageUrl?: string;
  quantity: number;
  priceAtPurchase: string;   // número decimal como string
  notes?: string;
  optionGroups: CreateOrderOptionGroup[];
}

export interface AddressId {
  id: string;
}

export interface CreateOrderFull {
  userId: string;
  businessId: string;
  deliveryAddress?: AddressId;
  pickupAddress?: AddressId;

  // --- snapshot cliente ---
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerObservations?: string;

  // --- snapshot negocio ---
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessObservations?: string;

  status?: OrderStatus;
  isTest?: boolean;
  total: number;
  notes?: string;
  items: CreateOrderItem[];

  // --- pagos ---
  orderPaymentMethod?: PaymentMethodTypeFinancial;       // CASH, TRANSFER, DELIVERY
  paymentStatus?: PaymentStatus;         // PENDING, IN_PROGRESS, CONFIRMED, REJECTED
  paymentReceiptUrl?: string;            // URL del comprobante
  paymentInstructions?: string;          // solo si es transferencia
  paymentHolderName?: string;            // titular del cliente (transferencias)
}
