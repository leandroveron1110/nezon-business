// src/common/database/schema/cash-register.schema.ts

import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalCashRegisterTurn {
  // UUID local generado inmediatamente.
  clientTurnId: string;
  // UUID definitivo asignado por el servidor.
  id?: string | null;
  businessId: string;
  syncStatus: SyncStatus;
  syncPriority: "HIGH" | "LOW";
  openedByUserId: string;
  closedByUserId?: string;
  // APERTURA
  openingDate: Date;
  openingAmount: number;
  openingNotes?: string;
  // CIERRE
  closingDate?: Date;
  declaredClosingAmount?: number;
  systemClosingAmount?: number;
  difference?: number;
  closingNotes?: string;
  status: CashRegisterStatus;
  // AUDITORÍA
  createdAt: Date;
  updatedAt: Date;
}
// ÍNDICES DEXIE
export const CASH_REGISTER_STORE =
  "clientTurnId, id, businessId, status, syncStatus, openingDate, [businessId+status]";