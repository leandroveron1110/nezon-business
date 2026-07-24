"use client";

import { useState } from "react";
import {
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatCurrencyInput, parseCurrencyInput } from "@/features/common/utils/currency-input";

interface CloseTurnModalProps {
  isOpen: boolean;
  expectedCash: number;
  onClose: () => void;
  onConfirmClose: (data: {
    declaredCash: number;
    difference: number;
    closingNotes?: string;
  }) => Promise<void> | void;
}

export function CloseTurnModal({
  isOpen,
  expectedCash,
  onClose,
  onConfirmClose,
}: CloseTurnModalProps) {
  const [declaredCashInput, setDeclaredCashInput] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;


  const declaredCash =
    declaredCashInput === "" ? 0 : parseCurrencyInput(declaredCashInput);

  const difference = declaredCash - expectedCash;

  const handleCloseTurn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (declaredCashInput === "") return;

    try {
      setIsSubmitting(true);

      await onConfirmClose({
        declaredCash: parseCurrencyInput(declaredCashInput),
        difference,
        closingNotes: closingNotes.trim() || undefined,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
              <Lock className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-bold">Cierre de Caja</h3>
              <p className="text-[11px] text-slate-400">
                Arqueo final del turno
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCloseTurn} className="space-y-4 p-6">
          {/* Esperado */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <span className="text-xs font-medium text-slate-500">
                Efectivo Esperado
              </span>

              <p className="text-2xl font-black text-slate-800">
                ${expectedCash.toLocaleString("es-AR")}
              </p>
            </div>

            <span className="max-w-[140px] text-right text-[11px] text-slate-400">
              Fondo inicial + ingresos en efectivo - egresos
            </span>
          </div>

          {/* Monto contado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Efectivo Real Contado en Cajón *
            </label>

            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                autoFocus
                placeholder="0"
                value={declaredCashInput}
                onChange={(e) =>
                  setDeclaredCashInput(formatCurrencyInput(e.target.value))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-lg font-bold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Resultado */}
          {declaredCashInput !== "" && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs font-medium ${
                difference === 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : difference > 0
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {difference === 0 ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}

              <div>
                <p className="font-bold">
                  {difference === 0
                    ? "¡Caja Cuadrada!"
                    : difference > 0
                    ? `Sobrante de $${Math.abs(difference).toLocaleString(
                        "es-AR"
                      )}`
                    : `Faltante de $${Math.abs(difference).toLocaleString(
                        "es-AR"
                      )}`}
                </p>

                <p className="text-[11px] opacity-80">
                  {difference === 0
                    ? "El efectivo coincide exactamente con el total calculado."
                    : difference > 0
                    ? "Hay más dinero del que los registros señalan."
                    : "Hay menos dinero contado del calculado por el sistema."}
                </p>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Observaciones del Cierre (Opcional)
            </label>

            <textarea
              rows={2}
              placeholder="Ej: Se dejó $5.000 en caja para el turno de mañana..."
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Acciones */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || declaredCashInput === ""}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? "Cerrando Turno..."
                : "Confirmar Cierre de Caja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}