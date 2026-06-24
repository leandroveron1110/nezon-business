// src/core/delivery/domain/delivery.entity.ts

// ============================================================================
// ESTADO DE COTIZACIÓN
// ============================================================================

export type DeliveryQuotationStatus =
  | "PENDING" // Esperando resolución (ej: operador Base)
  | "RESOLVED" // Precio obtenido correctamente
  | "MANUAL" // Precio cargado manualmente por el negocio
  | "ERROR"; // No fue posible obtener una cotización

// ============================================================================
// ESTRATEGIA DE RESOLUCIÓN
// ============================================================================

export type DeliveryResolutionStrategy =
  | "LIVE_MAP" // Resuelto automáticamente mediante geocoding + proveedor
  | "ZONE_ONLY" // Solo se identificó una zona/barrio
  | "ZONE_WITH_STREET" // Zona identificada + dirección geolocalizada
  | "ZONE_FALLBACK" // Fallback a zona por falla del proveedor
  | "BASE" // Derivado a operador humano (Base)
  | "MANUAL"; // Resuelto manualmente por caja

// ============================================================================
// DELIVERY
// ============================================================================
// Representa el estado completo del proceso de resolución de un envío.
//
// Este agregado es responsable de:
//
// - resolver direcciones
// - geolocalizar
// - obtener cotizaciones automáticas
// - solicitar cotizaciones a Base
// - permitir resolución manual
//
// No administra repartidores ni seguimiento del viaje.
// ============================================================================

export interface Delivery {
  // Orden asociada al envío.
  orderId: string;

  // Estado actual de la cotización.
  quotationStatus: DeliveryQuotationStatus;

  // Estrategia utilizada para obtener el resultado actual.
  resolutionStrategy: DeliveryResolutionStrategy;

  // Identificador de la solicitud remota cuando
  // la cotización fue enviada a Base.
  quotationId?: string;

  // Dirección normalizada obtenida durante la resolución.
  resolvedAddress?: string;

  // Coordenadas resultantes del proceso de geocoding.
  latitude?: number;
  longitude?: number;

  // Zona o barrio identificado durante la resolución.
  zoneId?: string;

  // Costo resuelto del envío.
  //
  // Puede ser automático, provenir de Base
  // o haber sido ingresado manualmente.
  quotedCost?: number;

  // Quién realizará la entrega.
  provider: "PLATFORM" | "INTERNAL";

  createdAt: Date;
  updatedAt: Date;
}