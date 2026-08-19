import { formatCurrency } from "@/features/common/utils/sales";
import MetricCard from "./MetricCard";
import {
  Banknote,
  CreditCard,
  ShoppingBag,
  WalletCards,
  Package,
  Trash2,
  TrendingUp,
  Coins,
} from "lucide-react";

export interface SalesSummaryData {
  totalSales: number;
  totalRefunds: number;
  netSales: number;
  totalCogs: number;
  totalWaste: number;
  grossMargin: number;
  grossMarginPercentage: number;
  grossProfit: number;
  orderCount: number;
  averageTicket: number;
}

export default function SalesSummary({ data }: { data: SalesSummaryData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <MetricCard
        title="Total vendido"
        value={formatCurrency(data.totalSales)}
        icon={Banknote}
      />

      <MetricCard
        title="Ventas netas"
        value={formatCurrency(data.netSales)}
        icon={WalletCards}
      />

      <MetricCard
        title="Pedidos"
        value={data.orderCount.toLocaleString("es-AR")}
        icon={ShoppingBag}
      />

      <MetricCard
        title="Ticket promedio"
        value={formatCurrency(data.averageTicket)}
        icon={CreditCard}
      />

      <MetricCard
        title="Devoluciones"
        value={formatCurrency(data.totalRefunds)}
        icon={WalletCards}
      />

      {/* 📦 MÉTRIÇAS FINANCIERAS Y ADMINISTRATIVAS */}
      <MetricCard
        title="Costo mercadería (COGS)"
        value={formatCurrency(data.totalCogs)}
        icon={Package}
      />

      <MetricCard
        title="Mermas / Desperdicio"
        value={formatCurrency(data.totalWaste)}
        icon={Trash2}
      />

      <MetricCard
        title="Margen bruto"
        value={`${data.grossMarginPercentage.toFixed(1)}%`}
        icon={TrendingUp}
      />

      <MetricCard
        title="Ganancia bruta"
        value={formatCurrency(data.grossProfit)}
        icon={Coins}
      />
    </div>
  );
}