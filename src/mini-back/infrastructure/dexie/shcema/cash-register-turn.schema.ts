// src/common/database/schema/cash-register.schema.ts

import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalCashRegisterTurn {
  // UUID local generado inmediatamente.
  idTemp: string;
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
  cashRegisterId: string; // FK a LocalCashRegister (Saber EN QUÉ punto de venta operó)
  treasuryAccountIdTemp: string; // FK a LocalTreasuryAccount (Saber QUÉ cuenta de efectivo afectó)
  // AUDITORÍA
  createdAt: Date;
  updatedAt: Date;
}
// ÍNDICES DEXIE
export const CASH_REGISTER_TURN_STORE =
  "idTemp, id, businessId, status, syncStatus, openingDate, [businessId+status], [businessId+cashRegisterId+status]";
