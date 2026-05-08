"use client";

import React from "react";
import {
  BadgeCheck, ChefHat, CircleDashed, LoaderCircle,
  PackageCheck, Truck, XCircle, Clock, CheckCircle2,
  HandHelping, Ban, Wallet, Check
} from "lucide-react";
import { DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order-state-machine";
import { UI_COLORS } from "@/features/common/utils/ui";

interface Props {
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus; // Agregamos pago
}

const badgeBase = "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight border shadow-sm";

export default function OrderStatusBadge({ status, deliveryStatus, paymentStatus }: Props) {
  
  // 1. Mapeo de estados de pedido usando UI_COLORS
  const orderStatusMap: Record<OrderStatus, { label: string; classes: string; Icon: any }> = {
    [OrderStatus.PENDING]: {
      label: "Nuevo",
      classes: `${UI_COLORS.WARNING.bg} ${UI_COLORS.WARNING.text} ${UI_COLORS.WARNING.border}`,
      Icon: CircleDashed,
    },
    [OrderStatus.CONFIRMED]: {
      label: "Confirmado",
      classes: `${UI_COLORS.INFO.bg} ${UI_COLORS.INFO.text} ${UI_COLORS.INFO.border}`,
      Icon: BadgeCheck,
    },
    [OrderStatus.PREPARING]: {
      label: "En Cocina",
      classes: "bg-amber-100 text-amber-800 border-amber-300",
      Icon: ChefHat,
    },
    [OrderStatus.READY]: {
      label: "Listo",
      classes: `${UI_COLORS.SUCCESS.bg} ${UI_COLORS.SUCCESS.text} ${UI_COLORS.SUCCESS.border}`,
      Icon: PackageCheck,
    },
    [OrderStatus.COMPLETED]: {
      label: "Entregado",
      classes: "bg-slate-100 text-slate-500 border-slate-200 shadow-none",
      Icon: CheckCircle2,
    },
    [OrderStatus.REJECTED]: {
      label: "Rechazado",
      classes: `${UI_COLORS.ERROR.bg} ${UI_COLORS.ERROR.text} ${UI_COLORS.ERROR.border}`,
      Icon: Ban,
    },
    [OrderStatus.CANCELLED]: {
      label: "Cancelado",
      classes: "bg-slate-200 text-slate-600 border-slate-300",
      Icon: XCircle,
    },
  };

  const order = orderStatusMap[status];

  // 2. Render de Información de Pago (Accesibilidad)
  const renderPaymentBadge = () => {
    if (!paymentStatus || status === OrderStatus.CANCELLED || status === OrderStatus.REJECTED) return null;

    const isPaid = paymentStatus === PaymentStatus.CONFIRMED;

    return (
      <div className={`
        ${badgeBase} 
        ${isPaid 
          ? `${UI_COLORS.SUCCESS.bg} ${UI_COLORS.SUCCESS.text} ${UI_COLORS.SUCCESS.border}` 
          : `${UI_COLORS.WARNING.bg} ${UI_COLORS.WARNING.text} ${UI_COLORS.WARNING.border}`
        }
      `}>
        {isPaid ? <Check size={12} strokeWidth={4} /> : <Wallet size={12} strokeWidth={3} />}
        {isPaid ? "Cobrado" : "Por Cobrar"}
      </div>
    );
  };

  // 3. Render de Información de Logística
  const renderDeliveryInfo = () => {
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) return null;
    
    if (deliveryStatus === DeliveryStatus.NOT_APPLICABLE) {
      return (
        <div className={`${badgeBase} ${UI_COLORS.PICKUP.bg} ${UI_COLORS.PICKUP.text} ${UI_COLORS.PICKUP.border}`}>
          <HandHelping size={12} strokeWidth={3} /> Retiro
        </div>
      );
    }

    if (deliveryStatus === DeliveryStatus.SHIPPED) {
      return (
        <div className={`${badgeBase} bg-sky-100 text-sky-800 border-sky-300`}>
          <Truck size={12} strokeWidth={3} /> En Viaje
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Badge de Estado Principal */}
      <div className={`${badgeBase} ${order.classes}`}>
        <order.Icon size={12} strokeWidth={3} />
        {order.label}
      </div>

      {/* Badge de Pago (Nuevo) */}
      {renderPaymentBadge()}

      {/* Badge de Logística */}
      {renderDeliveryInfo()}
    </div>
  );
}