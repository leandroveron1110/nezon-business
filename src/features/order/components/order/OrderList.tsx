import { Printer, Loader2, Package, Truck, DollarSign, Wallet } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { DeliveryType, IOrderShortDto, PaymentMethodType } from "@/types/order";
import OrderStatusBadge from "../OrderStatusBadge";

interface Props {
  order: IOrderShortDto;
  onClick: () => void;
  onPrintDirect: (id: string) => Promise<void>; // Nueva prop
}

export function OrderList({ order, onClick, onPrintDirect }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const createdAt = new Date(order.createdAt);
  const time = createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  
  const isPickup = order.deliveryType === DeliveryType.PICKUP;
  const isCash = order.orderPaymentMethod === PaymentMethodType.CASH;

  const handleQuickPrint = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitamos que se abra el modal
    setIsPrinting(true);
    try {
      await onPrintDirect(order.id);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-blue-50/50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 border-b border-gray-50"
    >
      {/* MOBILE: Card layout */}
      <div className="md:hidden p-4 space-y-3 relative">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            #{order.id.slice(-6)} • {time}
          </span>
          <div className="flex items-center gap-3">
             {/* Botón rápido Mobile */}
             <button 
               onClick={handleQuickPrint}
               className="p-2 bg-gray-100 rounded-lg text-gray-500 active:bg-blue-600 active:text-white"
             >
               {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
             </button>
             <span className="text-lg font-black text-gray-900">{formatPrice(order.total)}</span>
          </div>
        </div>
        <div className="font-bold text-gray-800">{order.customerName}</div>
        <div className="flex justify-between items-center">
          <OrderStatusBadge status={order.status} orderPaymentMethod={order.orderPaymentMethod} />
          <div className="flex gap-2">
             {isPickup ? <Package className="w-4 h-4 text-orange-500" /> : <Truck className="w-4 h-4 text-blue-500" />}
             {isCash ? <DollarSign className="w-4 h-4 text-green-600" /> : <Wallet className="w-4 h-4 text-purple-600" />}
          </div>
        </div>
      </div>

      {/* DESKTOP: Row layout */}
      <div className="hidden md:grid grid-cols-[100px_1fr_150px_120px_120px_100px_80px] items-center px-6 py-4 text-sm">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
          <span className="text-xs text-gray-400 font-medium">{time} hs</span>
        </div>

        <div className="flex flex-col truncate pr-4">
          <span className="font-semibold text-gray-800 truncate">{order.customerName}</span>
        </div>

        <OrderStatusBadge status={order.status} orderPaymentMethod={order.orderPaymentMethod} />

        <div className="flex items-center gap-2 text-gray-600 font-medium">
          {isPickup ? <Package className="w-4 h-4 opacity-70" /> : <Truck className="w-4 h-4 opacity-70" />}
          <span className="text-xs">{isPickup ? "Retiro" : "Envío"}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 font-medium">
          {isCash ? <DollarSign className="w-4 h-4 text-green-600" /> : <Wallet className="w-4 h-4 text-blue-600" />}
          <span className="text-xs">{isCash ? "Efectivo" : "Transf."}</span>
        </div>

        <div className="text-right">
          <span className="font-bold text-gray-900 text-base">{formatPrice(order.total)}</span>
        </div>

        {/* ACCIÓN RÁPIDA: IMPRIMIR */}
        <div className="flex justify-end">
          <button
            onClick={handleQuickPrint}
            disabled={isPrinting}
            className={`p-2 rounded-xl border-2 transition-all ${
              isPrinting 
              ? "bg-gray-50 border-gray-100 text-gray-400" 
              : "border-gray-100 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-white"
            }`}
          >
            {isPrinting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}