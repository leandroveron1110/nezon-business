export interface ClosingAmountCalculatedSignal {
  readonly type: 'CLOSING_AMOUNT_CALCULATED';
  readonly payload: {
    businessId: string;
    cashRegisterId: string;
    systemAmount: number;
  };
}