import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalPosition {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  name: string;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const POSITION_STORE =
  "idTemp, id, businessId, name, [businessId+name], [businessId+idTemp]";