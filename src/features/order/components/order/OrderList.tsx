"use client";

import { Clock3, Loader2, Package, Printer, Truck } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { formatPrice } from "@/features/common/utils/formatPrice";

import { DeliveryType, IOrderShortDto } from "@/types/order";

import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/order-state-machine";

import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
}

export function OrderList({ order, onClick, onPrintDirect }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  const [now, setNow] = useState(Date.now());

  //
  // LIVE TIMER
  //
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  //
  // TIME
  //
  const createdAt = new Date(order.createdAt);

  const createdTime = createdAt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const elapsedMinutes = useMemo(() => {
    return Math.floor((now - createdAt.getTime()) / 1000 / 60);
  }, [now, createdAt]);

  //
  // FLAGS
  //
  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;

  const isWebOrder = order.origin === "APP";

  const isPickup = order.deliveryType === DeliveryType.PICKUP;

  //
  // HIDE TIMER
  //
  const shouldShowTimer =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.REJECTED;

  //
  // DELIVERY INFO
  //
  const deliveryInfo = useMemo(() => {
    if (isPickup) {
      return {
        label: "RETIRO",
        Icon: Package,
        color: "text-orange-600",
        bar: "bg-orange-500",
      };
    }

    return {
      label: "DELIVERY",
      Icon: Truck,
      color: "text-blue-600",
      bar: "bg-blue-600",
    };
  }, [isPickup]);

  //
  // TIMER COLORS
  //
  const timerClass = useMemo(() => {
    //
    // CRITICAL
    //
    if (elapsedMinutes >= 35) {
      return `
        bg-red-600
        text-white
      `;
    }

    //
    // WARNING
    //
    if (elapsedMinutes >= 25) {
      return `
        bg-orange-500
        text-white
      `;
    }

    //
    // ATTENTION
    //
    if (elapsedMinutes >= 15) {
      return `
        bg-yellow-300
        text-black
      `;
    }

    //
    // NORMAL
    //
    return `
      bg-slate-100
      text-slate-600
    `;
  }, [elapsedMinutes]);

  //
  // PRIORITY
  //
  const priorityClass = useMemo(() => {
    //
    // READY
    //
    if (order.status === OrderStatus.READY) {
      return `
        ring-2
        ring-emerald-500
        ring-inset
      `;
    }

    //
    // CADET WAITING
    //
    if (order.deliveryStatus === DeliveryStatus.REQUESTED) {
      return `
        ring-2
        ring-blue-500
        ring-inset
      `;
    }

    return "";
  }, [order.status, order.deliveryStatus]);

  //
  // QUICK PRINT
  //
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
      {/* ========================================= */}
      {/* MOBILE */}
      {/* ========================================= */}

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

          ${isWebOrder ? "bg-blue-50" : "bg-white"}

          ${priorityClass}
        `}
      >
        {/* PAYMENT BAR */}
        <div
          className={`
            absolute
            left-0
            top-0
            bottom-0
            w-2

            ${isPaid ? "bg-emerald-600" : "bg-red-500"}
          `}
        />

        {/* DELIVERY BAR */}
        <div
          className={`
            absolute
            right-0
            top-0
            bottom-0
            w-2

            ${deliveryInfo.bar}
          `}
        />

        {/* TOP */}
        <div className="flex items-start justify-between gap-3">
          {/* LEFT */}
          <div className="min-w-0 flex-1">
            {/* NAME */}
            <div
              className="
                truncate
                text-lg
                leading-none
                font-black
                uppercase
                text-slate-900
              "
            >
              {order.customerName}
            </div>

            {/* META */}
            <div
              className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-2
                text-[11px]
                font-bold
                uppercase
              "
            >
              {/* ID */}
              <span className="text-slate-400">
                #{order.id.slice(-4).toUpperCase()}
              </span>

              {/* TIMER */}
              {shouldShowTimer && (
                <span
                  className={`
                    rounded
                    px-1.5
                    py-0.5

                    ${timerClass}
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

                  ${deliveryInfo.color}
                `}
              >
                <deliveryInfo.Icon size={11} strokeWidth={3} />

                {deliveryInfo.label}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            {/* PRICE */}
            <div
              className={`
                text-2xl
                leading-none
                font-black
                tracking-tight

                ${isPaid ? "text-slate-900" : "text-red-600"}
              `}
            >
              {formatPrice(order.total)}
            </div>

            {/* CREATED */}
            <div
              className="
                mt-1
                text-[10px]
                font-bold
                text-slate-400
              "
            >
              {createdTime}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-3
          "
        >
          {/* STATUS */}
          <OrderStatusBadge status={order.status} />

          {/* PRINT */}
          <button
            onClick={handleQuickPrint}
            disabled={isPrinting}
            className={`
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

              ${
                isPrinting
                  ? "text-slate-400"
                  : `
                    text-slate-700
                    active:scale-90
                  `
              }
            `}
          >
            {isPrinting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Printer size={18} />
            )}
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* DESKTOP */}
      {/* ========================================= */}

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
          transition-colors

          ${isWebOrder ? "bg-blue-50" : "bg-white hover:bg-slate-50"}

          ${priorityClass}
        `}
      >
        {/* PAYMENT BAR */}
        <div
          className={`
            absolute
            left-0
            top-0
            bottom-0
            w-2

            ${isPaid ? "bg-emerald-600" : "bg-red-500"}
          `}
        />

        {/* DELIVERY BAR */}
        <div
          className={`
            absolute
            right-0
            top-0
            bottom-0
            w-2

            ${deliveryInfo.bar}
          `}
        />

        {/* ID */}
        <div
          className="
            flex
            min-w-[78px]
            flex-col
            items-center
            justify-center
            border-r
            border-slate-200
            pr-4
          "
        >
          <span
            className="
              text-sm
              font-black
              font-mono
              text-slate-900
            "
          >
            #{order.id.slice(-4).toUpperCase()}
          </span>

          <span
            className="
              mt-1
              text-[10px]
              font-bold
              text-slate-400
            "
          >
            {createdTime}
          </span>
        </div>

        {/* MAIN */}
        <div className="min-w-0 flex-1">
          {/* NAME */}
          <div
            className="
              truncate
              text-xl
              leading-none
              font-black
              uppercase
              text-slate-900
            "
          >
            {order.customerName}
          </div>

          {/* META */}
          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
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
              <deliveryInfo.Icon size={12} strokeWidth={3} />

              {deliveryInfo.label}
            </div>

            {/* STATUS */}
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* TIMER */}
        {shouldShowTimer && (
          <div
            className={`
              flex
              min-w-[70px]
              flex-col
              items-center
              justify-center
              rounded-xl
              px-3
              py-2

              ${timerClass}
            `}
          >
            <Clock3 size={14} strokeWidth={3} />

            <span
              className="
                text-lg
                leading-none
                font-black
              "
            >
              {elapsedMinutes}'
            </span>
          </div>
        )}

        {/* PRICE */}
        <div
          className="
            min-w-[120px]
            text-right
          "
        >
          <div
            className={`
              text-3xl
              leading-none
              font-black
              tracking-tight

              ${isPaid ? "text-slate-900" : "text-red-600"}
            `}
          >
            {formatPrice(order.total)}
          </div>
        </div>

        {/* PRINT */}
        <button
          onClick={handleQuickPrint}
          disabled={isPrinting}
          className={`
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

            ${
              isPrinting
                ? "text-slate-400"
                : `
                  text-slate-700
                  hover:border-slate-900
                  hover:text-slate-900
                  active:scale-90
                `
            }
          `}
        >
          {isPrinting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Printer size={20} />
          )}
        </button>
      </div>
    </>
  );
}
