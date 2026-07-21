// src/common/database/schema/cash-register.schema.ts

import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

// ============================================================================
// CAJA LOCAL
// ============================================================================
//
// Esta entidad NO representa el dominio CashRegister.
//
// Representa el snapshot persistente que permite reconstruir el estado de la
// caja luego de:
//
// - refresh
// - cierre del navegador
// - reinicio del dispositivo
// - pérdida de internet
//
// La sincronización con el servidor ocurre posteriormente mediante el
// SyncQueueWorker.
// ============================================================================

export interface LocalCashRegisterTurn {
  // ==========================================================================
  // IDENTIFICACIÓN
  // ==========================================================================

  // UUID local generado inmediatamente.
  // Es la clave primaria real dentro de IndexedDB.
  clientTurnId: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  // ==========================================================================
  // SINCRONIZACIÓN
  // ==========================================================================

  syncStatus: SyncStatus;

  syncPriority: "HIGH" | "LOW";

  // ==========================================================================
  // RESPONSABLES
  // ==========================================================================

  openedByUserId: string;

  closedByUserId?: string;

  // ==========================================================================
  // APERTURA
  // ==========================================================================

  openingDate: Date;

  openingAmount: number;

  openingNotes?: string;

  // ==========================================================================
  // CIERRE
  // ==========================================================================

  closingDate?: Date;

  declaredClosingAmount?: number;

  systemClosingAmount?: number;

  difference?: number;

  closingNotes?: string;

  status: CashRegisterStatus;

  // ==========================================================================
  // AUDITORÍA
  // ==========================================================================

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================================
// ÍNDICES DEXIE
// ============================================================================

export const CASH_REGISTER_STORE =
  "clientTurnId, id, businessId, status, syncStatus, openingDate";