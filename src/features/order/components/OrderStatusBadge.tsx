// src/components/OrderStatusBadge.tsx
import React from "react";
import {
  CheckCircle, Clock, Package, XCircle, Truck, Building,
  Loader2, AlertTriangle, MapPin, Clipboard, CreditCard,
  RotateCcw, ShieldAlert,
} from "lucide-react";
import { OrderStatus, PaymentMethodType, PaymentStatus } from "@/types/order";

interface Props {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderPaymentMethod: PaymentMethodType;
}

const statusMap: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  // 1. Estados iniciales y pagos
  [OrderStatus.PENDING]: { label: "Esperando Pago", color: "bg-amber-100 text-amber-800 border-amber-200", Icon: Clock },
  [OrderStatus.WAITING_FOR_PAYMENT]: { label: "Pendiente Transf.", color: "bg-amber-50 text-amber-700 border-amber-200", Icon: CreditCard },
  [OrderStatus.PAYMENT_IN_PROGRESS]: { label: "Validar Pago", color: "bg-blue-600 text-white border-blue-700 animate-pulse", Icon: Loader2 },
  [OrderStatus.PAYMENT_CONFIRMED]: { label: "Pago OK", color: "bg-indigo-100 text-indigo-800 border-indigo-200", Icon: CheckCircle },

  // 2. Gestión de Negocio
  [OrderStatus.PENDING_CONFIRMATION]: { label: "Nuevo Pedido", color: "bg-blue-100 text-blue-800 border-blue-200", Icon: AlertTriangle },
  [OrderStatus.CONFIRMED]: { label: "Confirmado", color: "bg-green-100 text-green-800 border-green-200", Icon: CheckCircle },
  [OrderStatus.PREPARING]: { label: "En Cocina", color: "bg-orange-100 text-orange-800 border-orange-200", Icon: Package },
  [OrderStatus.REJECTED_BY_BUSINESS]: { label: "Negocio Rechazó", color: "bg-red-100 text-red-800 border-red-200", Icon: XCircle },

  // 3. Logística
  [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: { label: "Listo p/ Retiro", color: "bg-teal-100 text-teal-800 border-teal-200", Icon: Building },
  [OrderStatus.READY_FOR_DELIVERY_PICKUP]: { label: "Listo p/ Envío", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200", Icon: MapPin },
  [OrderStatus.DELIVERY_PENDING]: { label: "Buscando Cadete", color: "bg-purple-100 text-purple-800 border-purple-200", Icon: Loader2 },
  [OrderStatus.DELIVERY_ASSIGNED]: { label: "Cadete Asignado", color: "bg-purple-600 text-white border-purple-700", Icon: Truck },
  [OrderStatus.DELIVERY_ACCEPTED]: { label: "Cadete en Camino", color: "bg-blue-100 text-blue-800 border-blue-200", Icon: Truck },
  [OrderStatus.DELIVERY_REJECTED]: { label: "Cadete Rechazó", color: "bg-red-50 text-red-700 border-red-200", Icon: RotateCcw },
  [OrderStatus.DELIVERY_REASSIGNING]: { label: "Re-asignando", color: "bg-purple-50 text-purple-700 border-purple-200", Icon: Loader2 },
  
  // 4. Transporte
  [OrderStatus.OUT_FOR_PICKUP]: { label: "Buscando Pedido", color: "bg-orange-50 text-orange-700 border-orange-200", Icon: Truck },
  [OrderStatus.PICKED_UP]: { label: "En Viaje", color: "bg-blue-600 text-white border-blue-700", Icon: MapPin },
  [OrderStatus.OUT_FOR_DELIVERY]: { label: "Llegando", color: "bg-indigo-600 text-white border-indigo-700", Icon: MapPin },
  
  // 5. Finalización
  [OrderStatus.DELIVERED]: { label: "Entregado", color: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle },
  [OrderStatus.COMPLETED]: { label: "Finalizado", color: "bg-green-600 text-white border-green-700", Icon: CheckCircle },
  
  // 6. Problemas y Cancelaciones
  [OrderStatus.DELIVERY_FAILED]: { label: "Envío Fallido", color: "bg-red-600 text-white border-red-700", Icon: ShieldAlert },
  [OrderStatus.RETURNED]: { label: "Devuelto", color: "bg-slate-200 text-slate-800 border-slate-300", Icon: RotateCcw },
  [OrderStatus.REFUNDED]: { label: "Reembolsado", color: "bg-slate-200 text-slate-800 border-slate-300", Icon: RotateCcw },
  [OrderStatus.CANCELLED_BY_USER]: { label: "Canceló Cliente", color: "bg-red-100 text-red-800 border-red-200", Icon: XCircle },
  [OrderStatus.CANCELLED_BY_BUSINESS]: { label: "Canceló Negocio", color: "bg-red-100 text-red-800 border-red-200", Icon: XCircle },
  [OrderStatus.CANCELLED_BY_DELIVERY]: { label: "Canceló Cadete", color: "bg-red-100 text-red-800 border-red-200", Icon: XCircle },
  [OrderStatus.FAILED]: { label: "Error Sistema", color: "bg-red-900 text-white border-red-950", Icon: AlertTriangle },
};

export default function OrderStatusBadge({ status, paymentStatus, orderPaymentMethod }: Props) {
  
  // Lógica especial para Transferencias (Invisibiliza el status general si el pago es prioridad)
  if (orderPaymentMethod === PaymentMethodType.TRANSFER) {
    if (paymentStatus === PaymentStatus.IN_PROGRESS) {
      const s = statusMap[OrderStatus.PAYMENT_IN_PROGRESS];
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-tighter border-2 ${s.color}`}>
          <Loader2 size={12} className="animate-spin" strokeWidth={3} /> {s.label}
        </span>
      );
    }
  }

  // Lógica para Efectivo
  if (orderPaymentMethod === PaymentMethodType.CASH && status === OrderStatus.PENDING_CONFIRMATION) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black rounded-full bg-slate-100 text-slate-700 border-2 border-slate-200 uppercase tracking-tighter">
        <Clipboard size={12} strokeWidth={3} /> Pago Efectivo
      </span>
    );
  }

  const s = statusMap[status] || { label: "Desconocido", color: "bg-gray-100 text-gray-500 border-gray-200", Icon: AlertTriangle };
  const Icon = s.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-tighter border-2 ${s.color}`}>
      <Icon size={12} strokeWidth={3} className={status === OrderStatus.DELIVERY_PENDING ? "animate-spin" : ""} /> 
      {s.label}
    </span>
  );
}