"use client";

import { formatPrice } from "@/features/common/utils/formatPrice";

type PaymentMethodType =
  | "CASH"
  | "TRANSFER"
  | "QR"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "ACCOUNT"
  | "OTHER";

type DiscountType = "PERCENTAGE" | "FIXED" | null;

interface OrderFooterProps {
  subtotal: number;

  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;

  deliveryCost: number;
  total: number;

  isDelivery: boolean;
  isSubmitting: boolean;
  hasItems: boolean;

  paymentMethod: PaymentMethodType;
  setPaymentMethod: (v: PaymentMethodType) => void;

  createOrder: (instantPrepare?: boolean) => void;
}

const PAYMENT_METHODS: {
  key: PaymentMethodType;
  label: string;
}[] = [
  { key: "CASH", label: "EFECTIVO" },
  { key: "TRANSFER", label: "TRANSF." },
  { key: "QR", label: "QR / MODO" },
];

export function OrderFooter({
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  deliveryCost,
  total,
  isDelivery,
  isSubmitting,
  hasItems,
  paymentMethod,
  setPaymentMethod,
  createOrder,
}: OrderFooterProps) {
  const hasDiscount =
    discountType !== null && discountValue > 0;

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* MÉTODO DE PAGO */}
      <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-1.5">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.key;

            return (
              <button
                key={method.key}
                type="button"
                onClick={() => setPaymentMethod(method.key)}
                className={`flex-1 h-7 rounded-md border text-[9px] font-black transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {method.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN */}
      <div className="bg-slate-900 px-3 py-2 text-white">
        {/* DETALLE DE PRECIOS */}
        <div className="space-y-0.5 text-[10px] font-bold">
          <div className="flex items-center justify-between text-slate-400">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {hasDiscount && (
            <div className="flex items-center justify-between text-amber-400">
              <span>
                Descuento{" "}
                {discountType === "PERCENTAGE"
                  ? `${discountValue}%`
                  : formatPrice(discountValue)}
              </span>

              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          {isDelivery && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Envío</span>
              <span>{formatPrice(deliveryCost)}</span>
            </div>
          )}
        </div>

        {/* TOTAL */}
        <div className="mt-1.5 flex items-end justify-between border-t border-slate-700 pt-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
            Total
          </span>

          <span className="text-2xl font-black leading-none tracking-tight text-emerald-400">
            {formatPrice(total)}
          </span>
        </div>

        {/* ACCIONES */}
        {!isSubmitting && (
          <div className="mt-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => createOrder(false)}
              disabled={!hasItems}
              className="flex-1 h-8 rounded-md border border-slate-700 bg-slate-800 text-[9px] font-black uppercase text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Solo guardar
            </button>

            <button
              type="button"
              onClick={() => createOrder(true)}
              disabled={!hasItems}
              className="flex-[2] h-8 rounded-md bg-emerald-600 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Marchar comanda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}