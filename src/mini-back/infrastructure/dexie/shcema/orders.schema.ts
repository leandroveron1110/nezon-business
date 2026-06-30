// src/common/database/schema/orders.schema.ts

import { Origin } from "@/types/order";
import {
  DeliveryStatus,
  PaymentStatus,
} from "@/types/order-state-machine";

// ============================================================================
// PRODUCTOS
// ============================================================================

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

// ============================================================================
// SINCRONIZACIÓN
// ============================================================================

export type SyncStatus =
  | "LOCAL_ONLY" // Solo existe localmente (ej: venta mostrador aún no enviada)
  | "SYNC_PENDING" // Debe sincronizarse con la nube
  | "SYNCED" // La nube confirmó recepción
  | "SYNC_ERROR"; // Hubo un error y requiere reintento o intervención

// ============================================================================
// DELIVERY SNAPSHOT
// ============================================================================
// Estos estados pertenecen al dominio Delivery.
//
// Se persisten dentro de LocalOrder únicamente para soportar:
//
// - funcionamiento offline
// - recargas de página
// - reinicios del navegador
// - recuperación de cotizaciones pendientes
//
// El dominio Delivery sigue siendo independiente.
// Esto es solamente un snapshot persistido para reconstruir la UI.
// ============================================================================

export type DeliveryQuotationStatus =
  | "PENDING"       // El DeliveryWorker todavía debe intentar resolverla
  | "WAITING_BASE"  // Ya fue enviada a Base
  | "RESOLVED"      // Precio obtenido automáticamente o desde Base
  | "MANUAL"        // Precio ingresado manualmente
  | "ERROR";        // Error definitivo

export type DeliveryResolutionStrategy =
  | "LIVE_MAP" // Resuelto automáticamente mediante geocoding + proveedor
  | "ZONE_ONLY" // Solo se identificó el barrio/zona
  | "ZONE_WITH_STREET" // Barrio identificado + calle geolocalizada
  | "ZONE_FALLBACK" // Fallback de zona por falla del proveedor
  | "BASE" // Pendiente o resuelto por operador humano (Base)
  | "MANUAL"; // Precio ingresado manualmente por caja

// ============================================================================
// ORDEN LOCAL
// ============================================================================
// Esta entidad NO representa el dominio Order puro.
//
// Representa el snapshot completo que Caja necesita reconstruir
// después de:
//
// - refresh
// - cierre de pestaña
// - reinicio del navegador
// - pérdida de internet
//
// Por ese motivo contiene información proveniente de varios dominios
// (Order, Payment, Delivery, Sync, etc).
// ============================================================================

export interface LocalOrder {
  // ==========================================================================
  // IDENTIFICACIÓN
  // ==========================================================================

  // UUID local generado inmediatamente al crear la orden.
  // Es la clave primaria real dentro de IndexedDB.
  idTemp: string;

  // ID definitivo asignado por el servidor luego de sincronizar.
  id?: string | null;

  userId?: string;

  // Negocio propietario de la orden.
  businessId: string;

  // ==========================================================================
  // SINCRONIZACIÓN
  // ==========================================================================

  syncStatus: SyncStatus;

  // Evitan enviar múltiples veces el mismo cambio.
  //
  // Cada hilo (status, pago, delivery) se sincroniza de forma independiente.
  // Cuando un valor cambia, el flag vuelve a false y queda pendiente.
  syncedStatus: boolean;
  syncedPayment: boolean;
  syncedDelivery: boolean;

  // Prioridad utilizada por los workers de sincronización.
  syncPriority: "HIGH" | "LOW";

  // ==========================================================================
  // CLIENTE
  // ==========================================================================

  customerName: string;

  customerPhone: string;

  customerAddress?: string;

  customerObservations?: string;

  // ==========================================================================
  // DELIVERY (SNAPSHOT)
  // ==========================================================================

  // Estado de la cotización de envío.
  //
  // Permite recuperar pedidos pendientes de Base luego
  // de una recarga o pérdida de conexión.
  deliveryQuotationStatus?: DeliveryQuotationStatus;

  // Estrategia utilizada para resolver el costo del envío.
  deliveryResolutionStrategy?: DeliveryResolutionStrategy;

  // Identificador remoto de la solicitud enviada a Base.
  // Se utiliza para consultar posteriormente si el operador
  // ya resolvió la cotización.
  deliveryQuotationId?: string;

  // Dirección normalizada utilizada durante la resolución.
  resolvedAddress?: string;

  // Coordenadas obtenidas por geocoding.
  latitude?: number;
  longitude?: number;

  // Zona/barrio asociado durante la resolución.
  zoneId?: string;

  // ==========================================================================
  // CONFIGURACIÓN LOGÍSTICA
  // ==========================================================================

  deliveryType: "DELIVERY" | "PICKUP";

  deliveryProvider: "PLATFORM" | "INTERNAL";

  // Indica si el costo fue calculado automáticamente
  // o cargado manualmente por el negocio.
  deliveryPriceMode: "AUTOMATIC" | "MANUAL";

  totalDeliveryCost: number;

  // Estado operativo del envío.
  //
  // No debe confundirse con DeliveryQuotationStatus.
  //
  // Ejemplo:
  // quotationStatus = RESOLVED
  // deliveryStatus = REQUESTED
  deliveryStatus: DeliveryStatus;

  // ==========================================================================
  // PAGOS
  // ==========================================================================

  orderPaymentMethod:
    | "CASH"
    | "TRANSFER"
    | "QR"
    | "DELIVERY";

  paymentStatus: PaymentStatus;

  // ==========================================================================
  // TOTALES
  // ==========================================================================

  total: number;

  // ==========================================================================
  // PRODUCTOS
  // ==========================================================================

  items: LocalOrderItem[];

  // ==========================================================================
  // ESTADO DE NEGOCIO
  // ==========================================================================

  status: string;

  origin: Origin;

  // ==========================================================================
  // IDENTIFICADORES VISUALES
  // ==========================================================================

  shortCode?: string | null;

  dailyNumber?: number | null;

  // ==========================================================================
  // AUDITORÍA
  // ==========================================================================

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================================
// ÍNDICES DEXIE
// ============================================================================

export const ORDERS_STORE =
  "idTemp, id, status, syncStatus, syncedStatus, syncedPayment, syncedDelivery, deliveryQuotationStatus, createdAt";