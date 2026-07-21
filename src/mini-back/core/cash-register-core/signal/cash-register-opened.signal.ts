export interface CashRegisterOpenedSignal {
  readonly type: 'CASH_REGISTER_OPENED';
  readonly payload: {
    cashRegisterId: string;
    businessId: string;
    openedByUserId: string;
    openingDate: Date;
    openingAmount: number;
  };
}