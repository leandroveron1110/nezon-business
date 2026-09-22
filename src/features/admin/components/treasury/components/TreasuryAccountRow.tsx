"use client";

import { Banknote, Building2, Landmark, Wallet } from "lucide-react";
import {
  TreasuryAccount,
  TreasuryAccountType,
} from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";

const TYPE_CONFIG: Record<
  TreasuryAccountType,
  { label: string; icon: React.ElementType }
> = {
  CASH: { label: "Efectivo", icon: Banknote },
  BANK: { label: "Banco", icon: Landmark },
  DIGITAL_WALLET: { label: "Billetera digital", icon: Wallet },
  SAFE_BOX: { label: "Caja fuerte", icon: Building2 },
};

interface TreasuryAccountRowProps {
  account: TreasuryAccount;
}

export function TreasuryAccountRow({ account }: TreasuryAccountRowProps) {
  const config = TYPE_CONFIG[account.type];
  const Icon = config?.icon ?? Wallet;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="group flex flex-col gap-3 p-4 transition hover:bg-slate-50/60 md:grid md:grid-cols-12 md:items-center md:px-6 md:py-4">
      {/* Cuenta */}
      <div className="col-span-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/60 transition-colors group-hover:bg-white group-hover:text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {account.name}
          </p>
          <p className="text-xs text-slate-500 md:hidden">
            {config?.label ?? account.type}
          </p>
        </div>
      </div>

      {/* Tipo */}
      <div className="col-span-3 hidden md:block">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {config?.label ?? account.type}
        </span>
      </div>

      {/* Estado */}
      <div className="col-span-2 flex items-center justify-between md:justify-center">
        <span className="text-xs text-slate-400 md:hidden">Estado</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            account.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              account.isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {account.isActive ? "Activa" : "Inactiva"}
        </span>
      </div>

      {/* Saldo */}
      <div className="col-span-2 flex items-center justify-between md:block md:text-right">
        <span className="text-xs text-slate-400 md:hidden">Saldo</span>
        <div>
          <p className="text-sm font-bold tabular-nums text-slate-900">
            {formatCurrency(
              Number(account.currentBalance) || 0,
              account.currency || "ARS"
            )}
          </p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            {account.currency || "ARS"}
          </p>
        </div>
      </div>
    </div>
  );
}