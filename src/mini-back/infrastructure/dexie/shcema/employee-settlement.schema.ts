import { EmployeeSettlementStatus } from "@/mini-back/shared/enums/employee-settlement-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalEmployeeSettlement {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  employeeId: string;

  // Período liquidado.
  periodStart: Date;

  periodEnd: Date;

  // Monto histórico de la liquidación.
  amount: number;

  status: EmployeeSettlementStatus;

  // Fecha en que se realizó el pago.
  paidAt?: Date | null;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const EMPLOYEE_SETTLEMENT_STORE =
  "idTemp, id, employeeId, status, periodStart, periodEnd, [employeeId+periodStart], [employeeId+periodEnd], [employeeId+idTemp]";