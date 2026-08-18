
// Indicadores principales
export interface SummaryIndicators {
  salesToday: number; // Ventas de hoy
  salesWeek: number; // Ventas de la semana
  salesMonth: number; // Ventas del mes

  orderCount: number; // Cantidad de pedidos
  averageTicket: number; // Ticket promedio

  totalReturns: number; // Devoluciones totales
  totalExpenses: number; // Gastos totales

  estimatedProfit?: number | null; // Ganancia estimada
  estimatedMargin?: number | null; // Margen estimado
}