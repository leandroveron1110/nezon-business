"use client";

import {
  AlertCircle,
  CalendarClock,
  Check,
  Clock3,
  FileText,
  Globe,
  Loader2,
  MessageSquare,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import { memo, useMemo, useState } from "react";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { DeliveryType, IOrderShortDto } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto;
  now: number;
  showPrintButton?: boolean;
  showViewTicketButton?: boolean;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
  onViewTicket: (id: string) => void;
}

function getTimerStyle(minutes: number) {
  if (minutes >= 35) {
    return {
      className: "bg-red-600 text-white",
      urgent: true,
    };
  }

  if (minutes >= 25) {
    return {
      className: "bg-orange-500 text-white",
      urgent: true,
    };
  }

  if (minutes >= 15) {
    return {
      className: "bg-yellow-300 text-slate-950",
      urgent: false,
    };
  }

  return {
    className: "bg-slate-100 text-slate-600",
    urgent: false,
  };
}

export const OrderCard = memo(function OrderCard({
  order,
  now,
  showPrintButton = true,
  showViewTicketButton = true,
  onClick,
  onPrintDirect,
  onViewTicket,
}: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  // =========================================================
  // FECHAS
  // =========================================================

  const createdAt = useMemo(() => new Date(order.createdAt), [order.createdAt]);

  const scheduledAt = useMemo(
    () => (order.scheduledAt ? new Date(order.scheduledAt) : null),
    [order.scheduledAt],
  );

  const createdTime = useMemo(
    () =>
      createdAt.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [createdAt],
  );

  const elapsedMinutes = useMemo(
    () => Math.max(0, Math.floor((now - createdAt.getTime()) / 60000)),
    [now, createdAt],
  );

  // =========================================================
  // PROGRAMACIÓN & TIEMPO RESTANTE
  // =========================================================

  const isSameDay = useMemo(() => {
    if (!scheduledAt) return false;
    const nowDate = new Date(now);
    return (
      scheduledAt.getDate() === nowDate.getDate() &&
      scheduledAt.getMonth() === nowDate.getMonth() &&
      scheduledAt.getFullYear() === nowDate.getFullYear()
    );
  }, [scheduledAt, now]);

  const isFutureDayScheduled = useMemo(() => {
    if (!scheduledAt) return false;
    return !isSameDay && scheduledAt.getTime() > now;
  }, [scheduledAt, isSameDay, now]);

  const remainingMinutes = useMemo(() => {
    if (!scheduledAt) return 0;
    return Math.floor((scheduledAt.getTime() - now) / 60000);
  }, [scheduledAt, now]);

  const scheduledTimeDisplay = useMemo(() => {
    if (!scheduledAt) return null;

    const timeStr = scheduledAt.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isSameDay) {
      const absMinutes = Math.abs(remainingMinutes);

      // Si la diferencia es mayor a 60 minutos, mostramos formato de horas o directamente la hora pura
      if (absMinutes >= 60) {
        const hours = Math.floor(absMinutes / 60);
        const mins = absMinutes % 60;
        const formattedTime = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

        return remainingMinutes > 0
          ? `-${formattedTime} · ${timeStr}`
          : `+${formattedTime} · ${timeStr}`;
      }

      // Menos de 60 minutos
      if (remainingMinutes > 0) {
        return `-${remainingMinutes}m · ${timeStr}`;
      }
      if (remainingMinutes === 0) {
        return `AHORA · ${timeStr}`;
      }
      return `+${remainingMinutes < 0 ? absMinutes : remainingMinutes}m · ${timeStr}`;
    }

    const dateStr = scheduledAt.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });

    return `${dateStr} · ${timeStr}`;
  }, [scheduledAt, isSameDay, remainingMinutes]);

  // =========================================================
  // FLAGS & ORIGIN
  // =========================================================

  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;
  const isPickup = order.deliveryType === DeliveryType.PICKUP;

  const isFinished =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED ||
    order.status === OrderStatus.REJECTED;

  const hasDeliveryFee = !isPickup && (order.deliveryFee ?? 0) > 0;

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

  // =========================================================
  // DELIVERY THEME
  // =========================================================

  const deliveryTheme = useMemo(() => {
    if (isPickup) {
      return {
        label: "RETIRO",
        Icon: Package,
        headerBg: "bg-amber-500 text-slate-950",
        scheduledHeaderStyle: {
          backgroundImage:
            "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px)",
          color: "#0f172a",
        },
      };
    }

    return {
      label: "DELIVERY",
      Icon: Truck,
      headerBg: "bg-blue-600 text-white",
      scheduledHeaderStyle: {
        backgroundImage:
          "repeating-linear-gradient(45deg, #2563eb, #2563eb 10px, #1d4ed8 10px, #1d4ed8 20px)",
        color: "#ffffff",
      },
    };
  }, [isPickup]);

  const DeliveryIcon = deliveryTheme.Icon;

  // =========================================================
  // TIMER & PAYMENT
  // =========================================================

  const timer = useMemo(() => getTimerStyle(elapsedMinutes), [elapsedMinutes]);

  const payment = isPaid
    ? {
        label: "PAGADO",
        Icon: Check,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      }
    : {
        label: "COBRAR",
        Icon: AlertCircle,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };

  const PaymentIcon = payment.Icon;

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleQuickPrint = async (e: React.SyntheticEvent) => {
    e.stopPropagation();

    if (isPrinting) return;

    try {
      setIsPrinting(true);
      await onPrintDirect(order.id);
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 1500);
    } catch (error) {
      console.error("Error al imprimir:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleViewTicket = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    onViewTicket(order.id);
  };

  return (
    <article
      onClick={onClick}
      className={`
        group relative flex h-full min-h-[185px]
        cursor-pointer select-none flex-col
        overflow-hidden rounded-xl
        border bg-white
        shadow-sm
        transition-all duration-150

        hover:-translate-y-[1px]
        hover:shadow-md
        active:scale-[0.985]

        ${
          isFutureDayScheduled
            ? "border-slate-300 hover:border-slate-400"
            : timer.urgent && elapsedMinutes >= 35
              ? "border-red-500 ring-2 ring-red-500/20"
              : "border-slate-200 hover:border-slate-300"
        }
      `}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        style={
          isFutureDayScheduled ? deliveryTheme.scheduledHeaderStyle : undefined
        }
        className={`
          flex h-9 shrink-0
          items-center justify-between
          px-3
          ${!isFutureDayScheduled ? deliveryTheme.headerBg : ""}
        `}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <DeliveryIcon size={14} strokeWidth={3} />

          <span className="text-[11px] font-black uppercase tracking-wide truncate">
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

          {scheduledAt ? (
            <span
              className={`
                inline-flex items-center gap-1
                rounded-md px-2 py-0.5
                text-[10px] font-black text-white
                shadow-sm
                ${
                  isSameDay
                    ? remainingMinutes < 0
                      ? "bg-red-600"
                      : remainingMinutes <= 15
                        ? "bg-amber-600"
                        : "bg-slate-900/90"
                    : "bg-slate-900/90"
                }
              `}
              title={`Programado para ${scheduledTimeDisplay}`}
            >
              <CalendarClock
                size={11}
                strokeWidth={2.5}
                className="text-amber-400"
              />
              {scheduledTimeDisplay}
            </span>
          ) : (
            <>
              <span className="text-[10px] font-bold opacity-80">
                {createdTime}
              </span>

              {!isFinished && (
                <span
                  className={`
                    inline-flex items-center gap-1
                    rounded-md px-1.5 py-0.5
                    text-[10px] font-black
                    ${timer.className}
                  `}
                >
                  <Clock3 size={10} strokeWidth={3} />
                  {elapsedMinutes}'
                </span>
              )}
            </>
          )}
        </div>
      </header>

      {/* =====================================================
          BODY
      ====================================================== */}

      <div className="flex flex-1 flex-col px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xl font-black leading-none tracking-tight text-slate-900">
              #{order.shortCode}
            </div>

            <h3
              className="
                mt-1 line-clamp-2
                text-xs font-bold uppercase
                leading-snug tracking-tight text-slate-700
              "
              title={order.customerName}
            >
              {order.customerName === order.shortCode
                ? order.shortCode
                : order.customerName}
            </h3>
          </div>

          <span
            className={`
              inline-flex shrink-0
              items-center gap-1
              rounded-full border
              px-2 py-1
              text-[9px] font-black uppercase
              ${payment.className}
            `}
          >
            <PaymentIcon size={10} strokeWidth={3} />
            {payment.label}
          </span>
        </div>

        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-2">
          <div className="min-w-0 truncate">
            <OrderStatusBadge
              status={order.status}
              paymentStatus={order.paymentStatus}
            />
          </div>

          {hasDeliveryFee && (
            <span className="shrink-0 text-[9px] font-bold text-slate-400">
              +{formatPrice(order.deliveryFee!)} envío
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          flex h-[54px] shrink-0
          items-center justify-between
          border-t border-slate-100
          bg-slate-50 px-3
        "
      >
        <div className="min-w-0">
          <span
            className="
              block text-[8px]
              font-black uppercase
              leading-none tracking-wider
              text-slate-400
            "
          >
            Total
          </span>

          <span
            className={`
              mt-0.5 block truncate
              text-xl font-black
              leading-none tracking-tight
              ${isPaid ? "text-slate-900" : "text-amber-600"}
            `}
          >
            {formatPrice(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {showViewTicketButton && (
            <button
              type="button"
              onClick={handleViewTicket}
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                border border-slate-200
                bg-white text-slate-600
                shadow-sm transition
                hover:border-slate-900
                hover:bg-slate-900
                hover:text-white
                active:scale-90
              "
              title="Ver ticket"
            >
              <FileText size={16} />
            </button>
          )}

          {showPrintButton && (
            <button
              type="button"
              onClick={handleQuickPrint}
              disabled={isPrinting}
              className={`
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                border shadow-sm transition
                active:scale-90
                disabled:cursor-not-allowed
                disabled:opacity-70

                ${
                  printSuccess
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                }
              `}
              title="Imprimir comanda"
            >
              {isPrinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : printSuccess ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <Printer size={16} />
              )}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
});
