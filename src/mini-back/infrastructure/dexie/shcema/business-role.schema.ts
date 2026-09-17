import { PermissionEnum } from "@/mini-back/shared/enums/permission.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalBusinessRole {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  name: string;

  permissions: PermissionEnum[];

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const BUSINESS_ROLE_STORE =
  "idTemp, id, businessId, name, [businessId+name], [businessId+idTemp]";