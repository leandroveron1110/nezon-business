"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import {
  ArrowDownLeft,
  ArrowUpRight,
  X,
  DollarSign,
  FileText,
  Wallet,
  CreditCard,
  Tag,
  Calendar,
  Landmark,
  Smartphone,
  LockKeyhole,
  Loader2,
} from "lucide-react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/features/common/utils/currency-input";

/* =========================================================
 * TYPES
 * ======================================================= */

export type TreasuryAccountType =
  | "CASH"
  | "BANK"
  | "DIGITAL_WALLET"
  | "SAFE_BOX";

export type MovementCategory =
  | "MANUAL_ADJUSTMENT"
  | "CAPITAL_INJECTION"
  | "PROVIDER_PAYMENT"
  | "OPERATIONAL_EXPENSE"
  | "TAX_PAYMENT"
  | "SERVICES"
  | "OTHER";

export interface TreasuryAccountOption {
  idTemp: string;
  name: string;
  type: TreasuryAccountType;
  balance: number;
  currency?: string | null;
}

export interface CreateTreasuryMovementPayload {
  type: FinancialMovementType;
  amount: number;
  treasuryAccountIdTemp: string;
  paymentMethod: PaymentMethodTypeFinancial;
  description: string;
  category?: MovementCategory;
  entityId?: string;
  entityType?: "PROVIDER" | "CUSTOMER" | "OTHER";
  movementDate?: string;
  notes?: string;
}

interface TreasuryMovementModalProps {
  isOpen: boolean;
  type: FinancialMovementType.INCOME | FinancialMovementType.EXPENSE;
  accounts: TreasuryAccountOption[];
  onClose: () => void;
  onSubmit: (payload: CreateTreasuryMovementPayload) => Promise<void> | void;
}

/* =========================================================
 * CONSTANTS
 * ======================================================= */

const CATEGORY_OPTIONS: Record<
  FinancialMovementType.INCOME | FinancialMovementType.EXPENSE,
  { value: MovementCategory; label: string }[]
> = {
  [FinancialMovementType.INCOME]: [
    { value: "MANUAL_ADJUSTMENT", label: "Ajuste de caja / Ingreso directo" },
    { value: "CAPITAL_INJECTION", label: "Aporte de capital" },
    { value: "OTHER", label: "Otros ingresos" },
  ],
  [FinancialMovementType.EXPENSE]: [
    { value: "OPERATIONAL_EXPENSE", label: "Gasto operativo" },
    { value: "SERVICES", label: "Pago de servicios" },
    { value: "PROVIDER_PAYMENT", label: "Pago a proveedores" },
    { value: "TAX_PAYMENT", label: "Impuestos / Tasas" },
    { value: "MANUAL_ADJUSTMENT", label: "Ajuste de caja / Retiro" },
    { value: "OTHER", label: "Otros egresos" },
  ],
};

const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethodTypeFinancial;
  label: string;
}[] = [
  { value: PaymentMethodTypeFinancial.CASH, label: "Efectivo" },
  {
    value: PaymentMethodTypeFinancial.TRANSFER,
    label: "Transferencia bancaria",
  },
  { value: PaymentMethodTypeFinancial.QR, label: "Cobro / Pago QR" },
  { value: PaymentMethodTypeFinancial.DEBIT_CARD, label: "Tarjeta de Débito" },
  {
    value: PaymentMethodTypeFinancial.CREDIT_CARD,
    label: "Tarjeta de Crédito",
  },
  { value: PaymentMethodTypeFinancial.ACCOUNT, label: "Cuenta corriente" },
  { value: PaymentMethodTypeFinancial.OTHER, label: "Otro" },
];

/* =========================================================
 * HELPERS
 * ======================================================= */

function getDefaultPaymentMethod(
  type: TreasuryAccountType,
): PaymentMethodTypeFinancial {
  switch (type) {
    case "CASH":
    case "SAFE_BOX":
      return PaymentMethodTypeFinancial.CASH;
    case "BANK":
      return PaymentMethodTypeFinancial.TRANSFER;
    case "DIGITAL_WALLET":
      return PaymentMethodTypeFinancial.QR;
    default:
      return PaymentMethodTypeFinancial.CASH;
  }
}

function getAccountTypeLabel(type: TreasuryAccountType) {
  switch (type) {
    case "CASH":
      return "Efectivo";
    case "BANK":
      return "Banco";
    case "DIGITAL_WALLET":
      return "Billetera digital";
    case "SAFE_BOX":
      return "Caja fuerte";
    default:
      return "Cuenta";
  }
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getTodayFormatted() {
  return new Date().toISOString().split("T")[0];
}

/* =========================================================
 * COMPONENT
 * ======================================================= */

export function TreasuryMovementModal({
  isOpen,
  type,
  accounts,
  onClose,
  onSubmit,
}: TreasuryMovementModalProps) {
  const isIncome = type === FinancialMovementType.INCOME;

  const [amount, setAmount] = useState("");
  const [treasuryAccountIdTemp, setTreasuryAccountIdTemp] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodTypeFinancial | null>(null);
  const [category, setCategory] =
    useState<MovementCategory>("MANUAL_ADJUSTMENT");
  const [description, setDescription] = useState("");
  const [movementDate, setMovementDate] = useState(getTodayFormatted);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =======================================================
   * SELECTED ACCOUNT & PAYMENT METHOD AUTO-SELECT
   * ===================================================== */

  const selectedAccount = useMemo(() => {
    return accounts.find((acc) => acc.idTemp === treasuryAccountIdTemp);
  }, [accounts, treasuryAccountIdTemp]);

  // Al cambiar la cuenta seleccionada, establece el método de pago por defecto de esa cuenta
  const handleAccountChange = (accountId: string) => {
    setTreasuryAccountIdTemp(accountId);
    const acc = accounts.find((a) => a.idTemp === accountId);
    if (acc) {
      setPaymentMethod(getDefaultPaymentMethod(acc.type));
    } else {
      setPaymentMethod(null);
    }
  };

  /* =======================================================
   * RESET STATE ON OPEN / TYPE CHANGE
   * ===================================================== */

  const resetForm = useCallback(() => {
    setAmount("");
    setTreasuryAccountIdTemp("");
    setPaymentMethod(null);
    setDescription("");
    setNotes("");
    setCategory("MANUAL_ADJUSTMENT");
    setMovementDate(getTodayFormatted());
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, type, resetForm]);

  /* =======================================================
   * KEYBOARD ACCESSIBILITY (ESC TO CLOSE)
   * ===================================================== */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  /* =======================================================
   * VALIDATIONS
   * ===================================================== */

  const parsedAmount = parseCurrencyInput(amount);

  const exceedsBalance =
    !isIncome && !!selectedAccount && parsedAmount > selectedAccount.balance;

  const isValid =
    parsedAmount > 0 && !!selectedAccount && !!paymentMethod && !exceedsBalance;

  /* =======================================================
   * SUBMIT HANDLER
   * ===================================================== */

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount || !paymentMethod || !isValid) return;

    try {
      setIsSubmitting(true);

      await onSubmit({
        type,
        amount: parsedAmount,
        treasuryAccountIdTemp: selectedAccount.idTemp,
        paymentMethod,
        category,
        description:
          description.trim() ||
          (isIncome ? "Ingreso de tesorería" : "Egreso de tesorería"),
        movementDate,
        notes: notes.trim() || undefined,
      });

      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* =================================================
         * HEADER
         * =============================================== */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isIncome
              ? "border-emerald-100 bg-emerald-50/50"
              : "border-rose-100 bg-rose-50/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                {isIncome ? "Nuevo Ingreso" : "Nuevo Egreso"}
              </h3>
              <p className="text-[10px] font-medium text-slate-400">
                Movimiento directo de tesorería
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
         * FORM
         * =============================================== */}
        <form onSubmit={handleFormSubmit} className="space-y-4 p-6">
          {/* MONTO */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Monto ($) *
            </label>

            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                className={`w-full rounded-2xl border bg-slate-50/50 py-3 pl-10 pr-4 text-xl font-bold text-slate-800 outline-none transition focus:bg-white ${
                  exceedsBalance
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />
            </div>

            {exceedsBalance && (
              <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2">
                <p className="text-[11px] font-semibold text-rose-700">
                  Saldo insuficiente en la cuenta seleccionada.
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-rose-500">
                  Disponible: ${formatCurrency(selectedAccount?.balance ?? 0)} |
                  Intento: ${formatCurrency(parsedAmount)}
                </p>
              </div>
            )}
          </div>

          {/* GRID: CUENTA Y MEDIO DE PAGO */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* CUENTA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                {isIncome ? "Cuenta destino" : "Cuenta origen"} *
              </label>

              <div className="relative mt-1.5">
                <Wallet className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />

                <select
                  required
                  value={treasuryAccountIdTemp}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="">Seleccionar cuenta...</option>
                  {accounts.map((acc) => (
                    <option
                      key={acc.idTemp}
                      value={acc.idTemp}
                      disabled={!isIncome && acc.balance <= 0}
                    >
                      {acc.name} · {getAccountTypeLabel(acc.type)} ($
                      {formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MEDIO DE PAGO SELECCIONABLE */}
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Medio de pago *
              </label>

              <div className="relative mt-1.5">
                <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />

                <select
                  required
                  disabled={!selectedAccount}
                  value={paymentMethod ?? ""}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as PaymentMethodTypeFinancial,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-50"
                >
                  {!selectedAccount && (
                    <option value="">Seleccioná una cuenta primero</option>
                  )}
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GRID: CATEGORÍA Y FECHA */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* CATEGORÍA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Categoría
              </label>

              <div className="relative mt-1.5">
                <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as MovementCategory)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  {CATEGORY_OPTIONS[type].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FECHA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Fecha del movimiento
              </label>

              <div className="relative mt-1.5">
                <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />

                <input
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN / CONCEPTO */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Detalle / Concepto *
            </label>

            <input
              type="text"
              required
              placeholder={
                isIncome
                  ? "Ej: Aporte de capital, ingreso extraordinario"
                  : "Ej: Pago de servicio, compra, retiro de caja"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* OBSERVACIONES / NOTES */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Observaciones / Comprobante{" "}
              <span className="font-normal text-slate-400">(Opcional)</span>
            </label>

            <div className="relative mt-1.5">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />

              <textarea
                rows={2}
                placeholder="N° de comprobante, ticket, observaciones..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* ACCIONES */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting
                ? "Guardando..."
                : isIncome
                  ? "Confirmar Ingreso"
                  : "Confirmar Egreso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
