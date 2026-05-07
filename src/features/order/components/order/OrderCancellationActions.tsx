"use client";

import { OrderStatus, DeliveryStatus } from "@/types/order-state-machine";
import { XCircle, Ban, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  onCancel: (newStatus: OrderStatus) => void;
  loading: boolean;
}

export function OrderCancellationActions({ status, deliveryStatus, onCancel, loading }: Props) {
  // --- LÓGICA DE NEGOCIO ---
  // Un negocio puede cancelar/rechazar siempre y cuando la orden no esté COMPLETED o CANCELLED.
  // Pero si el hilo de delivery ya está en SHIPPED (el cadete ya tiene la comida), 
  // la cancelación debería requerir una confirmación extra o gestionarse distinto.
  
  const isFinalState = [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(status);
  const isAlreadyOnStreet = deliveryStatus === DeliveryStatus.SHIPPED;

  // Si ya terminó o ya está en la calle, no mostramos acciones rápidas de cancelación
  if (isFinalState || isAlreadyOnStreet) return null;

  return (
    <div className="mt-4 pt-4 border-t border-red-100 border-dashed">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={12} className="text-red-500" />
        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
          Zona de Peligro
        </span>
      </div>

      <div className="flex gap-2">
        {/* RECHAZAR: Generalmente usado para pedidos PENDING que el local no puede tomar */}
        <button
          disabled={loading}
          onClick={() => onCancel(OrderStatus.REJECTED)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[11px] font-black hover:bg-red-100 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
          RECHAZAR
        </button>
        
        {/* CANCELAR: Para órdenes CONFIRMED o PREPARING que surgieron problemas */}
        <button
          disabled={loading}
          onClick={() => onCancel(OrderStatus.CANCELLED)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-black hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          CANCELAR
        </button>
      </div>

      {deliveryStatus === DeliveryStatus.REQUESTED && (
        <p className="mt-2 text-[9px] text-red-400 font-bold text-center uppercase tracking-tight">
          ⚠️ Esto cancelará automáticamente el pedido de cadetería
        </p>
      )}
    </div>
  );
}