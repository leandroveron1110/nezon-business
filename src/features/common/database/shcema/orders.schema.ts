// src/common/database/shcema/orders.schema.ts

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

// src/features/orders/types/sync.ts
export type  SyncStatus = 
  | 'synced'                // Todo al día
  | 'pending_high_priority'  // Tiene userId -> ¡Enviar YA!
  | 'pending_low_priority'   // No tiene userId -> Puede esperar (Batch)
  | 'failed_retry'          // Falló, reintentar luego
  | 'pending_creation'
  | 'pending_update'

export interface LocalOrder {
  // Identificadores
  idTemp: string;               // UUID v4 generado en el front
  id?: string | null;           // ID de Postgres (uuid) tras sincronizar
  userId?: string;
  
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
  
  // Pagos
  orderPaymentMethod: 'CASH' | 'TRANSFER' | 'QR' |"DELIVERY", // Basado en tus Enums
  paymentStatus: 'PENDING' | 'PAID';
  
  // El "Corazón": los productos comprados
  items: LocalOrderItem[];
  
  // Metadata
  status: string;               // PENDING, PREPARING, COMPLETED, etc.
  origin: 'APP' | 'BUSINESS';   // Para saber si la creó el negocio offline
  createdAt: Date;
  updatedAt: Date;
}

// Definición para Dexie: Indexamos por idTemp, id, status y syncStatus para filtros rápidos
export const ORDERS_STORE = 'idTemp, id, status, syncStatus, createdAt';