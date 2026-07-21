export interface SummaryCalculatedSignal {
  readonly type: 'SUMMARY_CALCULATED';
  readonly payload: {
    businessId: string;
    cashRegisterId: string;
    closingAmount: number;
  };
}