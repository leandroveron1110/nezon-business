import { SummaryComparisons } from "./summary-comparisons";
import { SummaryIndicators } from "./summary-indicators";
import { ExpenseSummary, PaymentMethodSummary, SalesEvolutionPoint, SummaryVisualizations, TopProductSummary } from "./summary-visualizations";


export interface SummaryAnalytics {
  salesEvolution: SalesEvolutionPoint[];
  paymentMethods: PaymentMethodSummary[];
  topProducts: TopProductSummary[];
  expenses: ExpenseSummary[];
}

export interface AdministrationSummary {
  indicators: SummaryIndicators;
  comparisons: SummaryComparisons;
  // visualizations: SummaryVisualizations;
  analytics: SummaryAnalytics;
}