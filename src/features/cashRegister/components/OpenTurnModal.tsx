"use client";

import { useState } from "react";
import { DollarSign, Wallet, X } from "lucide-react";

interface OpenTurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOpen: (initialCash: number) => Promise<void> | void;
}

export function OpenTurnModal({
  isOpen,
  onClose,
  onConfirmOpen,
}: OpenTurnModalProps) {
  const [openingAmount, setOpeningAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(openingAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    try {
      setIsSubmitting(true);
      await onConfirmOpen(parsedAmount);
      setOpeningAmount("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Apertura de Caja</h3>
              <p className="text-[11px] text-slate-500">
                Declaración de cambio inicial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Monto Inicial en Cajón (Cambio / Fondo Base) *
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                required
                autoFocus
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-lg font-bold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Ingresá el total en efectivo con el que iniciás las operaciones de hoy.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || openingAmount === ""}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Abriendo Turno..." : "Abrir Caja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}