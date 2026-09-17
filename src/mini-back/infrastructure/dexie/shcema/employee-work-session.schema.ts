import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalEmployeeWorkSession {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  employeeId: string;

  // Inicio de la jornada.
  startedAt: Date;

  // Fin de la jornada.
  // null = jornada todavía abierta.
  endedAt?: Date | null;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const EMPLOYEE_WORK_SESSION_STORE =
  "idTemp, id, employeeId, startedAt, endedAt, [employeeId+startedAt], [employeeId+idTemp]";