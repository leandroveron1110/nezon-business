// src/common/database/schema/cash-register.schema.ts

import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalCashRegister {
  // UUID local generado inmediatamente.
  idTemp: string;
  // UUID definitivo asignado por el servidor.
  id?: string | null;
  businessId: string;
  syncStatus: SyncStatus;
  syncPriority: "HIGH";

  name: string;                       // Ej: "Caja Mostrador 1", "Barra Principal", "Delivery 01"
  
  // Cuenta de tesorería asociada por defecto para cobros en efectivo con el idTemp local de tesoreria
  defaultTreasuryAccountId: string;   // FK a LocalTreasuryAccount (tipo CASH)

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ÍNDICES DEXIE
export const CASH_REGISTER_STORE = 
  "idTemp, id, businessId, name, [businessId+name], [businessId+idTemp], isActive, syncStatus, defaultTreasuryAccountId";