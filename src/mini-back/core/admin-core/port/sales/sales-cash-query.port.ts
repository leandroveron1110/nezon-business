export interface SalesSummaryResult {
  totalSales: number;
  totalRefunds: number;
  totalCogs: number;  // 📦 Costo de lo vendido
  totalWaste: number; // 🗑️ Pérdidas por merma en cocina
}

export interface SalesCashQueryPort {
  getSalesSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<SalesSummaryResult>;

  getSalesEvolution(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      date: Date;
      amount: number;
    }[]
  >;

  getSalesByHour(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      hour: number;
      amount: number;
    }[]
  >;

  getPaymentMethodSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      paymentMethod: string;
      amount: number;
    }[]
  >;

  getSalesByCashRegister(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      cashRegisterId: string;
      cashRegisterName: string;
      amount: number;
    }[]
  >;
}
