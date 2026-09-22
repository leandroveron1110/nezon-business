"use client";

import { Plus, Wallet } from "lucide-react";
import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { TreasuryAccountRow } from "./TreasuryAccountRow";

interface TreasuryAccountsListProps {
  accounts: TreasuryAccount[];
  onCreateAccountClick: () => void;
}

export function TreasuryAccountsList({
  accounts,
  onCreateAccountClick,
}: TreasuryAccountsListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-900">
          Cuentas configuradas
        </h2>
        <span className="text-xs font-medium text-slate-500">
          {accounts.length} {accounts.length === 1 ? "cuenta" : "cuentas"}
        </span>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs ring-1 ring-slate-200">
            <Wallet className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No tenés cuentas registradas
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Creá tu primera cuenta de tesorería para comenzar a controlar el
            flujo de caja de tu negocio.
          </p>
          <button
            type="button"
            onClick={onCreateAccountClick}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Crear primera cuenta
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="hidden grid-cols-12 items-center border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-xs font-medium text-slate-500 md:grid">
            <div className="col-span-5">Cuenta</div>
            <div className="col-span-3">Tipo</div>
            <div className="col-span-2 text-center">Estado</div>
            <div className="col-span-2 text-right">Saldo</div>
          </div>

          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <TreasuryAccountRow key={account.idTemp} account={account} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}