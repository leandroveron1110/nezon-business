// src/common/database/shcema/orders.schema.ts

import { Origin } from "@/types/order";
import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";

export interface LocalOrderOption {
  optionId?: string;
  optionName: string;
  priceFinal: number;
  quantity: number;
}

export interface LocalOrderOptionGroup {
  groupName: string;
  options: LocalOrderOption[];
}

export interface LocalOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  notes?: string;
  optionGroups: LocalOrderOptionGroup[];
}

export type SyncStatus = 
  | 'LOCAL_ONLY'      // La orden solo existe aquí (ej. Venta mostrador aún no sincronizada)
  | 'SYNC_PENDING'    // El negocio ya decidió que esto DEBE ir a la nube
  | 'SYNCED'          // El servidor ya confirmó recepción y tenemos un ID definitivo
  | 'SYNC_ERROR'      // Se intentó subir y el negocio debe decidir qué hacer


export interface LocalOrder {
  idTemp: string;               
  id?: string | null;           
  userId?: string;
  businessId: string;
  
  syncStatus: SyncStatus;

  // 🔥 FLAGS DE CONTROL POR HILO (Evitan ráfagas duplicadas al servidor)
  syncedStatus: boolean;    // true si el status actual de la orden ya impactó en la nube
  syncedPayment: boolean;   // true si el paymentStatus actual ya impactó en la nube
  syncedDelivery: boolean;  // true si el deliveryStatus actual ya impactó en la nube

  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerObservations?: string;
  total: number;
  deliveryType: 'DELIVERY' | 'PICKUP';
  deliveryProvider: 'PLATFORM' | 'INTERNAL'; 
  deliveryPriceMode: 'AUTOMATIC' | 'MANUAL';
  totalDeliveryCost: number;
  syncPriority: 'HIGH' | 'LOW';
  orderPaymentMethod: 'CASH' | 'TRANSFER' | 'QR' | "DELIVERY";
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  shortCode?: string | null;
  dailyNumber?: number | null;
  items: LocalOrderItem[];
  status: string;               
  origin: Origin;   
  createdAt: Date;
  updatedAt: Date;
}

// Indexamos también por los estados de los hilos para búsquedas quirúrgicas si hiciese falta
export const ORDERS_STORE = 'idTemp, id, status, syncStatus, syncedStatus, syncedPayment, syncedDelivery, createdAt';