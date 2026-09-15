"use client";

import { useState } from "react";
import {
  Banknote,
  Building2,
  Landmark,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

import { TreasuryAccountType } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";

interface CreateTreasuryAccountProps {
  businessId: string;
  onCreated: () => Promise<void> | void;
  onCancel?: () => void;
}

const ACCOUNT_TYPES: {
  value: TreasuryAccountType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "CASH", label: "Efectivo", icon: Banknote },
  { value: "BANK", label: "Banco", icon: Landmark },
  { value: "DIGITAL_WALLET", label: "Billetera digital", icon: Wallet },
  { value: "SAFE_BOX", label: "Caja fuerte", icon: Building2 },
];

const CURRENCIES = [
  { value: "ARS", label: "Peso Argentino (ARS)" },
  { value: "USD", label: "Dólar Estadounidense (USD)" },
];

export function CreateTreasuryAccount({
  businessId,
  onCreated,
  onCancel,
}: CreateTreasuryAccountProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TreasuryAccountType>("BANK");
  const [currency, setCurrency] = useState("ARS");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessId || isCreating) return;

    try {
      setIsCreating(true);

      const orchestrator = new TreasuryAccountOrchestrator();
      await orchestrator.create({
        id: crypto.randomUUID(),
        businessId,
        name: name.trim(),
        type,
        currency,
      });

      setName("");
      setType("BANK");
      setCurrency("ARS");

      await onCreated();
    } catch (error) {
      console.error("Error creating treasury account:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Nueva cuenta de tesorería
          </h3>
          <p className="text-xs text-slate-500">
            Ingresá los datos para comenzar a operar con esta cuenta.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-5 py-5">
        {/* Selección de tipo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">
            Tipo de cuenta
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {ACCOUNT_TYPES.map((accountType) => {
              const Icon = accountType.icon;
              const isSelected = type === accountType.value;

              return (
                <button
                  key={accountType.value}
                  type="button"
                  disabled={isCreating}
                  onClick={() => setType(accountType.value)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-700 ring-1 ring-emerald-600/20 font-medium"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-xs">{accountType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="treasury-account-name"
              className="text-xs font-semibold text-slate-700"
            >
              Nombre de la cuenta
            </label>
            <input
              id="treasury-account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Banco Galicia ARS"
              disabled={isCreating}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="treasury-account-currency"
              className="text-xs font-semibold text-slate-700"
            >
              Moneda
            </label>
            <select
              id="treasury-account-currency"
              value={currency}
              disabled={isCreating}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={!name.trim() || isCreating}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isCreating ? "Guardando..." : "Guardar cuenta"}</span>
        </button>
      </div>
    </form>
  );
}