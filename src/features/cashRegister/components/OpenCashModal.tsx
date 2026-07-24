// @/features/cash-register/ui/OpenCashModal.tsx
"use client";

import { useState } from "react";
import { Wallet, DollarSign, FileText, X, Sparkles } from "lucide-react";
import { cashRegisterOrchestrator } from "@/mini-back/orchestrator/cash-register.orchestrator";

interface Props {
  businessId: string;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OpenCashModal({
  businessId,
  userId = "user-system",
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [openingAmount, setOpeningAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Formatea:
   * 65000 -> 65.000
   */
  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    return Number(numbers).toLocaleString("es-AR");
  };

  /**
   * Convierte:
   * 65.000 -> 65000
   */
  const parseCurrency = (value: string) => {
    return Number(value.replace(/\./g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseCurrency(openingAmount);

    if (isNaN(amount) || amount < 0) {
      alert("Por favor ingresá un monto inicial válido.");
      return;
    }

    try {
      setIsSubmitting(true);

      await cashRegisterOrchestrator.openCashRegister({
        businessId,
        userId,
        openingAmount: amount,
        openingNotes: notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al intentar abrir la caja.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">

        {/* CABECERA */}
        <div className="flex items-center justify-between bg-slate-900 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-600/20 p-2.5 text-blue-400">
              <Wallet className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight">
                Apertura de Caja
              </h2>

              <p className="text-xs font-medium text-slate-400">
                Iniciá el turno de trabajo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">

          {/* MONTO */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
              <DollarSign className="h-3.5 w-3.5 text-blue-600" />
              Monto Inicial de Cambio (Físico)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
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
                  setOpeningAmount(formatCurrencyInput(e.target.value))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-3xl font-black tracking-tight text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <p className="text-[11px] font-medium text-slate-500">
              Indicá el dinero físico disponible para dar cambio al comenzar el turno.
            </p>
          </div>

          {/* NOTAS */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Notas de Apertura (Opcional)
            </label>

            <textarea
              rows={2}
              placeholder="Ej: Dejé $5.000 en cambio. Billetes chicos disponibles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* BOTONES */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />

              {isSubmitting
                ? "Abriendo..."
                : "Confirmar y Abrir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}