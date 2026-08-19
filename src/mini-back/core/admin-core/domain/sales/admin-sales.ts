export interface AdminSales {
  summary: SalesSummary;

  paymentMethods: SalesPaymentMethod[];

  evolution: SalesEvolutionItem[];

  byHour: SalesByHourItem[];

  byOrderType: SalesByOrderType[];

  byCashRegister: SalesByCashRegister[];

  comparison?: SalesComparison;
}


export interface SalesSummary {
  totalSales: number;

  orderCount: number;

  totalCogs: number;

  totalWaste: number;

  grossMargin: number;

  grossMarginPercentage: number;

  grossProfit: number;

  averageTicket: number;

  totalRefunds: number;

  netSales: number;
}

export interface SalesPaymentMethod {
  method: string;

  amount: number;

  percentage: number;
}

export interface SalesEvolutionItem {
  date: string;

  amount: number;
}

export interface SalesByHourItem {
  hour: number;

  amount: number;
}

export interface SalesByOrderType {
  type: string;

  orderCount: number;

  amount: number;

  percentage: number;
}

export interface SalesByCashRegister {
  cashRegisterId: string;

  cashRegisterName: string;

  amount: number;

  percentage: number;
}

export interface SalesComparison {
  current: number;

  previous: number;

  variation: number;

  variationPercentage: number;
}