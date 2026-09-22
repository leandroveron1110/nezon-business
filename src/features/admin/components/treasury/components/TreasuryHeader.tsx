"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Wallet,
  Plus,
} from "lucide-react";

interface TreasuryHeaderProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenTransferModal: () => void;
  onOpenCreateAccount: () => void;
}

export function TreasuryHeader({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenTransferModal,
  onOpenCreateAccount,
}: TreasuryHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Lado izquierdo: Información de Tesorería */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
            <Wallet className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Tesorería
              </span>
            </div>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Gestioná los ingresos, egresos y transferencias de tus fondos.
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Ingresar dinero */}
          <button
            type="button"
            onClick={onOpenIncomeModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            <span>Ingresar Dinero</span>
          </button>

          {/* Sacar dinero */}
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
            <span>Sacar Dinero</span>
          </button>

          {/* Transferir entre cuentas */}
          <button
            type="button"
            onClick={onOpenTransferModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ArrowRightLeft className="h-4 w-4 text-slate-500" />
            <span>Transferir</span>
          </button>

          {/* Nueva cuenta */}
          <button
            type="button"
            onClick={onOpenCreateAccount}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
          >
            <Plus className="h-4 w-4 text-slate-300" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>
    </header>
  );
}
