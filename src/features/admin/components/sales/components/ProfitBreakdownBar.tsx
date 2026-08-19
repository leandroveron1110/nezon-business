import { formatCurrency } from "@/features/common/utils/sales";

export interface ProfitBreakdownProps {
  totalSales: number;
  totalCogs: number;
  totalWaste: number;
  totalRefunds: number;
  grossProfit: number;
}

export default function ProfitBreakdownBar({ data }: { data: ProfitBreakdownProps }) {
  const { totalSales, totalCogs, totalWaste, totalRefunds, grossProfit } = data;

  if (totalSales <= 0) return null;

  // Calculamos porcentajes sobre el Total Vendido
  const cogsPct = Math.min(100, Math.max(0, (totalCogs / totalSales) * 100));
  const wastePct = Math.min(100, Math.max(0, (totalWaste / totalSales) * 100));
  const refundsPct = Math.min(100, Math.max(0, (totalRefunds / totalSales) * 100));
  const profitPct = Math.max(0, 100 - (cogsPct + wastePct + refundsPct));

  return (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
      {/* Encabezado con la Ganancia Limpia */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Distribución del Ingreso
          </p>
          <h3 className="text-xl font-bold text-gray-900">
            {formatCurrency(totalSales)}{" "}
            <span className="text-xs font-normal text-gray-500">Brutos</span>
          </h3>
        </div>

        <div className="text-right">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {profitPct.toFixed(1)}% Ganancia Neta Bruta
          </span>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {formatCurrency(grossProfit)}
          </p>
        </div>
      </div>

      {/* 📊 BARRA VISUAL DE DESGLOSE */}
      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
        {/* Ganancia limpia */}
        <div
          style={{ width: `${profitPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Ganancia: ${formatCurrency(grossProfit)} (${profitPct.toFixed(1)}%)`}
        />
        {/* COGS (Costo) */}
        <div
          style={{ width: `${cogsPct}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Costo (COGS): ${formatCurrency(totalCogs)} (${cogsPct.toFixed(1)}%)`}
        />
        {/* Mermas */}
        <div
          style={{ width: `${wastePct}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Mermas: ${formatCurrency(totalWaste)} (${wastePct.toFixed(1)}%)`}
        />
        {/* Devoluciones */}
        <div
          style={{ width: `${refundsPct}%` }}
          className="bg-slate-400 transition-all duration-500"
          title={`Devoluciones: ${formatCurrency(totalRefunds)} (${refundsPct.toFixed(1)}%)`}
        />
      </div>

      {/* REFERENCIAS / LEYENDA */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-gray-600">Ganancia:</span>
          <strong className="text-gray-900">{formatCurrency(grossProfit)}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-gray-600">Costo (COGS):</span>
          <strong className="text-gray-900">{formatCurrency(totalCogs)}</strong>
        </div>

        {totalWaste > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-gray-600">Mermas:</span>
            <strong className="text-gray-900">{formatCurrency(totalWaste)}</strong>
          </div>
        )}

        {totalRefunds > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span className="text-gray-600">Devoluciones:</span>
            <strong className="text-gray-900">{formatCurrency(totalRefunds)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}