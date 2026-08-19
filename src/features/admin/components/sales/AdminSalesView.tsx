"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Banknote,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  Store,
  WalletCards,
  X,
} from "lucide-react";
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

interface AdminSalesProps {
  businessId: string;
}

export default function AdminSales({ businessId }: AdminSalesProps) {
  const [period, setPeriod] = useState<SalesPeriod>("today");

  // Estado para guardar el rango personalizado cuando el usuario lo selecciona
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>(
    () => {
      const defaultRange = getSalesPeriodRange("today");
      return { from: defaultRange.from, to: defaultRange.to };
    },
  );

  // Calculamos el rango de fechas activo según el período o customRange
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

        <SalesPeriodSelector
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* =====================================================================
          LOADING
      ===================================================================== */}

      {loading && <SalesSkeleton />}

      {/* =====================================================================
          ERROR
      ===================================================================== */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar la información de ventas.
          </p>

          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* =====================================================================
          DATA
      ===================================================================== */}

      {!loading && !error && data && (
        <>
          {/* KPIs */}
          <SalesSummary data={data.summary} />

          {/* Evolución */}
          <SalesEvolution data={data.evolution} />

          {/* Métodos de pago + cajas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PaymentMethods data={data.paymentMethods} />

            <CashRegisters data={data.byCashRegister} />
          </div>

          {/* Tipo de pedido + horarios */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesByOrderType data={data.byOrderType} />

            <SalesByHour data={data.byHour} />
          </div>
        </>
      )}
    </div>
  );
}
