"use client";

import { useState } from "react";
import {
  Wallet,
  X,
  ChevronDown,
  FileText,
  ShieldAlert,
  KeyRound,
  Loader2,
} from "lucide-react";

interface OpenTurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOpen: (
    initialCash: number,
    cashRegisterId: string,
    openingNotes: string,
    forceOpen?: boolean,
  ) => Promise<boolean> | boolean;
  cashRegisters: {
    id?: string | null;
    idTemp: string;
    name: string;
    isActive: boolean;
  }[];
}

export default function OpenTurnModal({
  isOpen,
  onClose,
  onConfirmOpen,
  cashRegisters,
}: OpenTurnModalProps) {
  const [initialCash, setInitialCash] = useState("");
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [openingNotes, setOpeningNotes] = useState("");

  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [authorizationError, setAuthorizationError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Formateadores de moneda
  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return Number(numbers).toLocaleString("es-AR");
  };

  const parseCurrency = (value: string) => {
    return Number(value.replace(/\./g, "")) || 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parsedAmount = parseCurrency(initialCash);

  const selectedCashRegister = cashRegisters.find(
    (cr) => (cr.idTemp) === cashRegisterId,
  );

  const resetForm = () => {
    setInitialCash("");
    setCashRegisterId("");
    setOpeningNotes("");
    setRequiresConfirmation(false);
    setAuthorizationCode("");
    setAuthorizationError("");
    setIsLoading(false);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!cashRegisterId || !initialCash || parsedAmount < 0) {
      return;
    }

    setIsLoading(true);
    setAuthorizationError("");

    try {

      console.log("cashRegisterId", cashRegisterId)
      // Primer intento: validación contra Tesorería.
      const success = await onConfirmOpen(
        parsedAmount,
        cashRegisterId,
        openingNotes.trim(),
        false,
      );

      if (success) {
        resetForm();
        onClose();
        return;
      }

      // El monto no coincide: requiere autorización.
      setRequiresConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorization = async () => {
    if (isLoading) return;

    if (authorizationCode !== "1234") {
      setAuthorizationError("Código incorrecto.");
      return;
    }

    setIsLoading(true);
    setAuthorizationError("");

    try {
      // Código correcto: autorizar apertura forzada.
      const success = await onConfirmOpen(
        parsedAmount,
        cashRegisterId,
        openingNotes.trim(),
        true,
      );

      if (!success) {
        setAuthorizationError("No se pudo abrir la caja.");
        return;
      }

      resetForm();
      onClose();
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 p-4">
          {/* Caja registradora */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Caja *
            </label>

            <div className="relative mt-1">
              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                required
                value={cashRegisterId}
                onChange={(e) => setCashRegisterId(e.target.value)}
                disabled={isLoading || requiresConfirmation}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Seleccioná una caja</option>

                {cashRegisters
                  .filter((cr) => cr.isActive)
                  .map((cr) => {
                    const id = cr.idTemp;
                    return (
                      <option key={id} value={id}>
                        {cr.name}
                      </option>
                    );
                  })}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Monto Inicial */}
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
                value={initialCash}
                onChange={(e) =>
                  setInitialCash(formatCurrencyInput(e.target.value))
                }
                disabled={isLoading || requiresConfirmation}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-7 pr-3 text-lg font-bold tracking-tight text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Observaciones
            </label>

            <div className="relative mt-1">
              <FileText className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

              <textarea
                value={openingNotes}
                onChange={(e) => setOpeningNotes(e.target.value)}
                disabled={isLoading || requiresConfirmation}
                placeholder="Ej: Cambio recibido del turno anterior..."
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Alerta de Autorización / Discrepancia */}
          {requiresConfirmation && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold">Diferencia detectada</p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    El monto ingresado no coincide con Tesorería. Ingresá el
                    código de autorización para forzar la apertura.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={authorizationCode}
                    onChange={(e) => {
                      setAuthorizationCode(e.target.value);
                      setAuthorizationError("");
                    }}
                    disabled={isLoading}
                    placeholder="Código PIN"
                    className="w-full rounded-md border border-amber-300 bg-white py-1.5 pl-8 pr-2 text-xs font-medium text-slate-800 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAuthorization}
                  disabled={isLoading || !authorizationCode}
                  className="flex items-center justify-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Autorizar"
                  )}
                </button>
              </div>

              {authorizationError && (
                <p className="mt-2 text-[11px] font-medium text-red-600">
                  {authorizationError}
                </p>
              )}
            </div>
          )}

          {/* Resumen */}
          {(selectedCashRegister || initialCash) && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Caja:</span>
                <span className="font-semibold text-slate-800">
                  {selectedCashRegister?.name || "No seleccionada"}
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

          {/* Botones de acción principales */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            {!requiresConfirmation && (
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !cashRegisterId ||
                  !initialCash ||
                  parsedAmount < 0
                }
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isLoading ? "Abriendo..." : "Abrir Caja"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
