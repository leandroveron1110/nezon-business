"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Receipt,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { useAdministrationSummary } from "../../hooks/useAdministrationSummary";

interface Props {
  businessId: string;
}

const BG_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-indigo-500",
];

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

  // Cálculo para escala del gráfico de barras de evolución
  const maxSalesAmount = Math.max(
    ...analytics.salesEvolution.map((item) => item.amount),
    1,
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen General</h1>
          <p className="text-slate-500 text-sm">
            Métricas clave, analíticas de ventas y rendimiento del negocio.
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

      {/* ── BLOQUE 2: INDICADORES CLAVE (KPIs) ──────────────────────────────── */}
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

      {/* ── BLOQUE 3: GRÁFICO EVOLUCIÓN DE VENTAS (NATIVO TAILWIND) ─────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Evolución de Ventas
        </h2>
        {analytics.salesEvolution.length === 0 ? (
          <p className="text-sm text-slate-400">
            Sin datos de ventas en este período.
          </p>
        ) : (
          <div className="flex items-end gap-2 h-48 pt-6 border-b border-slate-100 overflow-x-auto">
            {analytics.salesEvolution.map((item) => {
              const heightPercent = (item.amount / maxSalesAmount) * 100;
              return (
                <div
                  key={item.date}
                  className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group relative"
                >
                  {/* Tooltip Hover */}
                  <div className="absolute -top-8 hidden group-hover:flex bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow whitespace-nowrap z-10">
                    ${item.amount.toLocaleString("es-AR")}
                  </div>
                  {/* Barra */}
                  <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t-md"
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                  {/* Etiqueta Día */}
                  <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                    {item.date.split("-").slice(1).join("/")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BLOQUE 4: MÉTODOS DE PAGO Y PRODUCTOS MÁS VENDIDOS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen Métodos de Pago */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Resumen por Método de Pago
          </h2>
          <div className="space-y-4">
            {analytics.paymentMethods.map((pm, index) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">{pm.method}</span>
                  <span className="text-slate-900 font-bold">
                    ${pm.amount.toLocaleString("es-AR")}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      ({pm.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${BG_COLORS[index % BG_COLORS.length]}`}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Productos Más Vendidos
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {analytics.topProducts.map((prod, i) => (
              <div
                key={prod.productId}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {prod.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {prod.quantity} unidades vendidas
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  ${prod.revenue.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BLOQUE 5: RESUMEN DE GASTOS POR CATEGORÍA ──────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Resumen de Gastos
        </h2>
        {analytics.expenses.length === 0 ? (
          <p className="text-sm text-slate-400">
            No se registraron gastos en este período.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface ComparisonCardProps {
  title: string;
  comparison: {
    current: number;
    previous: number;
    variation: number;
    variationPercentage: number;
  };
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  comparison,
}) => {
  const isPositive = comparison.variation >= 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex items-baseline justify-between mt-2">
        <span className="text-2xl font-extrabold text-slate-800">
          ${comparison.current.toLocaleString("es-AR")}
        </span>
        <div
          className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          )}
          {Math.abs(comparison.variationPercentage).toFixed(1)}%
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-1">
        Período anterior: ${comparison.previous.toLocaleString("es-AR")}
      </span>
    </div>
  );
};

interface KpiMiniCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color:
    | "blue"
    | "indigo"
    | "violet"
    | "emerald"
    | "amber"
    | "rose"
    | "red"
    | "teal";
}

const KpiMiniCard: React.FC<KpiMiniCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-slate-400 truncate">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800 truncate">{value}</div>
        {subtitle && (
          <div className="text-[10px] text-slate-400 mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
