"use client";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { DeliveryType } from "@/features/order/types/order";
import { UIOrder } from "@/features/order/types/ui-order";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Tag, ArrowRight } from "lucide-react";

interface OrderDetailFooterProps {
  safeOrder: UIOrder;
  isPaid: boolean;
  canShowActions: () => boolean;
  loading: boolean;
  handleTogglePayment: () => void;
  action?: {
    label: string;
    color: string;
  } | null;
  handleAdvance: () => void;
}

export function OrderDetailFooter({
  safeOrder,
  isPaid,
  canShowActions,
  loading,
  handleTogglePayment,
  action,
  handleAdvance,
}: OrderDetailFooterProps) {
  // 1. Subtotal base de productos
  const itemsSubtotal =
    safeOrder.subtotal && safeOrder.subtotal > 0
      ? safeOrder.subtotal
      : safeOrder.items.reduce((acc, item) => {
          const itemBase = item.priceAtPurchase * item.quantity;
          const optionsBase = item.optionGroups.reduce(
            (gAcc, group) =>
              gAcc +
              group.options.reduce(
                (oAcc, opt) => oAcc + opt.priceFinal * opt.quantity,
                0
              ),
            0
          );
          return acc + itemBase + optionsBase;
        }, 0);

  // 2. Costo de envío
  const deliveryCost =
    safeOrder.deliveryType === DeliveryType.DELIVERY
      ? safeOrder.totalDeliveryCost ?? 0
      : 0;

  // 3. Cálculo de Descuento
  const hasDiscount =
    Boolean(safeOrder.discountType) && (safeOrder.discountValue ?? 0) > 0;

  let calculatedDiscountAmount = 0;
  if (hasDiscount) {
    if (safeOrder.discountType === "PERCENTAGE") {
      calculatedDiscountAmount =
        (itemsSubtotal * (safeOrder.discountValue ?? 0)) / 100;
    } else {
      calculatedDiscountAmount = safeOrder.discountValue ?? 0;
    }
  }

  return (
    <div className="p-4 border-t border-slate-200/80 bg-slate-50 space-y-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] select-none">
      
      {/* 1. DESGLOSE FINANCIERO (Limpio y alineado) */}
      <div className="space-y-1.5 text-xs text-slate-500 font-medium pb-2 border-b border-slate-200/60">
        <div className="flex justify-between items-center">
          <span>Subtotal productos</span>
          <span className="font-mono font-semibold text-slate-700">
            {formatPrice(itemsSubtotal)}
          </span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="flex items-center gap-1 text-[11px]">
              <Tag size={12} className="shrink-0" />
              <span>
                Descuento{" "}
                <span className="font-bold">
                  ({safeOrder.discountType === "PERCENTAGE"
                    ? `${safeOrder.discountValue}%`
                    : formatPrice(safeOrder.discountValue ?? 0)})
                </span>
              </span>
            </span>
            <span className="font-mono font-bold text-emerald-600">
              -{formatPrice(calculatedDiscountAmount)}
            </span>
          </div>
        )}

        {safeOrder.deliveryType === DeliveryType.DELIVERY && (
          <div className="flex justify-between items-center text-blue-600">
            <span>Costo de envío</span>
            <span className="font-mono font-bold">
              +{formatPrice(deliveryCost)}
            </span>
          </div>
        )}
      </div>

      {/* 2. ESTADO DE PAGO Y TOTAL NETO */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CreditCard size={13} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {safeOrder.orderPaymentMethod}
            </span>
          </div>
          <div>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 uppercase">
                <CheckCircle2 size={12} />
                Cobrado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 uppercase">
                <AlertCircle size={12} />
                Pendiente de pago
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-slate-400 font-black block tracking-widest uppercase">
            TOTAL NETO
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {formatPrice(safeOrder.total)}
          </span>
        </div>
      </div>

      {/* 3. BOTONES DE ACCIÓN */}
      {canShowActions() && (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleTogglePayment}
            disabled={loading}
            className={`px-3.5 py-2.5 rounded-xl font-black text-xs border transition-all active:scale-95 disabled:opacity-50 ${
              isPaid
                ? "bg-white text-slate-400 border-slate-200 hover:bg-slate-100"
                : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm"
            }`}
          >
            {isPaid ? "MARCAR DEUDOR" : "MARCAR COBRADO"}
          </button>

          {action && (
            <button
              type="button"
              onClick={handleAdvance}
              disabled={loading}
              className={`flex-1 min-w-0 ${action.color} text-white py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 shadow-sm transition-all disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span className="truncate">{action.label}</span>
                  <ArrowRight size={14} className="shrink-0" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}