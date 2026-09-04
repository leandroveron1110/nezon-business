import OrderStatusBadge from "@/features/order/components/OrderStatusBadge";
import { UIOrder } from "@/features/order/types/ui-order";
import { X } from "lucide-react";
import { OrderActionsMenu } from "./OrderActionsMenu";
import { OrderStatus } from "@/types/order-state-machine";

interface OrderDetailHeaderProps {
  safeOrder: UIOrder;
  handlePrint: () => void;
  onClose: () => void;
  onToggleDeliveryType: (nextType: "DELIVERY" | "TAKE_AWAY") => void;
    OrderCancellationActions: any;
    handleCancelOrder: (targetStatus: OrderStatus) => void;
}

export function OrderDetailHeader({
  safeOrder,
  handlePrint,
  onClose,
  onToggleDeliveryType,
  OrderCancellationActions,
  handleCancelOrder
}: OrderDetailHeaderProps) {
  return (
    <div className="px-4 py-3 border-b flex justify-between items-center bg-slate-50 shrink-0 relative">
      {/* ID de la orden y Badge */}
      <div className="flex items-center gap-2">
        <span className="font-black text-xl tracking-tighter italic text-slate-800">
          #{safeOrder.id.slice(-4)}
        </span>
        <OrderStatusBadge
          deliveryStatus={safeOrder.deliveryStatus}
          status={safeOrder.status}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        {/* Componente del Menú de Acciones */}
        <OrderActionsMenu
          safeOrder={safeOrder}
          handlePrint={handlePrint}
          onToggleDeliveryType={onToggleDeliveryType}
          OrderCancellationActions={OrderCancellationActions}
          handleCancelOrder={handleCancelOrder}
        />

        {/* Botón de Cerrar Modal/Drawer */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          title="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}