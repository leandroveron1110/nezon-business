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
  
  // Logística y Totales
  total: number;

  // Nueva configuración de logística
  deliveryType: 'DELIVERY' | 'PICKUP';
  
  // Especificamos quién hace la entrega
  deliveryProvider: 'PLATFORM' | 'INTERNAL'; 

  // Control de precio
  deliveryPriceMode: 'AUTOMATIC' | 'MANUAL';
  
  totalDeliveryCost: number;
  syncPriority: 'HIGH' | 'LOW';
  
  // Pagos
  orderPaymentMethod: 'CASH' | 'TRANSFER' | 'QR' |"DELIVERY", // Basado en tus Enums
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  shortCode?: string | null;
  dailyNumber?: number | null;
  
  // El "Corazón": los productos comprados
  items: LocalOrderItem[];
  
  // Metadata
  status: string;               // PENDING, PREPARING, COMPLETED, etc.
  origin: Origin;   // Para saber si la creó el negocio offline
  createdAt: Date;
  updatedAt: Date;
}

// Definición para Dexie: Indexamos por idTemp, id, status y syncStatus para filtros rápidos
export const ORDERS_STORE = 'idTemp, id, status, syncStatus, createdAt';