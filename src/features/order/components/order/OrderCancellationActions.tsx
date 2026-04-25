// src/features/business/components/OrderCancellationActions.tsx

import { OrderStatus } from "@/types/order";
import { XCircle, Ban, AlertTriangle } from "lucide-react";

interface Props {
  status: OrderStatus;
  onCancel: (reason: OrderStatus) => void;
  loading: boolean;
}

export function OrderCancellationActions({ status, onCancel, loading }: Props) {
  // Solo permitimos cancelar en estados lógicos (antes de que el pedido esté en la calle)
  const canCancel = [
    OrderStatus.PENDING,
    OrderStatus.PENDING_CONFIRMATION,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING
  ].includes(status);

  if (!canCancel) return null;

  return (
    <div className="mt-4 pt-4 border-t border-red-50 border-dashed">
      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 block">
        Zona de Peligro
      </span>
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => onCancel(OrderStatus.REJECTED_BY_BUSINESS)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[11px] font-black hover:bg-red-100 transition-colors"
        >
          <Ban size={14} /> RECHAZAR
        </button>
        
        <button
          disabled={loading}
          onClick={() => onCancel(OrderStatus.CANCELLED_BY_BUSINESS)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-black hover:bg-slate-200 transition-colors"
        >
          <XCircle size={14} /> CANCELAR
        </button>
      </div>
    </div>
  );
}