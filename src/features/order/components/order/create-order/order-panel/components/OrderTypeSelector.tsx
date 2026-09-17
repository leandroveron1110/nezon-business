"use client";

import { CalendarClock, Clock3, Store, Truck, Zap } from "lucide-react";
import { OrderScheduling } from "../../OrderScheduling";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================




// ============================================================================
// COMBINED ORDER TYPE SELECTOR CONTAINER
// ============================================================================

interface OrderTypeSelectorProps {
  deliveryType: "PICKUP" | "DELIVERY";
  setDeliveryType: (v: "PICKUP" | "DELIVERY") => void;
  scheduledAt: Date | null;
  setScheduledAt: (v: Date | null) => void;
}

export function OrderTypeSelector({
  deliveryType,
  setDeliveryType,
  scheduledAt,
  setScheduledAt,
}: OrderTypeSelectorProps) {
  const isDelivery = deliveryType === "DELIVERY";

  return (
    <div className="w-full shrink-0 border-b border-slate-200 bg-white">
      {/* Pickup / Delivery Tabs */}
      <div className="flex h-8 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setDeliveryType("PICKUP")}
          className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-wider transition-colors ${
            !isDelivery
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Store className="h-3 w-3" />
          RETIRO
        </button>

        <button
          type="button"
          onClick={() => setDeliveryType("DELIVERY")}
          className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-black tracking-wider transition-colors ${
            isDelivery
              ? "bg-blue-600 text-white"
              : "bg-slate-50 text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Truck className="h-3 w-3" />
          ENVÍO
        </button>
      </div>

      {/* Compact Schedule Controls */}
      <OrderScheduling onChange={setScheduledAt} scheduledAt={scheduledAt} />
    </div>
  );
}