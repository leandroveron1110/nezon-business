"use client";

import { OrderStatus, DeliveryStatus } from "@/types/order-state-machine";
import { XCircle, Ban, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  onCancel: (newStatus: OrderStatus) => void;
  loading: boolean;
}

export function OrderCancellationActions({
  status,
  deliveryStatus,
  onCancel,
  loading,
}: Props) {
  // LÓGICA DE NEGOCIO:
  // No mostrar opciones si la orden ya está finalizada o si el repartidor ya lleva el pedido.
  const isFinalState = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
  ].includes(status);
  
  const isAlreadyOnStreet = deliveryStatus === DeliveryStatus.SHIPPED;

  if (isFinalState || isAlreadyOnStreet) {
    return (
      <div className="p-2 text-center text-xs text-slate-400 italic">
        Esta orden no se puede rechazar ni cancelar en su estado actual.
      </div>
    );
  }

  const isPending = status === OrderStatus.PENDING;

  return (
    <div className="space-y-2">
      {/* Indicador sutil de advertencia */}
      <div className="flex items-center gap-1.5 text-red-500">
        <span className="text-[10px] font-black uppercase tracking-wider">
          Zona de Peligro
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* RECHAZAR: Ideal si el pedido aún está PENDING y no se puede tomar */}
        {(isPending || status === OrderStatus.CONFIRMED) && (
          <button
            type="button"
            disabled={loading}
            onClick={() => onCancel(OrderStatus.REJECTED)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Ban size={14} />
            )}
            <span>Rechazar pedido</span>
          </button>
        )}

        {/* CANCELAR: Para órdenes en preparación o avance */}
        <button
          type="button"
          disabled={loading}
          onClick={() => onCancel(OrderStatus.CANCELLED)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          <span>Cancelar pedido</span>
        </button>
      </div>

      {/* Notificación si afecta la cadetería */}
      {deliveryStatus === DeliveryStatus.REQUESTED && (
        <p className="text-[9px] text-red-500 font-bold text-center uppercase tracking-tight leading-tight pt-1">
          Se cancelará la solicitud de cadetería asociada.
        </p>
      )}
    </div>
  );
}