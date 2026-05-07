"use client";

import React from "react";
import {
  BadgeCheck, ChefHat, CircleDashed, LoaderCircle,
  PackageCheck, Truck, XCircle, Clock, CheckCircle2,
  HandHelping, Ban,
} from "lucide-react";
import { DeliveryStatus, OrderStatus } from "@/types/order-state-machine";

interface Props {
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
}

const badgeBase = "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight border shadow-sm";

const orderStatusMap: Record<OrderStatus, { label: string; color: string; Icon: any }> = {
  [OrderStatus.PENDING]: {
    label: "Nuevo",
    color: "bg-orange-100 text-orange-800 border-orange-300", 
    Icon: CircleDashed,
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    Icon: BadgeCheck,
  },
  [OrderStatus.PREPARING]: {
    label: "En Cocina",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    Icon: ChefHat,
  },
  [OrderStatus.READY]: {
    label: "Listo",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Icon: PackageCheck,
  },
  [OrderStatus.COMPLETED]: {
    label: "Entregado",
    color: "bg-slate-100 text-slate-500 border-slate-200 shadow-none",
    Icon: CheckCircle2,
  },
  [OrderStatus.REJECTED]: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800 border-red-300",
    Icon: Ban,
  },
  [OrderStatus.CANCELLED]: {
    label: "Cancelado",
    color: "bg-slate-200 text-slate-600 border-slate-300",
    Icon: XCircle,
  },
};

export default function OrderStatusBadge({ status, deliveryStatus }: Props) {
  const order = orderStatusMap[status];

  const renderDeliveryInfo = () => {
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) return null;
    
    if (deliveryStatus === DeliveryStatus.NOT_APPLICABLE) {
      return (
        <div className={`${badgeBase} bg-white text-slate-700 border-slate-200`}>
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
      <div className={`${badgeBase} ${order.color}`}>
        <order.Icon size={12} strokeWidth={3} />
        {order.label}
      </div>
      {renderDeliveryInfo()}
    </div>
  );
}