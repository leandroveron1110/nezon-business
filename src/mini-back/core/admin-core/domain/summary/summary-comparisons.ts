// Comparaciones de indicadores principales
export interface SummaryComparison {
  current: number; // Valor actual del indicador
  previous: number; // Valor del indicador en el periodo anterior
  variation: number; // Diferencia entre el valor actual y el valor anterior
  variationPercentage: number; // Porcentaje de variación entre el valor actual y el valor anterior
}

// Comparaciones de indicadores principales
export interface SummaryComparisons {
  todayVsYesterday: SummaryComparison; // Comparación de ventas de hoy vs ayer
  weekVsPreviousWeek: SummaryComparison; // Comparación de ventas de la semana vs la semana anterior
  monthVsPreviousMonth: SummaryComparison; // Comparación de ventas del mes vs el mes anterior
}