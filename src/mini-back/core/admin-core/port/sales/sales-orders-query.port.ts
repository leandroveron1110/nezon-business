export interface SalesOrdersQueryPort {
  getOrderCount(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<number>;

  getSalesByOrderType(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      type: string;
      orderCount: number;
    }[]
  >;
}