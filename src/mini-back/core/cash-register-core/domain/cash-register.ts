import { CashRegisterStatus } from "./cash-register-status.enum";

export interface CashRegister {
  id?: string;

  clientTurnId?: string;

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

  status: CashRegisterStatus;
}