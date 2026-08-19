"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Receipt,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { useAdministrationSummary } from "../../hooks/useAdministrationSummary";
import ComparisonCard from "./components/ComparisonCard";
import KpiMiniCard from "./components/KpiMiniCard";

interface Props {
  businessId: string;
}

export const AdministrationSummaryDashboard: React.FC<Props> = ({
  businessId,
}) => {
  const [dateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { from, to };
  });

  const { summary, loading, error } = useAdministrationSummary(
    dateRange.from,
    dateRange.to,
    businessId,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
        <p className="font-semibold">
          {error || "No se pudo cargar la información."}
        </p>
      </div>
    );
  }

  const { indicators, comparisons, analytics } = summary;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen General</h1>
          <p className="text-slate-500 text-sm">
            Salud financiera general, comparativas de rendimiento y balance operativo.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-slate-600 text-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {dateRange.from.toLocaleDateString("es-AR")} -{" "}
            {dateRange.to.toLocaleDateString("es-AR")}
          </span>
        </div>
      </div>

      {/* ── BLOQUE 1: COMPARACIONES DESTACADAS ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComparisonCard
          title="Ventas Hoy vs Ayer"
          comparison={comparisons.todayVsYesterday}
        />
        <ComparisonCard
          title="Semana Actual vs Anterior"
          comparison={comparisons.weekVsPreviousWeek}
        />
        <ComparisonCard
          title="Mes Actual vs Anterior"
          comparison={comparisons.monthVsPreviousMonth}
        />
      </div>

      {/* ── BLOQUE 2: INDICADORES CLAVE (KPIS DE SALUD FINANCIERA) ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiMiniCard
          title="Ventas Hoy"
          value={`$${indicators.salesToday.toLocaleString("es-AR")}`}
          icon={DollarSign}
          color="blue"
        />
        <KpiMiniCard
          title="Ventas Semana"
          value={`$${indicators.salesWeek.toLocaleString("es-AR")}`}
          icon={DollarSign}
          color="indigo"
        />
        <KpiMiniCard
          title="Ventas Mes"
          value={`$${indicators.salesMonth.toLocaleString("es-AR")}`}
          icon={DollarSign}
          color="violet"
        />
        <KpiMiniCard
          title="Pedidos"
          value={indicators.orderCount.toString()}
          icon={ShoppingBag}
          color="emerald"
        />
        <KpiMiniCard
          title="Ticket Prom."
          value={`$${Math.round(indicators.averageTicket).toLocaleString("es-AR")}`}
          icon={Receipt}
          color="amber"
        />
        <KpiMiniCard
          title="Devoluciones"
          value={`$${indicators.totalReturns.toLocaleString("es-AR")}`}
          icon={RotateCcw}
          color="rose"
        />
        <KpiMiniCard
          title="Total Gastos"
          value={`$${indicators.totalExpenses.toLocaleString("es-AR")}`}
          icon={TrendingDown}
          color="red"
        />
        <KpiMiniCard
          title="Ganancia Est."
          value={`$${Math.round(indicators.estimatedProfit ?? 0).toLocaleString("es-AR")}`}
          subtitle={`${(indicators.estimatedMargin ?? 0).toFixed(1)}% marg.`}
          icon={TrendingUp}
          color="teal"
        />
      </div>

      {/* ── BLOQUE 3: IMPACTO DE GASTOS OPERATIVOS ───────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Resumen de Gastos por Categoría
        </h2>
        {analytics.expenses.length === 0 ? (
          <p className="text-sm text-slate-400">
            No se registraron gastos en este período.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.expenses.map((exp) => (
              <div
                key={exp.categoryId}
                className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-sm">
                    {exp.categoryName}
                  </span>
                  <span className="font-bold text-red-600 text-sm">
                    ${exp.amount.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="w-full bg-red-100 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${exp.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  {exp.percentage.toFixed(1)}% del total de gastos
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};