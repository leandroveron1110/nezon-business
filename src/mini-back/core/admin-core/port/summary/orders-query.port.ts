export interface SalesSummary {
  totalSales: number;
  orderCount: number;
  totalReturns: number;
}

export interface SalesEvolutionItem {
  date: Date;
  amount: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}


export interface OrderCountSummary {
  orderCount: number;
}


export interface OrdersQueryPort {
  getOrderCount(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<OrderCountSummary>;

  getTopSellingProducts(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<TopSellingProduct[]>;
}
