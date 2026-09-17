// src/common/database/schema/orders.schema.ts

import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";
import { Origin } from "@/types/order";
import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";

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
  costAtPurchase: number;
  notes?: string;
  optionGroups: LocalOrderOptionGroup[];
}

export type DeliveryQuotationStatus =
  | "PENDING" // El DeliveryWorker todavía debe intentar resolverla
  | "WAITING_BASE" // Ya fue enviada a Base
  | "RESOLVED" // Precio obtenido automáticamente o desde Base
  | "MANUAL" // Precio ingresado manualmente
  | "ERROR"; // Error definitivo

export type DeliveryResolutionStrategy =
  | "LIVE_MAP" // Resuelto automáticamente mediante geocoding + proveedor
  | "ZONE_ONLY" // Solo se identificó el barrio/zona
  | "ZONE_WITH_STREET" // Barrio identificado + calle geolocalizada
  | "ZONE_FALLBACK" // Fallback de zona por falla del proveedor
  | "BASE" // Pendiente o resuelto por operador humano (Base)
  | "MANUAL"; // Precio ingresado manualmente por caja

export interface LocalOrder {
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

  // 🚀 Asignación local de cadete para control de caja / pantalla
  courierName?: string | null;

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
  orderPaymentMethod: PaymentMethodTypeFinancial;
  paymentStatus: PaymentStatus;

  // ==========================================================================
  // TOTALES
  // ==========================================================================

  // Total de los productos antes de descuentos.
  subtotal: number;

  // Descuento aplicado sobre el total de productos.
  discountType?: "PERCENTAGE" | "FIXED" | null;

  // Valor utilizado para calcular el descuento.
  //
  // PERCENTAGE → 100 = 100%
  // FIXED      → 2500 = $2500
  discountValue?: number | null;

  // Importe real descontado.
  discountAmount?: number | null;

  // Total final de los productos después del descuento.
  //
  // El costo de envío NO está incluido.
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
  // CAJA DE TURNO (RELACIÓN)
  // ==========================================================================
  // Guardamos las claves locales y remotas de la caja donde se creó la orden
  cashRegisterTurnIdTemp?: string;
  cashRegisterTurnId?: string | null;

  // ==========================================================================
  // PROGRAMACIÓN DEL PEDIDO
  // ==========================================================================

  // NULL/undefined = pedido para atender ahora.
  // Con valor = fecha y hora para la que el cliente solicita el pedido.
  scheduledAt?: Date | null;

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
  "idTemp, id, businessId, status, syncStatus, cashRegisterTurnIdTemp, cashRegisterTurnId, syncedStatus, syncedPayment, syncedDelivery, deliveryQuotationStatus, scheduledAt, createdAt";
