import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalFixedExpense {
  idTemp: string;
  id?: string | null;
  businessId: string;
  syncStatus: SyncStatus;
  syncPriority: "HIGH" | "LOW";

  concept: string;              // ej: "Luz", "Alquiler", "Internet"
  amount: number;               // Monto base/estimado
  durationMonths: number;       // Frecuencia (1 = mensual, 2 = bimestral)
  monthlyCost: number;          // amount / durationMonths (calculado)
  dueDay?: number;              // Día habitual de vencimiento (1 al 31)
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const FIXED_EXPENSE_STORE = 
  "idTemp, id, businessId, syncStatus, isActive";