import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export type CommitmentFlow = 'PAYABLE' | 'RECEIVABLE'; // Pagar vs Cobrar
export type CommitmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';

export interface LocalPendingCommitment {
  idTemp: string;
  id?: string | null;
  businessId: string;
  syncStatus: SyncStatus;
  syncPriority: "HIGH";

  flow: CommitmentFlow;
  status: CommitmentStatus;
  concept: string;               // ej: "Factura Luz Mayo", "Pago Proveedor Insumos"
  entityName?: string;           // Proveedor o Cliente
  
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;                 // Fecha de vencimiento para el Cash Flow

  // RELACIONES OPCIONALES
  fixedExpenseIdTemp?: string;   // Si proviene de un gasto fijo automático
  supplierId?: string;           // Si proviene de compra de insumos
  orderIdTemp?: string;          // Si es una venta a crédito/fiado

  createdAt: Date;
  updatedAt: Date;
}

export const PENDING_COMMITMENT_STORE = 
  "idTemp, id, businessId, flow, status, dueDate, syncStatus";