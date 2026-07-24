// mini-back/core/cash-register-core/domain/cash-register-totals.ts
export interface CashRegisterTotals {
  cash: number;
  card: number;
  transfer: number;
  total: number;
}