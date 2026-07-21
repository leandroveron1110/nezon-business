import { PaymentSummary } from "./payment-summary";

export interface CashSummary {
  openingAmount: number;

  summaryByType: {
    sales: number;
    refunds: number;
    incomes: number;
    expenses: number;
  };

  summaryByMethod: PaymentSummary[];

  closingAmount: number;
}