import { UIOrder } from "@/features/order/types/ui-order";
import { User, Package, Clock, RefreshCw } from "lucide-react";

interface OrderDetailSubHeaderProps {
  safeOrder: UIOrder;
  canShowMinutes: () => boolean;
  timeFormatted: any;
}

export function OrderDetailSubHeader({
  safeOrder,
  canShowMinutes,
  timeFormatted,
}: OrderDetailSubHeaderProps) {
  return (
    <div className="px-4 py-2 bg-white border-b flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-tight shrink-0">
      <span className="flex items-center gap-1 text-slate-600">
        <User size={13} /> {safeOrder.user.fullName}
      </span>

      {canShowMinutes() && timeFormatted && (
        <span
          className={`flex items-center gap-1 font-bold ${
            timeFormatted.isLate
              ? "text-red-600"
              : timeFormatted.isUrgent
                ? "text-orange-500"
                : "text-slate-600"
          }`}
        >
          <Clock size={13} /> {timeFormatted.display}
        </span>
      )}
    </div>
  );
}
