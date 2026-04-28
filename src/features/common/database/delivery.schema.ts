// src/common/database/delivery.schema.ts

export interface LocalDeliveryCompany {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
}

export interface LocalDeliveryZone {
  id: string;      // ID del Barrio/Zona (Destino)
  name: string;    // Nombre para mostrar
  macroZoneId: string;
}

// Este objeto guardará el resultado de la última consulta exitosa 
// o la configuración general del negocio
export interface LocalLogisticsConfig {
  id: 'current_config'; // Singleton: solo guardamos uno
  businessId: string;
  companies: LocalDeliveryCompany[];
  availableZones: LocalDeliveryZone[];
  lastUpdated: Date;
}

export const DELIVERY_STORE = 'id';