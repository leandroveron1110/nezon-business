import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";
import { DeliveryQuotationStatus, OrderStatus } from "./order-state-machine";

export interface OrderOption {
  optionId?: string;
  optionName: string;
  priceFinal: number;
  quantity: number;
}

export interface OrderOptionGroup {
  groupName: string;
  options: OrderOption[];
}

export type Origin = 'APP' | 'BUSINESS'

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  notes?: string;
  optionGroups: OrderOptionGroup[];
}

export type SyncStatus = 
  | 'LOCAL_ONLY'      // La orden solo existe aquí (ej. Venta mostrador aún no sincronizada)
  | 'SYNC_PENDING'    // El negocio ya decidió que esto DEBE ir a la nube
  | 'SYNCED'          // El servidor ya confirmó recepción y tenemos un ID definitivo
  | 'SYNC_ERROR'      // Se intentó subir y el negocio debe decidir qué hacer

export type SyncPriority = 'HIGH' | 'LOW';

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export type DeliveryProvider = 'PLATFORM' | 'INTERNAL';

export enum PaymentMethodTypeFinancial {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QR = "QR",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  MERCADO_PAGO = "MERCADO_PAGO",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}

export interface Order {
  // Identificadores
  idTemp: string;               // UUID v4 generado en el front
  id?: string | null;           // ID de Postgres (uuid) tras sincronizar
  userId?: string;
  businessId: string;
  
  // Estado de Sincronización (Crucial para el batch)
  syncStatus: SyncStatus;
  
  // Datos del Cliente (Snapshot)
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerObservations?: string;
  syncedStatus: boolean;    // true si el status actual de la orden ya impactó en la nube
  syncedPayment: boolean;   // true si el paymentStatus actual ya impactó en la nube
  syncedDelivery: boolean;  // true si el deliveryStatus actual ya impactó en la nube
  // Logística y Totales
  total: number;

  syncPriority: SyncPriority; // Determina si va por el canal rápido o el batch

  // Nueva configuración de logística
  deliveryType: DeliveryType;
  
  // Especificamos quién hace la entrega
  deliveryProvider: DeliveryProvider; 

  deliveryQuotationStatus?: DeliveryQuotationStatus; // Estado de la cotización de envío (si aplica)

  // Control de precio
  deliveryPriceMode: 'AUTOMATIC' | 'MANUAL';
  
  totalDeliveryCost: number;
  
  // Pagos
  orderPaymentMethod: PaymentMethodTypeFinancial, // Basado en tus Enums
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  shortCode?: string | null;
  dailyNumber?: number | null;
  
  // El "Corazón": los productos comprados
  items: OrderItem[];
  
  // Metadata
  status: OrderStatus;               // PENDING, PREPARING, COMPLETED, etc.
  origin: Origin;   // Para saber si la creó el negocio offline
  createdAt: Date;
  updatedAt: Date;
}
