// @/features/cash-register/ui/OpenCashModal.tsx

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Wallet,
  DollarSign,
  FileText,
  X,
  Sparkles,
  Landmark,
  ChevronDown,
} from "lucide-react";

import { cashRegisterTurnOrchestrator } from "@/mini-back/orchestrator/cash-register.orchestrator";

import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";

import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";

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
  const [openingAmount, setOpeningAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    treasuryAccounts,
    setTreasuryAccounts,
  ] = useState<TreasuryAccount[]>([]);

  const [
    treasuryAccountId,
    setTreasuryAccountId,
  ] = useState("");

  const [
    isLoadingAccounts,
    setIsLoadingAccounts,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * Obtener las cuentas de tesorería
   * del negocio.
   */
  useEffect(() => {
    if (!isOpen || !businessId) {
      return;
    }

    const loadTreasuryAccounts =
      async () => {
        try {
          setIsLoadingAccounts(true);

          const orchestrator =
            new TreasuryAccountOrchestrator();

          const accounts =
            await orchestrator.findByBusinessId(
              businessId,
            );

          setTreasuryAccounts(accounts);
        } catch (error) {
          console.error(
            "Error loading treasury accounts:",
            error,
          );

          setTreasuryAccounts([]);
        } finally {
          setIsLoadingAccounts(false);
        }
      };

    void loadTreasuryAccounts();
  }, [
    businessId,
    isOpen,
  ]);

  /**
   * Una caja física solamente puede
   * vincularse a una cuenta CASH activa.
   */
  const cashTreasuryAccounts =
    useMemo(() => {
      return treasuryAccounts.filter(
        (account) =>
          account.type === "CASH" &&
          account.isActive,
      );
    }, [
      treasuryAccounts,
    ]);

  if (!isOpen) return null;

  /**
   * Formatea:
   *
   * 65000 -> 65.000
   */
  const formatCurrencyInput = (
    value: string,
  ) => {
    const numbers =
      value.replace(/\D/g, "");

    if (!numbers) return "";

    return Number(
      numbers,
    ).toLocaleString("es-AR");
  };

  /**
   * Convierte:
   *
   * 65.000 -> 65000
   */
  const parseCurrency = (
    value: string,
  ) => {
    return Number(
      value.replace(/\./g, ""),
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setOpeningAmount("");
    setNotes("");
    setTreasuryAccountId("");

    onClose();
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const amount =
      parseCurrency(openingAmount);

    if (
      isNaN(amount) ||
      amount < 0
    ) {
      alert(
        "Por favor ingresá un monto inicial válido.",
      );

      return;
    }

    if (!treasuryAccountId) {
      alert(
        "Seleccioná la cuenta de tesorería asociada a esta caja.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await cashRegisterTurnOrchestrator.openCashRegisterTurn({
        businessId,

        userId,

        openingAmount: amount,

        openingNotes:
          notes.trim() || undefined,

        treasuryAccountId,
        cashRegisterId: ""
      });

      setOpeningAmount("");
      setNotes("");
      setTreasuryAccountId("");

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error(error);

      alert(
        "Ocurrió un error al intentar abrir la caja.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAccount =
    cashTreasuryAccounts.find(
      (account) =>
        account.id ===
        treasuryAccountId,
    );

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
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* CUENTA DE TESORERÍA */}

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
              <Landmark className="h-3.5 w-3.5 text-blue-600" />

              Cuenta de Tesorería
            </label>

            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select
                value={treasuryAccountId}
                onChange={(e) =>
                  setTreasuryAccountId(
                    e.target.value,
                  )
                }
                disabled={
                  isLoadingAccounts ||
                  isSubmitting ||
                  cashTreasuryAccounts.length === 0
                }
                required
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {isLoadingAccounts
                    ? "Cargando cuentas..."
                    : "Seleccioná una caja"}
                </option>

                {cashTreasuryAccounts.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {cashTreasuryAccounts.length === 0 &&
              !isLoadingAccounts && (
                <p className="text-[11px] font-medium text-amber-600">
                  No hay cuentas de efectivo
                  disponibles. Creá una cuenta
                  de tesorería de tipo CASH antes
                  de abrir la caja.
                </p>
              )}

            {selectedAccount && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Caja vinculada
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  {selectedAccount.name}
                </p>
              </div>
            )}

            <p className="text-[11px] font-medium text-slate-500">
              El efectivo físico de este turno
              quedará registrado en esta cuenta
              de tesorería.
            </p>
          </div>

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
                  setOpeningAmount(
                    formatCurrencyInput(
                      e.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-3xl font-black tracking-tight text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <p className="text-[11px] font-medium text-slate-500">
              Indicá el dinero físico disponible
              para dar cambio al comenzar el
              turno.
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
              onChange={(e) =>
                setNotes(
                  e.target.value,
                )
              }
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* BOTONES */}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingAccounts ||
                !treasuryAccountId ||
                cashTreasuryAccounts.length === 0
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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