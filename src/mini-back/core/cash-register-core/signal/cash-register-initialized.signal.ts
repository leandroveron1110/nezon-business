export interface CashRegisterInitializedSignal {
  readonly type: 'CASH_REGISTER_INITIALIZED';
  readonly payload: {
    cashRegisterId: string;
    businessId: string;
    openedByUserId: string;
    openingDate: Date;
  };
}