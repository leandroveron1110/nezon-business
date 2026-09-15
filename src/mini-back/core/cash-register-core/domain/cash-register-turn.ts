import { CashRegisterTurnStatus } from "./cash-register-turn-status.enum";

export interface CashRegisterTurn {
  id?: string;

  idTemp?: string;

  cashRegisterId: string;

  businessId: string;

  openedByUserId: string;
  closedByUserId?: string;

  openingDate: Date;
  openingAmount: number;
  openingNotes?: string;

  closingDate?: Date;
  declaredClosingAmount?: number;
  systemClosingAmount?: number;
  difference?: number;
  closingNotes?: string;

  treasuryAccountId: string;

  status: CashRegisterTurnStatus;
}