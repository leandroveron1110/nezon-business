"use client";

import {
  Clock3,
  FileText,
  Loader2,
  Package,
  Printer,
  Truck,
} from "lucide-react";

import { memo, useMemo, useState } from "react";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { UI_COLORS } from "@/features/common/utils/ui";

import { DeliveryType, IOrderShortDto } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto; // Asegurate de que tu DTO incluya de ser necesario `deliveryFee` o similar
  now: number;
  showPrintButton?: boolean;
  showViewTicketButton?: boolean;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
  onViewTicket: (id: string) => void;
}

function getElapsedTimerStyles(minutes: number) {
  if (minutes >= 35) {
    return { container: `${UI_COLORS.ERROR.main} text-white animate-pulse`, glow: "shadow-red-500/40" };
  }
  if (minutes >= 25) {
    return { container: `${UI_COLORS.WARNING.main} text-white`, glow: "shadow-orange-500/30" };
  }
  if (minutes >= 15) {
    return { container: `bg-yellow-300 text-black`, glow: "shadow-yellow-400/20" };
  }
  return { container: "bg-slate-100 text-slate-600", glow: "" };
}

export const OrderList = memo(function OrderList({
  order,
  now,
  showPrintButton = true,
  showViewTicketButton = true,
  onClick,
  onPrintDirect,
  onViewTicket,
}: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  const createdAt = useMemo(() => new Date(order.createdAt), [order.createdAt]);

  const createdTime = useMemo(() => {
    return createdAt.toLocaleTimeString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [createdAt]);

  const elapsedMinutes = useMemo(() => {
    return Math.floor((now - createdAt.getTime()) / 1000 / 60);
  }, [now, createdAt]);

  // =========================================================
  // FLAGS
  // =========================================================
  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;
  const isWebOrder = order.origin === "APP";
  const isPickup = order.deliveryType === DeliveryType.PICKUP;

  const shouldShowTimer =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.REJECTED;

  // Supongamos que tu DTO tiene el costo de envío acá (si no viene o es 0, no altera nada)
  const hasDeliveryFee = !isPickup && order.deliveryFee && order.deliveryFee > 0;

  // =========================================================
  // DELIVERY INFO & VARIATIONS
  // =========================================================
  const deliveryInfo = useMemo(() => {
    if (isPickup) {
      return {
        label: "RETIRO",
        Icon: Package,
        color: UI_COLORS.PICKUP.text,
        bar: UI_COLORS.PICKUP.main,
      };
    }

    return {
      label: "DELIVERY",
      Icon: Truck,
      color: UI_COLORS.INFO.text,
      bar: UI_COLORS.INFO.main,
    };
  }, [isPickup]);

  const paymentBarColor = isPaid ? UI_COLORS.SUCCESS.main : UI_COLORS.WARNING.main;
  const priceColor = isPaid ? "text-slate-900" : UI_COLORS.WARNING.text;

  const timerStyles = useMemo(() => getElapsedTimerStyles(elapsedMinutes), [elapsedMinutes]);

  const handleQuickPrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPrinting(true);
      await onPrintDirect(order.id);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE */}
      {/* ================================================= */}
      <div
        onClick={onClick}
        className={`
          md:hidden relative border-b border-slate-200 px-4 py-3 active:bg-slate-100 transition-all
          ${elapsedMinutes >= 35 ? "ring-2 ring-red-300" : ""}
          ${isWebOrder ? UI_COLORS.INFO.bg : "bg-white"}
        `}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`} />
        {!isPickup && <div className={`absolute right-0 top-0 bottom-0 w-2 ${deliveryInfo.bar}`} />}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg leading-none font-black uppercase text-slate-900">
              {order.customerName === order.shortCode ? order.shortCode : order.customerName}
            </div>

            <div className="mt-1 text-[11px] font-black tracking-wide text-slate-400 uppercase">
              #{order.shortCode}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {shouldShowTimer && (
                <span className={`rounded-md px-2 py-1 text-[11px] font-black ${timerStyles.container}`}>
                  {elapsedMinutes}'
                </span>
              )}

              <div className={`flex items-center gap-1 text-[11px] font-black uppercase ${deliveryInfo.color}`}>
                <deliveryInfo.Icon size={11} strokeWidth={3} />
                {deliveryInfo.label}
                {/* INFO EXTRA DE ENVÍO EN MOBILE */}
                {hasDeliveryFee}
                {hasDeliveryFee && (
                  <span className="ml-1 bg-slate-100 text-slate-600 px-1 rounded text-[9px] font-bold">
                    + {formatPrice(order.deliveryFee!)} env
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl leading-none font-black tracking-tight ${priceColor}`}>
              {formatPrice(order.total)}
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-400">{createdTime}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />

          <div className="flex items-center gap-2">
            {showViewTicketButton && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewTicket(order.id); }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 transition-all active:scale-90"
              >
                <FileText size={18} />
              </button>
            )}

            {showPrintButton && (
              <button
                onClick={handleQuickPrint}
                disabled={isPrinting}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 transition-all active:scale-90 disabled:text-slate-400"
              >
                {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* DESKTOP */}
      {/* ================================================= */}
      <div
        onClick={onClick}
        className={`
          hidden md:flex relative items-center gap-4 border-b border-slate-200 px-6 py-4 cursor-pointer select-none transition-all
          ${elapsedMinutes >= 35 ? "bg-red-50" : ""}
          ${isWebOrder ? UI_COLORS.INFO.bg : "bg-white hover:bg-slate-50"}
        `}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-2 ${deliveryInfo.bar}`} />

        <div className="flex min-w-[78px] flex-col items-center justify-center border-r border-slate-200 pr-4">
          <span className="text-sm font-black font-mono text-slate-900">#{order.shortCode}</span>
          <span className="mt-1 text-[10px] font-bold text-slate-400">{createdTime}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xl leading-none font-black uppercase text-slate-900">
            {order.customerName === order.shortCode ? order.shortCode : order.customerName}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div
              className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-black uppercase tracking-tight shadow-sm
                ${isPickup 
                  ? `${UI_COLORS.PICKUP.bg} ${UI_COLORS.PICKUP.text} ${UI_COLORS.PICKUP.border}` 
                  : `${UI_COLORS.INFO.bg} ${UI_COLORS.INFO.text} ${UI_COLORS.INFO.border}`
                }
              `}
            >
              <deliveryInfo.Icon size={12} strokeWidth={3} />
              {deliveryInfo.label}
              
              {/* ETIQUETA DE COSTO DE ENVÍO INFORMATIVA */}
              {hasDeliveryFee && (
                <span className="ml-1.5 bg-white/80 px-1 rounded text-[9px] font-extrabold border border-slate-200 text-slate-700">
                  ENVÍO: {formatPrice(order.deliveryFee!)}
                </span>
              )}
            </div>

            <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          </div>
        </div>

        {shouldShowTimer && (
          <div className={`flex min-w-[75px] items-center justify-center rounded-xl px-3 py-2 gap-1 shadow-sm ${timerStyles.container} ${timerStyles.glow}`}>
            <Clock3 size={14} strokeWidth={3} />
            <span className="text-lg leading-none font-black">{elapsedMinutes}'</span>
          </div>
        )}

        <div className="min-w-[120px] text-right">
          <div className={`text-3xl leading-none font-black tracking-tight ${priceColor}`}>
            {formatPrice(order.total)}
          </div>
          {/* Si querés recordarle abajo del precio que el total NO incluye envío o que tiene un desglose */}
          {hasDeliveryFee && (
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
              Monto Neto Rindible
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showViewTicketButton && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewTicket(order.id); }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-90"
              title="Ver Comanda Digital"
            >
              <FileText size={20} />
            </button>
          )}

          {showPrintButton && (
            <button
              onClick={handleQuickPrint}
              disabled={isPrinting}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all text-slate-700 hover:border-slate-900 hover:text-slate-900 active:scale-90 disabled:text-slate-400"
              title="Imprimir Comanda Física"
            >
              {isPrinting ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
            </button>
          )}
        </div>
      </div>
    </>
  );
});