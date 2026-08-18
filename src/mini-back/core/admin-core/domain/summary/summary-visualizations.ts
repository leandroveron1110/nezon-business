// Visualizaciones de resumen
export interface SalesEvolutionPoint {
  date: string; // Fecha del punto de evolución de ventas
  amount: number; // Monto de ventas en esa fecha
}

// Resumen de métodos de pago
export interface PaymentMethodSummary {
  method: string; // Método de pago
  amount: number; // Monto total por método de pago
  percentage: number; // Porcentaje del total de ventas
}

export interface TopProductSummary {
  productId: string; // ID del producto
  productName: string; // Nombre del producto
  quantity: number; // Cantidad vendida
  revenue: number; // Ingresos generados
}

export interface ExpenseSummary {
  categoryId: string; // ID de la categoría de gastos
  categoryName: string; // Nombre de la categoría de gastos
  amount: number; // Monto de gastos
  percentage: number; // Porcentaje del total de gastos
}

export interface SummaryVisualizations {
  salesEvolution: SalesEvolutionPoint[];
  paymentMethods: PaymentMethodSummary[];
  topProducts: TopProductSummary[];
  expenses: ExpenseSummary[];
}