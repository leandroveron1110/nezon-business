import { formatPrice } from "@/features/common/utils/formatPrice";
import { DeliveryType } from "@/features/order/types/order";
import { UIOrder } from "@/features/order/types/ui-order";
import { OrderStatus } from "@/types/order-state-machine";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface OrderDetailFooterProps {
  safeOrder: UIOrder;
  isPaid: boolean;
  canShowActions: () => boolean;
  loading: boolean;
  handleTogglePayment: () => void;
  action?: any;
  handleAdvance: () => void;
}

export function OrderDetailFooter({
  safeOrder,
  isPaid,
  canShowActions,
  loading,
  handleTogglePayment,
  action,
  handleAdvance,
}: OrderDetailFooterProps) {
  return (
    <div className="p-4 border-t bg-slate-50 space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="border-b border-slate-200/60 pb-2 space-y-1">
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>Subtotal Productos:</span>
          <span className="font-mono font-bold">
            {formatPrice(safeOrder.total - (safeOrder.totalDeliveryCost ?? 0))}
          </span>
        </div>
        {safeOrder.deliveryType === DeliveryType.DELIVERY && (
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Costo de Envío (Base):</span>
            <span className="font-mono font-bold text-blue-600">
              +{formatPrice(safeOrder.totalDeliveryCost ?? 0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <CreditCard size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {safeOrder.orderPaymentMethod}
            </span>
          </div>
          <div>
            {isPaid ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={14} />
                <span className="text-[11px] font-black uppercase tracking-tighter">
                  Cobrado
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 animate-pulse">
                <AlertCircle size={14} />
                <span className="text-[11px] font-black uppercase tracking-tighter">
                  Pendiente de Pago
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-black block mb-1 tracking-widest leading-none">
            TOTAL NETO
          </span>
          <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
            {formatPrice(safeOrder.total)}
          </span>
        </div>
      </div>

      {canShowActions() && (
        <>
          <div className="flex gap-2">
            <button
              onClick={handleTogglePayment}
              disabled={loading}
              className={`px-4 py-3 rounded-xl font-black text-xs border-2 transition-all ${
                isPaid
                  ? "bg-white text-slate-300 border-slate-100"
                  : "bg-emerald-600 text-white border-emerald-600 active:scale-95"
              }`}
            >
              {isPaid ? "COBRADO" : "COBRAR"}
            </button>

            {action && (
              <button
                onClick={handleAdvance}
                disabled={loading}
                className={`flex-1 min-w-0 ${action.color} text-white py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <span className="truncate">{action.label}</span>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
