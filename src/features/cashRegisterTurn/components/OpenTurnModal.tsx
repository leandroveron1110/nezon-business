"use client";

import { useState } from "react";

import {
  Wallet,
  X,
  Landmark,
  ChevronDown,
  FileText,
} from "lucide-react";

import { CashRegister } from "@/mini-back/core/cash-register-core/public";

interface OpenTurnModalProps {
  isOpen: boolean;

  onClose: () => void;

  cashRegisters: CashRegister[];

  onConfirmOpen: (
    initialCash: number,
    cashRegisterId: string,
    defaultTreasuryAccountId: string,
    openingNotes: string,
  ) => Promise<void> | void;
}

export function OpenTurnModal({
  isOpen,
  onClose,
  onConfirmOpen,
  cashRegisters,
}: OpenTurnModalProps) {
  const [openingAmount, setOpeningAmount] = useState<string>("");
  const [cashRegisterId, setCashRegisterId] = useState<string>("");
  const [openingNotes, setOpeningNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    return Number(numbers).toLocaleString("es-AR");
  };

  const parseCurrency = (value: string) => {
    return Number(value.replace(/\./g, ""));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parsedAmount = openingAmount
    ? parseCurrency(openingAmount)
    : 0;

  const selectedCashRegister = cashRegisters.find(
    (cashRegister) =>
      cashRegister.idTemp === cashRegisterId,
  );

  const defaultTreasuryAccountId =
    selectedCashRegister?.defaultTreasuryAccountId ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      isNaN(parsedAmount) ||
      parsedAmount < 0 ||
      !selectedCashRegister ||
      !defaultTreasuryAccountId
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onConfirmOpen(
        parsedAmount,
        selectedCashRegister.idTemp,
        defaultTreasuryAccountId,
        openingNotes.trim(),
      );

      setOpeningAmount("");
      setCashRegisterId("");
      setOpeningNotes("");

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setOpeningAmount("");
    setCashRegisterId("");
    setOpeningNotes("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-xs">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Apertura de Caja
              </h3>

              <p className="text-[10px] text-slate-500">
                Configurá el turno para comenzar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3.5 p-4"
        >
          {/* Caja física */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Caja *
            </label>

            <div className="relative mt-1">
              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                required
                value={cashRegisterId}
                onChange={(e) =>
                  setCashRegisterId(e.target.value)
                }
                disabled={isSubmitting}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  Seleccioná una caja
                </option>

                {cashRegisters.map((cashRegister) => (
                  <option
                    key={cashRegister.idTemp}
                    value={cashRegister.idTemp}
                  >
                    {cashRegister.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Monto inicial */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Monto Inicial *
            </label>

            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                $
              </span>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="0"
                value={openingAmount}
                onChange={(e) =>
                  setOpeningAmount(
                    formatCurrencyInput(e.target.value),
                  )
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-7 pr-3 text-lg font-bold tracking-tight text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </div>
          </div>

          {/* Notas de apertura */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Notas
            </label>

            <div className="relative mt-1">
              <FileText className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

              <textarea
                value={openingNotes}
                onChange={(e) =>
                  setOpeningNotes(e.target.value)
                }
                disabled={isSubmitting}
                placeholder="Ej: Cambio recibido del turno anterior..."
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Resumen */}
          {(selectedCashRegister || openingAmount) && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Caja:</span>

                <span className="font-semibold text-slate-800">
                  {selectedCashRegister?.name ||
                    "No seleccionada"}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between border-t border-emerald-100/60 pt-1 text-slate-600">
                <span>Efectivo inicial:</span>

                <span className="font-bold text-emerald-700">
                  {formatCurrency(parsedAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                openingAmount === "" ||
                !cashRegisterId ||
                !defaultTreasuryAccountId
              }
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Abriendo..." : "Abrir Caja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
