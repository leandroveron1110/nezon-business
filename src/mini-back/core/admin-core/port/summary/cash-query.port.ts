export interface CategoryExpenseDTO {
  categoryId: string;
  categoryName: string;
  amount: number;
}
export interface FinancialSummary {
  totalSales: number;
  totalRefunds: number;
  totalExpenses: number;
}

export interface SalesEvolutionItem {
  date: Date;
  amount: number;
}

export interface PaymentMethodSummaryDTO {
  paymentMethod: string;
  amount: number;
}

export interface CategoryExpenseDTO {
  categoryId: string;
  categoryName: string;
  amount: number;
}


export interface CashQueryPort {
  getFinancialSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<FinancialSummary>;

  getSalesEvolution(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<SalesEvolutionItem[]>;

  getPaymentMethodSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<PaymentMethodSummaryDTO[]>;

  getExpensesGroupedByCategory(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<CategoryExpenseDTO[]>;
}
