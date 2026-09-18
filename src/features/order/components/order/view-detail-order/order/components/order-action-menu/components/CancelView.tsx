import { ArrowLeft } from "lucide-react";
import { UIOrder } from "@/features/order/types/ui-order";
import { OrderStatus } from "@/types/order-state-machine";

interface CancelViewProps {
  safeOrder: UIOrder;
  OrderCancellationActions: any;
  handleCancelOrder: (targetStatus: OrderStatus) => void;
  loading: boolean;
  onBack: () => void;
}

export function CancelView({
  safeOrder,
  OrderCancellationActions,
  handleCancelOrder,
  loading,
  onBack,
}: CancelViewProps) {
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="text-xs font-bold text-slate-700">
          Opciones de rechazo / cancelación
        </div>
      </div>

      {OrderCancellationActions && handleCancelOrder ? (
        <OrderCancellationActions
          status={safeOrder.status}
          deliveryStatus={safeOrder.deliveryStatus}
          onCancel={(targetStatus: OrderStatus) => {
            handleCancelOrder(targetStatus);
          }}
          loading={loading}
        />
      ) : (
        <div className="text-xs text-slate-400">
          No hay acciones de cancelación disponibles.
        </div>
      )}
    </div>
  );
}
