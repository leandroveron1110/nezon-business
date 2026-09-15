"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  Landmark,
  MoreHorizontal,
  Plus,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

import {
  TreasuryAccount,
  TreasuryAccountType,
} from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";
import { CreateTreasuryAccount } from "@/features/admin/components/treasury/components/CreateTreasuryAccount";
import { TransferTreasuryModal } from "./components/TransferTreasuryModal";

interface TreasuryPageProps {
  businessId: string;
}

const TYPE_CONFIG: Record<
  TreasuryAccountType,
  {
    label: string;
    icon: React.ElementType;
  }
> = {
  CASH: { label: "Efectivo", icon: Banknote },
  BANK: { label: "Banco", icon: Landmark },
  DIGITAL_WALLET: { label: "Billetera digital", icon: Wallet },
  SAFE_BOX: { label: "Caja fuerte", icon: Building2 },
};

export default function TreasuryPage({ businessId }: TreasuryPageProps) {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!businessId) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const orchestrator = new TreasuryAccountOrchestrator();
      const treasuryAccounts = await orchestrator.findByBusinessId(businessId);

      const recalculatedAccounts = await Promise.all(
        treasuryAccounts.map(
          async (account) =>
            await orchestrator.recalculateBalance(businessId, account.idTemp),
        ),
      );

      setAccounts(recalculatedAccounts);
    } catch (error) {
      console.error("Error loading treasury accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Modificación del Header dentro de TreasuryPage:
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleTransferred = useCallback(async () => {
    await loadAccounts();
    setIsTransferOpen(false);
  }, [loadAccounts]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleAccountCreated = useCallback(async () => {
    await loadAccounts();
    setIsCreateOpen(false);
  }, [loadAccounts]);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.isActive),
    [accounts],
  );

  const balancesByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, number>>((acc, account) => {
      const currency = account.currency || "ARS";
      const balance = Number(account.currentBalance) || 0;

      acc[currency] = (acc[currency] || 0) + balance;
      return acc;
    }, {});
  }, [accounts]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-slate-100" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Tesorería
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Administrá las cuentas de fondos y disponibilidades de tu negocio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            disabled={activeAccounts.length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowUpRight className="h-4 w-4" />
            Transferir
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            {isCreateOpen ? "Cancelar" : "Nueva cuenta"}
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      {isCreateOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <CreateTreasuryAccount
            businessId={businessId}
            onCreated={handleAccountCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      )}

      {/* SUMMARY */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Posición Consolidada
            </span>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {Object.entries(balancesByCurrency).length > 0 ? (
                Object.entries(balancesByCurrency).map(
                  ([currency, balance]) => (
                    <div key={currency} className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {formatCurrency(balance, currency)}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {formatCurrency(0, "ARS")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500">Cuentas activas</span>
              <p className="text-lg font-bold text-slate-900">
                {activeAccounts.length}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / {accounts.length}
                </span>
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500">Estado global</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operativo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNTS LIST */}
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
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Crear primera cuenta
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {/* TABLE HEADER */}
            <div className="hidden grid-cols-12 items-center border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-xs font-medium text-slate-500 md:grid">
              <div className="col-span-5">Cuenta</div>
              <div className="col-span-3">Tipo</div>
              <div className="col-span-2 text-center">Estado</div>
              <div className="col-span-2 text-right">Saldo</div>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-slate-100">
              {accounts.map((account) => {
                const config = TYPE_CONFIG[account.type];
                const Icon = config?.icon ?? Wallet;

                return (
                  <div
                    key={account.idTemp}
                    className="group flex flex-col gap-3 p-4 transition hover:bg-slate-50/60 md:grid md:grid-cols-12 md:items-center md:px-6 md:py-4"
                  >
                    {/* Cuenta & Nombre */}
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
                      <span className="text-xs text-slate-400 md:hidden">
                        Estado
                      </span>
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
                      <span className="text-xs text-slate-400 md:hidden">
                        Saldo
                      </span>
                      <div>
                        <p className="text-sm font-bold tabular-nums text-slate-900">
                          {formatCurrency(
                            Number(account.currentBalance) || 0,
                            account.currency || "ARS",
                          )}
                        </p>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">
                          {account.currency || "ARS"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isTransferOpen && (
          <TransferTreasuryModal
            businessId={businessId}
            accounts={activeAccounts}
            onClose={() => setIsTransferOpen(false)}
            onTransferred={handleTransferred}
          />
        )}
      </section>
    </div>
  );
}
