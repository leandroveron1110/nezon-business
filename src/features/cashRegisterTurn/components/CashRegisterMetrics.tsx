"use client";

import { Wallet, CreditCard, ArrowUpRight, Receipt } from "lucide-react";

interface Totals {
  cash: number;
  card: number;
  transfer: number;
  total: number;
}

interface Props {
  expectedCashInDrawer: number;
  initialCash: number;
  totals: Totals;
}

export function CashRegisterMetrics({
  expectedCashInDrawer,
  initialCash,
  totals,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Métrica Principal: Efectivo físico en cajón */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Efectivo en Cajón</span>
          <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400 backdrop-blur-xs">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black tracking-tight text-white">
            ${expectedCashInDrawer.toLocaleString("es-AR")}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Fondo (${initialCash.toLocaleString()}) + Neto efec. (${totals.cash.toLocaleString()})
          </p>
        </div>
      </div>

      {/* 2. Ventas/Movimientos en Tarjetas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tarjetas (Déb/Cré)</span>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">
            ${totals.card.toLocaleString("es-AR")}
          </p>
          <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
            Acreditación directa
          </span>
        </div>
      </div>

      {/* 3. Transferencias */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Transferencias</span>
          <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">
            ${totals.transfer.toLocaleString("es-AR")}
          </p>
          <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
            Bancos y billeteras
          </span>
        </div>
      </div>

      {/* 4. Balance General del Turno */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Operado</span>
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900">
            ${totals.total.toLocaleString("es-AR")}
          </p>
          <span className="mt-1 inline-block text-[11px] font-medium text-slate-400">
            Suma neta de métodos
          </span>
        </div>
      </div>
    </div>
  );
}