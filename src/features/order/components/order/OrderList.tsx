"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Truck,
  WifiOff,
} from "lucide-react";

import { memo, useEffect, useMemo, useState } from "react";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { UI_COLORS } from "@/features/common/utils/ui";

import { DeliveryType, IOrderShortDto } from "@/types/order";
import {
  OrderStatus,
  PaymentStatus,
} from "@/types/order-state-machine";

import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
}

function getElapsedTimerStyles(minutes: number) {
  if (minutes >= 35) {
    return {
      container: `${UI_COLORS.ERROR.main} text-white animate-pulse`,
      glow: "shadow-red-500/40",
    };
  }

  if (minutes >= 25) {
    return {
      container: `${UI_COLORS.WARNING.main} text-white`,
      glow: "shadow-orange-500/30",
    };
  }

  if (minutes >= 15) {
    return {
      container: `bg-yellow-300 text-black`,
      glow: "shadow-yellow-400/20",
    };
  }

  return {
    container: "bg-slate-100 text-slate-600",
    glow: "",
  };
}


export const OrderList = memo(function OrderList({
  order,
  onClick,
  onPrintDirect,
}: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const createdAt = useMemo(
    () => new Date(order.createdAt),
    [order.createdAt],
  );

  const createdTime = useMemo(() => {
    return createdAt.toLocaleTimeString("es-AR", {
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

  const isPaid =
    order.paymentStatus === PaymentStatus.CONFIRMED;

  const isWebOrder = order.origin === "APP";

  const isPickup =
    order.deliveryType === DeliveryType.PICKUP;

  const shouldShowTimer =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.REJECTED;

  // =========================================================
  // DELIVERY INFO
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

  // =========================================================
  // TIMER
  // =========================================================

  const timerStyles = useMemo(() => {
    return getElapsedTimerStyles(elapsedMinutes);
  }, [elapsedMinutes]);

  // =========================================================
  // SYNC
  // =========================================================


  // =========================================================
  // COLORS
  // =========================================================

  const paymentBarColor = isPaid
    ? UI_COLORS.SUCCESS.main
    : UI_COLORS.WARNING.main;

  const priceColor = isPaid
    ? "text-slate-900"
    : UI_COLORS.WARNING.text;

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleQuickPrint = async (
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    try {
      setIsPrinting(true);

      await onPrintDirect(order.id);
    } finally {
      setIsPrinting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE */}
      {/* ================================================= */}

      <div
        onClick={onClick}
        className={`
          md:hidden
          relative
          border-b
          border-slate-200
          px-4
          py-3
          active:bg-slate-100
          transition-all
          ${
            elapsedMinutes >= 35
              ? "ring-2 ring-red-300"
              : ""
          }
          ${
            isWebOrder
              ? UI_COLORS.INFO.bg
              : "bg-white"
          }
        `}
      >
        {/* PAYMENT BAR */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`}
        />

        {/* DELIVERY BAR */}
        {!isPickup && (
          <div
            className={`absolute right-0 top-0 bottom-0 w-2 ${deliveryInfo.bar}`}
          />
        )}

        <div className="flex items-start justify-between gap-3">
          {/* LEFT */}
          <div className="min-w-0 flex-1">
            {/* CUSTOMER */}
            <div className="truncate text-lg leading-none font-black uppercase text-slate-900">
              {order.customerName === order.shortCode
                ? order.shortCode
                : order.customerName}
            </div>

            {/* CODE */}
            <div className="mt-1 text-[11px] font-black tracking-wide text-slate-400 uppercase">
              #{order.shortCode}
            </div>

            {/* META */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* TIMER */}
              {shouldShowTimer && (
                <span
                  className={`
                    rounded-md
                    px-2
                    py-1
                    text-[11px]
                    font-black
                    ${timerStyles.container}
                  `}
                >
                  {elapsedMinutes}'
                </span>
              )}

              {/* DELIVERY */}
              <div
                className={`
                  flex
                  items-center
                  gap-1
                  text-[11px]
                  font-black
                  uppercase
                  ${deliveryInfo.color}
                `}
              >
                <deliveryInfo.Icon
                  size={11}
                  strokeWidth={3}
                />
                {deliveryInfo.label}
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <div
              className={`
                text-2xl
                leading-none
                font-black
                tracking-tight
                ${priceColor}
              `}
            >
              {formatPrice(order.total)}
            </div>

            <div className="mt-1 text-[10px] font-bold text-slate-400">
              {createdTime}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <OrderStatusBadge
            status={order.status}
            paymentStatus={order.paymentStatus}
          />

          <button
            onClick={handleQuickPrint}
            disabled={isPrinting}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border-2
              border-slate-200
              bg-white
              text-slate-700
              transition-all
              active:scale-90
              disabled:text-slate-400
            "
          >
            {isPrinting ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Printer size={18} />
            )}
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* DESKTOP */}
      {/* ================================================= */}

      <div
        onClick={onClick}
        className={`
          hidden
          md:flex
          relative
          items-center
          gap-4
          border-b
          border-slate-200
          px-6
          py-4
          cursor-pointer
          select-none
          transition-all
          ${
            elapsedMinutes >= 35
              ? "bg-red-50"
              : ""
          }
          ${
            isWebOrder
              ? UI_COLORS.INFO.bg
              : "bg-white hover:bg-slate-50"
          }
        `}
      >
        {/* LEFT PAYMENT BAR */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 ${paymentBarColor}`}
        />

        {/* RIGHT DELIVERY BAR */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-2 ${deliveryInfo.bar}`}
        />

        {/* TIME BLOCK */}
        <div className="flex min-w-[78px] flex-col items-center justify-center border-r border-slate-200 pr-4">
          <span className="text-sm font-black font-mono text-slate-900">
            #{order.shortCode}
          </span>

          <span className="mt-1 text-[10px] font-bold text-slate-400">
            {createdTime}
          </span>
        </div>

        {/* CENTER */}
        <div className="min-w-0 flex-1">
          {/* NAME */}
          <div className="truncate text-xl leading-none font-black uppercase text-slate-900">
            {order.customerName === order.shortCode
              ? order.shortCode
              : order.customerName}
          </div>

          {/* META */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* DELIVERY */}
            <div
              className={`
                flex
                items-center
                gap-1
                text-[10px]
                font-black
                uppercase
                ${deliveryInfo.color}
              `}
            >
              <deliveryInfo.Icon
                size={12}
                strokeWidth={3}
              />

              {deliveryInfo.label}
            </div>

            {/* STATUS */}
            <OrderStatusBadge
              status={order.status}
              paymentStatus={order.paymentStatus}
            />

          </div>
        </div>

        {/* TIMER */}
        {shouldShowTimer && (
          <div
            className={`
              flex
              min-w-[75px]
              flex-col
              items-center
              justify-center
              rounded-xl
              px-3
              py-2
              shadow-sm
              ${timerStyles.container}
              ${timerStyles.glow}
            `}
          >
            <Clock3
              size={14}
              strokeWidth={3}
            />

            <span className="text-lg leading-none font-black">
              {elapsedMinutes}'
            </span>
          </div>
        )}

        {/* PRICE */}
        <div className="min-w-[120px] text-right">
          <div
            className={`
              text-3xl
              leading-none
              font-black
              tracking-tight
              ${priceColor}
            `}
          >
            {formatPrice(order.total)}
          </div>
        </div>

        {/* PRINT */}
        <button
          onClick={handleQuickPrint}
          disabled={isPrinting}
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            border-2
            border-slate-200
            bg-white
            transition-all
            text-slate-700
            hover:border-slate-900
            hover:text-slate-900
            active:scale-90
            disabled:text-slate-400
          "
        >
          {isPrinting ? (
            <Loader2
              size={20}
              className="animate-spin"
            />
          ) : (
            <Printer size={20} />
          )}
        </button>
      </div>
    </>
  );
});