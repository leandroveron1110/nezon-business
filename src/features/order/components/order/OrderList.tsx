"use client";

import { Clock3, Loader2, Package, Printer, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { DeliveryType, IOrderShortDto } from "@/types/order";
import {
  OrderStatus,
  PaymentStatus,
} from "@/types/order-state-machine";

import OrderStatusBadge from "../OrderStatusBadge";
import { UI_COLORS } from "@/features/common/utils/ui";

interface Props {
  order: IOrderShortDto;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
}

export function OrderList({ order, onClick, onPrintDirect }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const createdAt = new Date(order.createdAt);
  const createdTime = createdAt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const elapsedMinutes = useMemo(() => {
    return Math.floor((now - createdAt.getTime()) / 1000 / 60);
  }, [now, createdAt]);

  // FLAGS
  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;
  const isWebOrder = order.origin === "APP";
  const isPickup = order.deliveryType === DeliveryType.PICKUP;

  const shouldShowTimer =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.REJECTED;

  // LÓGICA DE COLORES BASADA EN UI_COLORS
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

  const timerClass = useMemo(() => {
    if (elapsedMinutes >= 35) return UI_COLORS.ERROR.main + " text-white";
    if (elapsedMinutes >= 25) return UI_COLORS.WARNING.main + " text-white";
    if (elapsedMinutes >= 15) return "bg-yellow-300 text-black"; // Atención leve
    return "bg-slate-100 text-slate-600";
  }, [elapsedMinutes]);



  const handleQuickPrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPrinting(true);
      await onPrintDirect(order.id);
    } finally {
      setIsPrinting(false);
    }
  };

  // Colores de Pago dinámicos
  const paymentBarColor = isPaid ? UI_COLORS.SUCCESS.main : UI_COLORS.WARNING.main;
  const priceColor = isPaid ? "text-slate-900" : UI_COLORS.WARNING.text;

  return (
    <>
      {/* MOBILE */}
      <div
        onClick={onClick}
        className={`md:hidden relative border-b border-slate-200 px-4 py-3 active:bg-slate-100 ${
          isWebOrder ? UI_COLORS.INFO.bg : "bg-white"
        }`}
      >
        {/* BARRA DE PAGO (Izquierda) */}
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`} />
        
        {/* BARRA DE LOGÍSTICA (Derecha) */}
        {
          !isPickup && (<div className={`absolute right-0 top-0 bottom-0 w-2 ${UI_COLORS.INFO.main}`} />)
        }
        

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg leading-none font-black uppercase text-slate-900">
              {order.customerName === order.shortCode ? order.shortCode : `${order.customerName} - ${order.shortCode}`}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
              <span className="text-slate-400">#{order.id.slice(-4).toUpperCase()}</span>
              {shouldShowTimer && (
                <span className={`rounded px-1.5 py-0.5 ${timerClass}`}>{elapsedMinutes}'</span>
              )}
              <div className={`flex items-center gap-1 ${deliveryInfo.color}`}>
                <deliveryInfo.Icon size={11} strokeWidth={3} />
                {deliveryInfo.label}
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
          <button
            onClick={handleQuickPrint}
            disabled={isPrinting}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 active:scale-90 disabled:text-slate-400"
          >
            {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div
        onClick={onClick}
        className={`hidden md:flex relative items-center gap-4 border-b border-slate-200 px-6 py-4 cursor-pointer select-none transition-colors ${
          isWebOrder ? UI_COLORS.INFO.bg : "bg-white hover:bg-slate-50"
        }`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-2 ${deliveryInfo.bar}`} />

        <div className="flex min-w-[78px] flex-col items-center justify-center border-r border-slate-200 pr-4">
          <span className="text-sm font-black font-mono text-slate-900">
            #{order.id.slice(-4).toUpperCase()}
          </span>
          <span className="mt-1 text-[10px] font-bold text-slate-400">{createdTime}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xl leading-none font-black uppercase text-slate-900">
            {order.customerName === order.shortCode ? order.shortCode : `${order.customerName} - ${order.shortCode}`}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${deliveryInfo.color}`}>
              <deliveryInfo.Icon size={12} strokeWidth={3} />
              {deliveryInfo.label}
            </div>
            <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          </div>
        </div>

        {shouldShowTimer && (
          <div className={`flex min-w-[70px] flex-col items-center justify-center rounded-xl px-3 py-2 ${timerClass}`}>
            <Clock3 size={14} strokeWidth={3} />
            <span className="text-lg leading-none font-black">{elapsedMinutes}'</span>
          </div>
        )}

        <div className="min-w-[120px] text-right">
          <div className={`text-3xl leading-none font-black tracking-tight ${priceColor}`}>
            {formatPrice(order.total)}
          </div>
        </div>

        <button
          onClick={handleQuickPrint}
          disabled={isPrinting}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all text-slate-700 hover:border-slate-900 hover:text-slate-900 active:scale-90 disabled:text-slate-400"
        >
          {isPrinting ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
        </button>
      </div>
    </>
  );
}