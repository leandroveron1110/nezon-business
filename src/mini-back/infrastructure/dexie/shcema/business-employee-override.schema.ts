import { PermissionEnum } from "@/mini-back/shared/enums/permission.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalBusinessEmployeeOverride {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  employeeId: string;

  permission: PermissionEnum;

  // true  = permite el permiso
  // false = revoca el permiso
  allowed: boolean;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const BUSINESS_EMPLOYEE_OVERRIDE_STORE =
  "idTemp, id, employeeId, permission, [employeeId+permission], [employeeId+idTemp]";