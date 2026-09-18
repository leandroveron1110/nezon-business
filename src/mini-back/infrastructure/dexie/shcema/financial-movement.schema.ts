import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";


export interface LocalFinancialMovement {
  // IDENTIFICACIÓN
  // UUID local generado inmediatamente.
  idTemp: string;
  // UUID definitivo asignado por el servidor.
  id?: string | null;
  businessId: string;
  // SINCRONIZACIÓN
  syncStatus: SyncStatus;
  syncPriority: "HIGH";
  // RESPONSABLES
  userId: string;
  approvedByUserId?: string;
  // MOVIMIENTO
  type: FinancialMovementType;
  status: FinancialMovementStatus;
  amount: number;
  paymentMethod?: PaymentMethodTypeFinancial;
  description: string;
  notes?: string;
  externalReference?: string;
  // Orden cronológico dentro de una misma orden o caja.
  sequence: number;
  date: Date;
  // RELACIONES
  // Orden local (antes de sincronizar).
  orderIdTemp?: string;
  // Orden sincronizada.
  orderId?: string;
  // Caja local donde se registró el movimiento.
  cashRegisterTurnIdTemp?: string;
  // Caja sincronizada.
  cashRegisterTurnId?: string;
  // Caja de referencia (por ejemplo para refunds).
  referenceCashRegisterTurnId?: string;
  // AUDITORÍA
  createdAt: Date;
  updatedAt: Date;

  // NUEVOS CAMPOS OPCIONALES DE TESORERÍA:
  // Cuenta de origen/destino (ej: Mercado Pago en vez del turno de caja diario)
 treasuryAccountIdTemp?: string;
 treasuryAccountId?: string;

  /**
   * Identificador que vincula dos movimientos que
   * pertenecen a una misma transferencia interna.
   *
   * Solo aplica a:
   *
   * - INTERNAL_TRANSFER_OUT
   * - INTERNAL_TRANSFER_IN
   */
  transferGroupId?: string;

  // Si el movimiento es el pago de un Gasto Fijo de Estructura
  fixedExpenseIdTemp?: string;
  
  // Si el movimiento liquida una Cuenta por Pagar / Cobrar
  pendingCommitmentIdTemp?: string;

}

export const FINANCIAL_MOVEMENT_STORE =
  "idTemp, id, businessId, cashRegisterTurnIdTemp, cashRegisterTurnId, orderIdTemp, orderId,treasuryAccountIdTemp,treasuryAccountIdTemp, type, status, paymentMethod, syncStatus, date";