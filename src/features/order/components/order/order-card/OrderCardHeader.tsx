"use client";

import {
  CalendarClock,
  Clock3,
  Globe,
  MessageSquare,
  Package,
  Truck,
} from "lucide-react";
import { memo, useMemo } from "react";

import { formatTimeRemaining } from "@/features/common/utils/formatScheduledTime";
import { DeliveryType, IOrderShortDto } from "@/types/order";

interface OrderCardHeaderProps {
  order: IOrderShortDto;
  now: number;
  createdTime: string;
  isFinished: boolean;
  isPaid: boolean;
  timerClassName: string;
}

export const OrderCardHeader = memo(function OrderCardHeader({
  order,
  now,
  createdTime,
  isFinished,
  isPaid,
  timerClassName,
}: OrderCardHeaderProps) {
  const isPickup = order.deliveryType === DeliveryType.PICKUP;
  const isScheduled = Boolean(order.scheduledAt);

  // Evaluamos la fecha objetivo según el tipo de pedido
  const targetDate = order.scheduledAt ?? order.createdAt;

  const timeInfo = useMemo(() => {
    if (!targetDate) return null;
    return formatTimeRemaining({
      targetDate,
      now,
      isScheduled,
    });
  }, [targetDate, now, isScheduled]);

  const isDifferentDay = timeInfo ? !timeInfo.isSameDay : false;

  // Tag de origen (WSP / WEB)
  const originTag = useMemo(() => {
    const origin = order.origin?.toUpperCase();

    if (origin === "WSP" || origin === "WHATSAPP") {
      return {
        label: "WSP",
        bg: "bg-emerald-600 text-white",
        Icon: MessageSquare,
      };
    }

    if (origin === "APP" || origin === "WEB") {
      return {
        label: "WEB",
        bg: "bg-black/20 text-white",
        Icon: Globe,
      };
    }

    return null;
  }, [order.origin]);

  // Tema visual según Delivery / Retiro
  const deliveryTheme = useMemo(() => {
    if (!isPickup) {
      return {
        label: "DELIVERY",
        Icon: Truck,
        headerBg: "bg-amber-500 text-slate-950",
        scheduledHeaderStyle: {
          backgroundImage:
            "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px)",
          color: "#0f172a",
        },
      };
    }

    return {
      label: "RETIRO",
      Icon: Package ,
      headerBg: "bg-blue-600 text-white",
      scheduledHeaderStyle: {
        backgroundImage:
          "repeating-linear-gradient(45deg, #2563eb, #2563eb 10px, #1d4ed8 10px, #1d4ed8 20px)",
        color: "#ffffff",
      },
    };
  }, [isPickup]);

  const DeliveryIcon = deliveryTheme.Icon;

  return (
    <header
      style={
        isScheduled && isDifferentDay
          ? deliveryTheme.scheduledHeaderStyle
          : undefined
      }
      className={`
        flex h-9 shrink-0
        items-center justify-between
        px-3
        ${!(isScheduled && isDifferentDay) ? deliveryTheme.headerBg : ""}
      `}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <DeliveryIcon size={14} strokeWidth={3} />

        <span className="truncate text-[11px] font-black uppercase tracking-wide">
          {deliveryTheme.label}
        </span>

        {originTag && (
          <span
            className={`
              inline-flex items-center gap-0.5
              rounded px-1.5 py-0.5
              text-[8px] font-black uppercase tracking-wider
              ${originTag.bg}
            `}
            title={`Pedido de ${originTag.label}`}
          >
            <originTag.Icon size={9} strokeWidth={3} />
            {originTag.label}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!isPaid && (
          <span
            className="
              h-2.5 w-2.5
              rounded-full
              border border-white/40
              bg-red-600
              shadow-sm
            "
            title="Pendiente de cobro"
          />
        )}

        {/* 1. PEDIDO PROGRAMADO */}
        {isScheduled && timeInfo ? (
          <span
            className={`
              inline-flex items-center gap-1
              rounded-md px-2 py-0.5
              text-[10px] font-black text-white
              shadow-sm
              ${
                timeInfo.isSameDay
                  ? timeInfo.isLate
                    ? "bg-red-600"
                    : timeInfo.isUrgent
                      ? "bg-amber-600"
                      : "bg-slate-900/90"
                  : "bg-slate-900/90"
              }
            `}
            title={`Programado para ${timeInfo.display}`}
          >
            <CalendarClock
              size={11}
              strokeWidth={2.5}
              className="text-amber-400"
            />
            {timeInfo.display}
          </span>
        ) : (
          /* 2. PEDIDO NORMAL (NO PROGRAMADO) */
          <>
            <span className="text-[10px] font-bold opacity-80">
              {createdTime}
            </span>

            {!isFinished && timeInfo && (
              <span
                className={`
                  inline-flex items-center gap-1
                  rounded-md px-1.5 py-0.5
                  text-[10px] font-black
                  ${
                    isDifferentDay
                      ? "bg-slate-900/90 text-white"
                      : timerClassName
                  }
                `}
                title={
                  isDifferentDay
                    ? `Creado el ${timeInfo.display}`
                    : `Transcurridos ${timeInfo.diffMinutes} minutos`
                }
              >
                <Clock3 size={10} strokeWidth={3} />
                {timeInfo.display}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
});
