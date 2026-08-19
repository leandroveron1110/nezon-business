import { formatCurrency } from "@/features/common/utils/sales";
import MetricCard from "./MetricCard";
import { Banknote, CreditCard, ShoppingBag, WalletCards } from "lucide-react";

export default function SalesSummary({
  data,
}: {
  data: {
    totalSales: number;
    totalRefunds: number;
    netSales: number;
    orderCount: number;
    averageTicket: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
    </div>
  );
}
