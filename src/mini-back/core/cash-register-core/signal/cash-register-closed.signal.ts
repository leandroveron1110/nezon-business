export interface CashRegisterClosedSignal {
  readonly type: 'CASH_REGISTER_CLOSED';
  readonly payload: {
    cashRegisterId: string;
    businessId: string;
    closedByUserId: string;
    closingDate: Date;
    declaredAmount: number;
    systemAmount: number;
    difference: number;
  };
}