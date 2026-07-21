import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";


// ============================================================================
// MOVIMIENTO FINANCIERO LOCAL
// ============================================================================
//
// Esta entidad NO representa el dominio FinancialMovement.
//
// Representa el snapshot persistente de todos los movimientos registrados
// por Caja.
//
// Permite reconstruir completamente:
//
// - ventas
// - devoluciones
// - ingresos
// - gastos
// - arqueos
// - cierres de caja
//
// incluso trabajando completamente offline.
//
// La sincronización con el servidor ocurre posteriormente mediante el
// SyncQueueWorker.
// ============================================================================

export interface LocalFinancialMovement {
  // ==========================================================================
  // IDENTIFICACIÓN
  // ==========================================================================

  // UUID local generado inmediatamente.
  // Es la clave primaria real dentro de IndexedDB.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  // ==========================================================================
  // SINCRONIZACIÓN
  // ==========================================================================

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  // ==========================================================================
  // RESPONSABLES
  // ==========================================================================

  userId: string;

  approvedByUserId?: string;

  // ==========================================================================
  // MOVIMIENTO
  // ==========================================================================

  type: FinancialMovementType;

  status: FinancialMovementStatus;

  amount: number;

  paymentMethod: PaymentMethodTypeFinancial;

  description: string;

  notes?: string;

  externalReference?: string;

  // Orden cronológico dentro de una misma orden o caja.
  sequence: number;

  date: Date;

  // ==========================================================================
  // RELACIONES
  // ==========================================================================

  // Orden local (antes de sincronizar).
  orderIdTemp?: string;

  // Orden sincronizada.
  orderId?: string;

  // Caja local donde se registró el movimiento.
  cashRegisterTurnIdTemp: string;

  // Caja sincronizada.
  cashRegisterTurnId?: string;

  // Caja de referencia (por ejemplo para refunds).
  referenceCashRegisterTurnId?: string;

  // ==========================================================================
  // AUDITORÍA
  // ==========================================================================

  createdAt: Date;

  updatedAt: Date;
}

// ============================================================================
// ÍNDICES DEXIE
// ============================================================================

export const FINANCIAL_MOVEMENT_STORE =
  "idTemp, id, businessId, cashRegisterTurnIdTemp, cashRegisterTurnId, orderIdTemp, orderId, type, status, paymentMethod, syncStatus, date";