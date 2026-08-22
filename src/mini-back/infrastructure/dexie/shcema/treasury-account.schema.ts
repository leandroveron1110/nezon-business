import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export type TreasuryAccountType = 'CASH_REGISTER' | 'BANK' | 'DIGITAL_WALLET' | 'SAFE_BOX';

export interface LocalTreasuryAccount {
  idTemp: string;
  id?: string | null;
  businessId: string;
  syncStatus: SyncStatus;
  syncPriority: "HIGH";

  name: string;                  // "Caja Mostrador", "Mercado Pago", "Banco Galicia"
  type: TreasuryAccountType;
  currency: string;              // "ARS", "USD"
  currentBalance: number;        // Saldo total acumulado
  
  // Vinculación opcional con la caja diaria si el tipo es CASH_REGISTER
  activeCashRegisterTurnIdTemp?: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TREASURY_ACCOUNT_STORE = 
  "idTemp, id, businessId, type, syncStatus, isActive";