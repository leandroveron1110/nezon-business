// src/common/database/orders.schema.ts

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

export interface LocalOrder {
  // Identificadores
  idTemp: string;               // UUID v4 generado en el front
  id?: string | null;           // ID de Postgres (uuid) tras sincronizar
  
  // Estado de Sincronización (Crucial para el batch)
  syncStatus: 'pending_creation' | 'pending_update' | 'synced';
  
  // Datos del Cliente (Snapshot)
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerObservations?: string;
  
  // Logística y Totales
  deliveryType: 'DELIVERY' | 'PICKUP';
  total: number;
  totalDeliveryCost: number;
  
  // Pagos
  orderPaymentMethod: 'CASH' | 'TRANSFER' | 'QR'; // Basado en tus Enums
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