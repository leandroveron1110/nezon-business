"use client";

import {
  Printer,
  Loader2,
  Package,
  Truck,
  AlertCircle,
  Banknote,
  CreditCard,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/features/common/utils/formatPrice";
import {
  DeliveryType,
  IOrderShortDto,
  PaymentMethodType,
  PaymentStatus,
} from "@/types/order";
import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>;
}

export function OrderList({ order, onClick, onPrintDirect }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  const time = new Date(order.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPickup = order.deliveryType === DeliveryType.PICKUP;
  const isWebOrder = order.origin === "APP";
  const isPaid = order.paymentStatus === PaymentStatus.CONFIRMED;

  const handleQuickPrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPrinting(true);
    onPrintDirect(order.id).finally(() => setIsPrinting(false));
  };

  // 🔥 CONFIGURACIÓN ESCALABLE
  const paymentConfig = {
    [PaymentMethodType.CASH]: {
      label: "EFECTIVO",
      icon: Banknote,
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    [PaymentMethodType.TRANSFER]: {
      label: "TRANSFER",
      icon: CreditCard,
      className: "bg-purple-50 border-purple-200 text-purple-700",
    },
    [PaymentMethodType.QR]: {
      label: "QR",
      icon: QrCode,
      className: "bg-blue-50 border-blue-200 text-blue-700",
    },
    [PaymentMethodType.OTHER]: {
      label: "OTRO",
      icon: CreditCard,
      className: "bg-gray-50 border-gray-200 text-gray-700",
    },
  };

  const payment = paymentConfig[order.orderPaymentMethod];

  return (
    <div
      onClick={onClick}
      className={`
        group relative mb-1 transition-all cursor-pointer border-b
        ${isWebOrder ? "bg-blue-50" : "bg-white hover:bg-gray-50"}
      `}
    >
      {/* 🔥 Barra lateral (estado pago) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-2 ${
          isPaid ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {/* ================= MOBILE ================= */}
      <div className="md:hidden p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-gray-400 font-bold">
              #{order.id.slice(-6)}
            </span>
            <p className="font-black text-base text-slate-900">
              {order.customerName}
            </p>
          </div>

          <span className="text-lg font-black text-slate-900">
            {formatPrice(order.total)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge
            orderPaymentMethod={order.orderPaymentMethod}
            status={order.status}
          />

          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black ${payment.className}`}
          >
            <payment.icon size={12} />
            {payment.label}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
            {isPickup ? <Package size={12} /> : <Truck size={12} />}
            {isPickup ? "Retiro" : "Envío"}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-bold">
            {time}
          </span>

          <div className="flex items-center gap-2">
            {!isPaid && (
              <span className="text-red-500 text-[10px] font-black flex items-center gap-1">
                <AlertCircle size={12} /> Cobrar
              </span>
            )}

            <button
              onClick={handleQuickPrint}
              className="p-2 rounded-lg bg-white border border-slate-200"
            >
              {isPrinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex items-center gap-4 px-6 py-4">
        {/* ORIGEN */}
        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-xs font-bold text-slate-400">
            #{order.id.slice(-6).toUpperCase()}
          </span>

          <div className="flex items-center gap-1 text-slate-500">
            {isPickup ? (
              <Package size={14} className="text-orange-500" />
            ) : (
              <Truck size={14} className="text-blue-600" />
            )}
            <span className="text-[10px] font-bold uppercase">
              {isPickup ? "Retiro" : "Envío"}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 uppercase truncate">
              {order.customerName}
            </h3>

            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {time}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <OrderStatusBadge
              orderPaymentMethod={order.orderPaymentMethod}
              status={order.status}
            />

            <div className="h-1 w-1 bg-slate-300 rounded-full" />

            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black border ${payment.className}`}
            >
              <payment.icon size={12} />
              {payment.label}
            </div>
          </div>
        </div>

        {/* DINERO */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            {!isPaid && (
              <div className="flex items-center justify-end gap-1 text-red-600 text-[10px] font-black uppercase mb-0.5">
                <AlertCircle size={12} /> Cobrar
              </div>
            )}

            <div className="text-xl font-black text-slate-900">
              {formatPrice(order.total)}
            </div>
          </div>

          <button
            onClick={handleQuickPrint}
            disabled={isPrinting}
            className={`
              flex items-center justify-center w-12 h-12 rounded-xl transition-all
              ${
                isPrinting
                  ? "bg-slate-100 text-slate-400"
                  : "bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 shadow-sm"
              }
            `}
          >
            {isPrinting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Printer size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}