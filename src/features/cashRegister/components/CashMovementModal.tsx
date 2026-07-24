"use client";

import { useState } from "react";
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
  CreditCard,
} from "lucide-react";
import { formatCurrencyInput, parseCurrencyInput } from "@/features/common/utils/currency-input";


export interface CreateMovementPayload {
  type: FinancialMovementType;
  amount: number;
  paymentMethod: PaymentMethodTypeFinancial;
  description: string;
  notes?: string;
}

interface CashMovementModalProps {
  isOpen: boolean;
  type: FinancialMovementType.INCOME | FinancialMovementType.EXPENSE;
  onClose: () => void;
  onSubmit: (payload: CreateMovementPayload) => Promise<void> | void;
}

const PAYMENT_METHODS: {
  id: PaymentMethodTypeFinancial;
  label: string;
}[] = [
  { id: PaymentMethodTypeFinancial.CASH, label: "Efectivo" },
  { id: PaymentMethodTypeFinancial.TRANSFER, label: "Transferencia" },
  { id: PaymentMethodTypeFinancial.QR, label: "Cobro QR" },
  { id: PaymentMethodTypeFinancial.MERCADO_PAGO, label: "Mercado Pago" },
  { id: PaymentMethodTypeFinancial.DEBIT_CARD, label: "Débito" },
  { id: PaymentMethodTypeFinancial.CREDIT_CARD, label: "Crédito" },
  { id: PaymentMethodTypeFinancial.ACCOUNT, label: "Cuenta Corriente" },
  { id: PaymentMethodTypeFinancial.OTHER, label: "Otro" },
];

export function CashMovementModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: CashMovementModalProps) {
  const isIncome = type === FinancialMovementType.INCOME;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodTypeFinancial>(
      PaymentMethodTypeFinancial.CASH
    );
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseCurrencyInput(amount);

    if (parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);

      await onSubmit({
        type,
        amount: parsedAmount,
        paymentMethod,
        description:
          description.trim() ||
          (isIncome ? "Ingreso manual" : "Egreso manual"),
        notes: notes.trim() || undefined,
      });

      // Reset
      setAmount("");
      setDescription("");
      setNotes("");
      setPaymentMethod(PaymentMethodTypeFinancial.CASH);

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Cabecera */}
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

            <h3 className="font-bold text-slate-800">
              {isIncome
                ? "Ingresar Dinero"
                : "Sacar Dinero / Egreso"}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleFormSubmit}
          className="space-y-4 p-6"
        >
          {/* Monto */}
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
                placeholder="0"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    formatCurrencyInput(e.target.value)
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-lg font-bold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Medio de Pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Medio de Pago *
            </label>

            <div className="relative mt-1.5">
              <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as PaymentMethodTypeFinancial
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Motivo / Concepto *
            </label>

            <input
              type="text"
              required
              placeholder={
                isIncome
                  ? "Ej: Adición de cambio inicial, aporte de caja"
                  : "Ej: Pago de insumos, retiro de ganancia, flete"
              }
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Notas Adicionales (Opcional)
            </label>

            <div className="relative mt-1.5">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

              <textarea
                rows={2}
                placeholder="Número de comprobante, observaciones..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Botones */}
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
              disabled={isSubmitting || !amount}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
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