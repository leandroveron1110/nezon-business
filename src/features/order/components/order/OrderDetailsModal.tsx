"use client";

import { useState } from "react";
import {
  X,
  Truck,
  AlertTriangle,
  Printer,
} from "lucide-react";

import { EOrderStatus, IOrder } from "../../types/order";
import {
  DeliveryType,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from "@/types/order";

import { formatPrice } from "@/features/common/utils/formatPrice";
import {
  fetchUpdateOrdersByOrderID,
  fetchUpdateOrdersPaymentByOrderID,
} from "../../api/catalog-api";
import { useAlert } from "@/features/common/ui/Alert/Alert";

interface Props {
  order: IOrder;
  onClose: () => void;
}

const getNextOrderStatus = (
  current: EOrderStatus,
  deliveryType: DeliveryType,
): EOrderStatus | null => {
  switch (current) {
    case EOrderStatus.PENDING:
    case EOrderStatus.CONFIRMED:
      return EOrderStatus.PREPARING;

    case EOrderStatus.PREPARING:
      return deliveryType === DeliveryType.PICKUP
        ? EOrderStatus.READY_FOR_CUSTOMER_PICKUP
        : EOrderStatus.READY_FOR_DELIVERY_PICKUP;

    case EOrderStatus.READY_FOR_CUSTOMER_PICKUP:
    case EOrderStatus.READY_FOR_DELIVERY_PICKUP:
      return EOrderStatus.COMPLETED;

    default:
      return null;
  }
};

// Fuera del componente para mantenerlo puro
const getStatusAction = (status: OrderStatus, deliveryType: DeliveryType) => {
  const actions: Record<
    string,
    { label: string; next: OrderStatus; color: string }
  > = {
    [OrderStatus.PENDING]: {
      label: "ACEPTAR PEDIDO",
      next: OrderStatus.CONFIRMED,
      color: "bg-blue-600",
    },
    [OrderStatus.CONFIRMED]: {
      label: "EMPEZAR A PREPARAR",
      next: OrderStatus.PREPARING,
      color: "bg-orange-500",
    },
    [OrderStatus.PREPARING]: {
      label:
        deliveryType === DeliveryType.PICKUP
          ? "LISTO PARA RETIRO"
          : "LLAMAR CADETE",
      next:
        deliveryType === DeliveryType.PICKUP
          ? OrderStatus.READY_FOR_CUSTOMER_PICKUP
          : OrderStatus.READY_FOR_DELIVERY_PICKUP,
      color: "bg-green-600",
    },
    [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: {
      label: "ENTREGAR Y CERRAR",
      next: OrderStatus.COMPLETED,
      color: "bg-gray-900",
    },
  };
  return actions[status] || null;
};

export function OrderDetailsModal({ order, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const { addAlert } = useAlert();

  const action = getStatusAction(order.status, order.deliveryType);
  const isTransfer = order.orderPaymentMethod === PaymentMethodType.TRANSFER;
  const needsPaymentConfirmation =
    isTransfer && order.paymentStatus !== PaymentStatus.CONFIRMED;

  const handleAdvance = async () => {
    if (!action) return;
    try {
      setLoading(true);
      // Si es transferencia y está pendiente, confirmamos pago y avanzamos orden
      if (needsPaymentConfirmation) {
        await fetchUpdateOrdersPaymentByOrderID(
          order.id,
          PaymentStatus.CONFIRMED,
        );
      }
      await fetchUpdateOrdersByOrderID(order.id, action.next);
      addAlert({
        message: `Pedido en estado: ${action.next}`,
        type: "success",
      });
      onClose();
    } catch (e) {
      addAlert({ message: "Error al actualizar", type: "error" });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* HEADER: Info del Cliente */}
        <div className="p-4 border-b flex justify-between items-start bg-gray-50 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {order.user.fullName}
            </h2>
            <button
              onClick={() =>
                window.open(`https://wa.me/${order.user.phone}`, "_blank")
              }
              className="text-green-600 text-sm font-medium flex items-center gap-1 mt-1"
            >
              <Truck className="w-3 h-3" /> WhatsApp: {order.user.phone}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="text-gray-500" />
          </button>
        </div>

        {/* ALERTA DE PAGO (CRÍTICO) */}
        {isTransfer && (
          <div
            className={`p-3 flex items-center gap-3 ${needsPaymentConfirmation ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}`}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold">PAGO POR TRANSFERENCIA</p>
              <p>
                {needsPaymentConfirmation
                  ? "Verificar comprobante antes de avanzar."
                  : "Pago ya confirmado."}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* LISTA DE PRODUCTOS */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 border-b border-gray-100 last:border-0"
              >
                <div className="bg-gray-900 text-white font-bold h-8 w-8 rounded flex items-center justify-center flex-shrink-0">
                  {item.quantity}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 uppercase">
                    {item.productName}
                  </p>
                  {item.optionGroups
                    .flatMap((g) => g.options)
                    .map((o) => (
                      <span
                        key={o.id}
                        className="text-sm text-gray-500 mr-2 italic"
                      >
                        +{o.optionName}
                      </span>
                    ))}
                  {item.notes && (
                    <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium">
                      NOTAS: {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* OBSERVACIONES DEL CLIENTE */}
          {order.customerObservations && (
            <div className="p-3 bg-blue-50 rounded-xl text-blue-800 text-sm italic">
              " {order.customerObservations} "
            </div>
          )}
        </div>

        {/* TOTAL Y ACCIÓN */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Total a cobrar
            </span>
            <span className="text-3xl font-black text-gray-900">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              disabled={loading}
              onClick={onClose}
              className="px-6 py-4 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              SALIR
            </button>
            {action && (
              <button
                onClick={handleAdvance}
                disabled={loading}
                className={`flex-1 ${action.color} text-white rounded-xl py-4 font-black text-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2`}
              >
                {loading ? "..." : action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
