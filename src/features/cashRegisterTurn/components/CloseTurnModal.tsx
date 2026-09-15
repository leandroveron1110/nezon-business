"use client";

import { useState } from "react";
import {
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/features/common/utils/currency-input";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-xs">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <Lock className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-xs font-bold">Cierre de Caja</h3>
              <p className="text-[10px] text-slate-400">
                Arqueo final del turno
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCloseTurn} className="space-y-3.5 p-4">
          {/* Esperado */}
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div>
              <span className="block text-[10px] font-medium text-slate-500">
                Efectivo Esperado
              </span>
              <p className="text-base font-bold text-slate-800">
                ${expectedCash.toLocaleString("es-AR")}
              </p>
            </div>

            <span className="max-w-[120px] text-right text-[10px] leading-tight text-slate-400">
              Fondo inicial + ingresos - egresos
            </span>
          </div>

          {/* Monto contado */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Efectivo Real Contado *
            </label>

            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                $
              </span>

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
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-7 pr-3 text-lg font-bold tracking-tight text-slate-800 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Resultado del Arqueo */}
          {declaredCashInput !== "" && (
            <div
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs font-medium ${
                difference === 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : difference > 0
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {difference === 0 ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}

              <div>
                <p className="font-bold text-[11px]">
                  {difference === 0
                    ? "¡Caja Cuadrada!"
                    : difference > 0
                    ? `Sobrante: $${Math.abs(difference).toLocaleString(
                        "es-AR"
                      )}`
                    : `Faltante: $${Math.abs(difference).toLocaleString(
                        "es-AR"
                      )}`}
                </p>

                <p className="text-[10px] opacity-80 leading-tight mt-0.5">
                  {difference === 0
                    ? "El efectivo coincide perfectamente."
                    : difference > 0
                    ? "Hay más dinero que lo registrado."
                    : "Hay menos dinero que el calculado por sistema."}
                </p>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Observaciones (Opcional)
            </label>

            <textarea
              rows={2}
              placeholder="Ej: Se dejó dinero en caja para el turno mañana..."
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 outline-none transition focus:border-slate-800 focus:bg-white"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || declaredCashInput === ""}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Cerrando..." : "Confirmar Cierre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}