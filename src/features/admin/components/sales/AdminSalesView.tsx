"use client";

import { useMemo, useState } from "react";
import { BarChart3, LayoutGrid, Layers } from "lucide-react";
import { useAdminSales } from "../../hooks/useAdminSales";
import {
  getSalesPeriodRange,
  SalesPeriod,
} from "@/features/common/utils/sales";
import SalesPeriodSelector from "./components/SalesPeriodSelector";
import SalesSkeleton from "./components/SalesSkeleton";
import SalesSummary from "./components/SalesSummary";
import SalesEvolution from "./components/SalesEvolution";
import PaymentMethods from "./components/PaymentMethods";
import CashRegisters from "./components/CashRegisters";
import SalesByOrderType from "./components/SalesByOrderType";
import SalesByHour from "./components/SalesByHour";
import ProfitBreakdownBar from "./components/ProfitBreakdownBar";
import { useAdministrationSummary } from "../../hooks/useAdministrationSummary";
import { formatPrice } from "@/features/common/utils/formatPrice";

interface AdminSalesProps {
  businessId: string;
}

type ViewMode = "both" | "chart" | "kpis";

export default function AdminSales({ businessId }: AdminSalesProps) {
  const [period, setPeriod] = useState<SalesPeriod>("today");
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  // Rango personalizado de fechas
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>(
    () => {
      const defaultRange = getSalesPeriodRange("today");
      return { from: defaultRange.from, to: defaultRange.to };
    },
  );

  const range = useMemo(() => {
    if (period === "custom") {
      return customRange;
    }
    return getSalesPeriodRange(period);
  }, [period, customRange]);

  const { data, loading, error } = useAdminSales({
    businessId,
    from: range.from,
    to: range.to,
  });

  // CORREGIDO: Ahora escucha a `range` para actualizarse al cambiar de período (Hoy/Semana/Mes)
  const { summary } = useAdministrationSummary(
    range.from,
    range.to,
    businessId,
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* =====================================================================
          HEADER
      ===================================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analizá las ventas y el movimiento comercial de tu negocio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SELECTOR DE MODO DE VISTA */}
          <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("both")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "both"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Mostrar Vista Completa"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ambos</span>
            </button>

            <button
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "chart"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Mostrar Gráfico de Distribución"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gráfico</span>
            </button>

            <button
              onClick={() => setViewMode("kpis")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "kpis"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Mostrar Tarjetas de KPIs"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">KPIs</span>
            </button>
          </div>

          {/* SELECTOR DE PERÍODO */}
          <SalesPeriodSelector
            value={period}
            onChange={setPeriod}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>
      </div>

      {/* =====================================================================
          LOADING & ERROR
      ===================================================================== */}
      {loading && <SalesSkeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar la información de ventas.
          </p>
          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* =====================================================================
          DATA & VISTAS DINÁMICAS
      ===================================================================== */}
      {!loading && !error && data && (
        <>
          {/* VISTA DE GRÁFICO DE DISTRIBUCIÓN (PROFIT BREAKDOWN) */}
          {(viewMode === "both" || viewMode === "chart") && (
            <ProfitBreakdownBar data={data.summary} />
          )}

          {/* VISTA DE KPIS RESUMEN */}
          {(viewMode === "both" || viewMode === "kpis") && (
            <SalesSummary data={data.summary} />
          )}

          {/* Evolución de Ventas */}
          <SalesEvolution data={data.evolution} />

          {/* Métodos de pago + Cajas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PaymentMethods data={data.paymentMethods} />
            <CashRegisters data={data.byCashRegister} />
          </div>

          {/* Tipo de pedido + Horarios */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesByOrderType data={data.byOrderType} />
            <SalesByHour data={data.byHour} />
          </div>

          {/* Productos Más Vendidos */}
          {summary?.analytics?.topProducts &&
            summary.analytics.topProducts.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Productos con Mayor Rotación
                </h2>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {summary.analytics.topProducts
                    .slice(0, 5)
                    .sort((a, b) => b.quantity - a.quantity)
                    .map((prod, i) => (
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
                          {formatPrice(prod.revenue)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
