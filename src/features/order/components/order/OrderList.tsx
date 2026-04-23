import {
  Package,
  Truck,
  DollarSign,
  Wallet,
} from "lucide-react";

import OrderStatusBadge from "../OrderStatusBadge";
import { formatPrice } from "@/features/common/utils/formatPrice";
import {
  DeliveryType,
  OrderStatus,
  PaymentMethodType,
} from "@/types/order";
import { IOrder } from "../../types/order";

interface Props {
  order: IOrder;
  onClick: () => void;
}

export function OrderList({ order, onClick }: Props) {
  const createdAt = new Date(order.createdAt);
  const time = createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  
  const isPickup = order.deliveryType === DeliveryType.PICKUP;
  const isCash = order.orderPaymentMethod === PaymentMethodType.CASH;

  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-blue-50/50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
    >
      {/* MOBILE: Card layout */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            #{order.id.slice(-6)} • {time}
          </span>
          <span className="text-lg font-black text-gray-900">{formatPrice(order.total)}</span>
        </div>
        <div className="font-bold text-gray-800">{order.user.fullName}</div>
        <div className="flex justify-between items-center">
          {/* <OrderStatusBadge status={order.status} {...order} /> */}
          <div className="flex gap-2">
             {isPickup ? <Package className="w-4 h-4 text-orange-500" /> : <Truck className="w-4 h-4 text-blue-500" />}
             {isCash ? <DollarSign className="w-4 h-4 text-green-600" /> : <Wallet className="w-4 h-4 text-purple-600" />}
          </div>
        </div>
      </div>

      {/* DESKTOP: Row layout */}
      <div className="hidden md:grid grid-cols-[100px_1fr_150px_140px_140px_120px] items-center px-6 py-4 text-sm">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
          <span className="text-xs text-gray-400 font-medium">{time} hs</span>
        </div>

        <div className="flex flex-col truncate pr-4">
          <span className="font-semibold text-gray-800 truncate">{order.user.fullName}</span>
          <span className="text-xs text-gray-400 italic">{order.user.phone || 'Sin teléfono'}</span>
        </div>

        {/* <OrderStatusBadge status={order.status as OrderStatus} {...order} /> */}

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
      </div>
    </div>
  );
}
