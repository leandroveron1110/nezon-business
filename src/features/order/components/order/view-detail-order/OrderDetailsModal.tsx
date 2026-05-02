"use client";

import { useMemo, useRef, useState } from "react";
import { X, AlertTriangle, ChevronRight, Loader2, Printer } from "lucide-react";

import {
  OrderStatus,
  DeliveryType,
  PaymentMethodType,
  PaymentStatus,
  ALLOWED_TRANSITIONS,
} from "@/types/order";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import {
  fetchUpdateOrdersByOrderID,
  fetchUpdateOrdersPaymentByOrderID,
} from "../../../api/catalog-api";
import { useFetchOrderById } from "../../../hooks/useFetchOrders";
import OrderStatusBadge from "../../OrderStatusBadge";
import { queryClient } from "@/lib/queryClient";
import { OrderCancellationActions } from "../OrderCancellationActions";
import { usePrinterSettings } from "../../../hooks/usePrinterSettings";
import { OrderTicket } from "../OrderTicket";
import { usePrintTicket } from "../../../hooks/usePrintTicket";
import { useGetOrderById } from "../../../hooks/useGetOrderById";
import { updateOrderStatusInteractor } from "@/features/common/database/interactors/update-order-status.interactor";

interface Props {
  orderId: string;
  onClose: () => void;
}

/**
 * Mapeo de acciones sugeridas según el estado actual.
 * Esta es la "intención" del negocio, que luego será validada por el Motor de Estados.
 */
const getStatusAction = (status: OrderStatus, deliveryType: DeliveryType) => {
  const actions: Record<
    string,
    { label: string; next: OrderStatus; color: string }
  > = {
    // --- FASE 1: PAGOS (Si el negocio ayuda a gestionar) ---
    [OrderStatus.PENDING]: {
      label: "CONFIRMAR INICIO",
      next: OrderStatus.WAITING_FOR_PAYMENT,
      color: "bg-slate-600 hover:bg-slate-700",
    },
    [OrderStatus.PAYMENT_CONFIRMED]: {
      label: "PASAR A REVISIÓN",
      next: OrderStatus.PENDING_CONFIRMATION,
      color: "bg-indigo-600 hover:bg-indigo-700",
    },

    // --- FASE 2: GESTIÓN DE TIENDA (Lo más común) ---
    [OrderStatus.PENDING_CONFIRMATION]: {
      label: "ACEPTAR PEDIDO",
      next: OrderStatus.CONFIRMED,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    [OrderStatus.CONFIRMED]: {
      label: "EMPEZAR A PREPARAR",
      next: OrderStatus.PREPARING,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    [OrderStatus.PREPARING]: {
      label:
        deliveryType === DeliveryType.PICKUP
          ? "LISTO PARA RETIRO"
          : "SOLICITAR CADETE",
      next:
        deliveryType === DeliveryType.PICKUP
          ? OrderStatus.READY_FOR_CUSTOMER_PICKUP
          : OrderStatus.READY_FOR_DELIVERY_PICKUP,
      color: "bg-green-600 hover:bg-green-700",
    },

    // --- FASE 3: LOGÍSTICA Y RETIROS ---
    [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: {
      label: "ENTREGAR Y FINALIZAR",
      next: OrderStatus.COMPLETED,
      color: "bg-gray-900 hover:bg-black",
    },
    [OrderStatus.READY_FOR_DELIVERY_PICKUP]: {
      label: "BUSCAR CADETE",
      next: OrderStatus.DELIVERY_PENDING,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    [OrderStatus.DELIVERY_REJECTED]: {
      label: "RE-ASIGNAR CADETE",
      next: OrderStatus.DELIVERY_REASSIGNING,
      color: "bg-red-500 hover:bg-red-600",
    },
    [OrderStatus.DELIVERY_REASSIGNING]: {
      label: "BUSCAR NUEVO CADETE",
      next: OrderStatus.DELIVERY_ASSIGNED,
      color: "bg-purple-600 hover:bg-purple-700",
    },

    // --- FASE 4: FINALIZACIÓN ---
    [OrderStatus.DELIVERED]: {
      label: "COMPLETAR ORDEN",
      next: OrderStatus.COMPLETED,
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    [OrderStatus.DELIVERY_FAILED]: {
      label: "RE-INTENTAR ENVÍO",
      next: OrderStatus.DELIVERY_PENDING,
      color: "bg-amber-600 hover:bg-amber-700",
    },
    [OrderStatus.RETURNED]: {
      label: "CERRAR (DEVUELTO)",
      next: OrderStatus.COMPLETED,
      color: "bg-slate-700 hover:bg-slate-800",
    },
    [OrderStatus.REFUNDED]: {
      label: "CERRAR (REEMBOLSADO)",
      next: OrderStatus.COMPLETED,
      color: "bg-slate-700 hover:bg-slate-800",
    },

    // --- FASE 5: RECUPERACIÓN ---
    [OrderStatus.FAILED]: {
      label: "RE-INTENTAR PEDIDO",
      next: OrderStatus.PENDING,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  };

  return actions[status] || null;
};

export function OrderDetailsModal({ orderId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const { addAlert } = useAlert();
  const { print } = usePrintTicket();
  const ticketRef = useRef<HTMLDivElement>(null);
  // const { data: order, isLoading, error } = useFetchOrderById(orderId);
  const { order, isLoading } = useGetOrderById(orderId);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const { autoPrint } = usePrinterSettings();

  // RECALCULAR AUTOMÁTICAMENTE
  const action = useMemo(() => {
    if (!order) return null;
    return getStatusAction(order.status, order.deliveryType);
  }, [order?.status, order?.deliveryType]); // <--- ESTO es lo que fuerza la actualización

  // VALIDACIÓN SEGURA
  const isTransitionAllowed = useMemo(() => {
    if (!order || !action) return false;
    return ALLOWED_TRANSITIONS[order.status]?.includes(action.next);
  }, [order?.status, action]);

  if (isLoading) return <OrderDetailsSkeleton />;
  if (!order) return null;

  const isTransfer = order.orderPaymentMethod === PaymentMethodType.TRANSFER;
  const needsPaymentConfirmation =
    isTransfer && order.paymentStatus !== PaymentStatus.CONFIRMED;

  const handleAdvance = async () => {
    if (!action || !isTransitionAllowed || loading) return;

    try {
      setLoading(true);

      // Si el negocio tiene activado autoPrint y estamos aceptando el pedido
      // if (action.next === OrderStatus.CONFIRMED && autoPrint) {
      //   // Un pequeño delay para asegurar que el estado se procesó
      //   setTimeout(() => handlePrint(), 500);
      // }

      // 1. Si es transferencia, primero aseguramos la confirmación del pago en el backend
      if (needsPaymentConfirmation) {
        await fetchUpdateOrdersPaymentByOrderID(
          order.id,
          PaymentStatus.CONFIRMED,
        );

        // Actualizamos localmente el estado de pago para que la UI reaccione
        // queryClient.setQueryData(["order", orderId], (old: any) => ({
        //   ...old,
        //   paymentStatus: PaymentStatus.CONFIRMED,
        // }));
      }

      // 2. Avanzamos al siguiente estado lógico
      console.log()
      // await fetchUpdateOrdersByOrderID(order.id, action.next);
      await updateOrderStatusInteractor(order.id, action.next);
    addAlert({
      message: "Orden confirmada localmente",
      duration: 5
    });
      onClose();
    } catch (e) {
      console.log(e)
      addAlert({
        message: "No se pudo actualizar la orden. Intente nuevamente.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (targetStatus: OrderStatus) => {
    const confirmMessage =
      targetStatus === OrderStatus.REJECTED_BY_BUSINESS
        ? "¿Estás seguro de rechazar este pedido?"
        : "¿Deseas cancelar este pedido ya aceptado?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      // 1. Backend
      await fetchUpdateOrdersByOrderID(order.id, targetStatus);

      // 2. Optimistic Update en React Query (Magia)
      queryClient.setQueryData(["order", orderId], (old: any) => ({
        ...old,
        status: targetStatus,
      }));

      addAlert({ message: "Pedido cancelado correctamente", type: "info" });
      onClose(); // Cerramos el modal porque ya no hay acciones posibles
    } catch (e) {
      addAlert({ message: "No se pudo cancelar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (order && ticketRef.current) {
      print(ticketRef.current.innerHTML);
    }
  };

  // En el JSX del Modal, debajo del botón de handleAdvance:

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. HEADER FIJO */}
        <div className="px-5 py-4 border-b bg-gray-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <OrderStatusBadge
              status={order.status}
              paymentStatus={order.paymentStatus}
              orderPaymentMethod={order.orderPaymentMethod}
            />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              #{order.id.slice(-6)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. CUERPO SCROLLEABLE (Aquí va todo lo que crece: Items, Tickets, Notas) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              {order.user.fullName}
            </h2>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/${order.user.phone.replace(/\D/g, "")}`,
                  "_blank",
                )
              }
              className="text-green-600 font-black text-[10px] uppercase underline"
            >
              WhatsApp
            </button>
          </div>

          {/* Listado Compacto */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-gray-50 rounded-2xl p-3 items-center border"
              >
                <div className="bg-gray-900 text-white font-black h-9 w-9 rounded-lg flex items-center justify-center text-sm">
                  {item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase truncate">
                    {item.productName}
                  </p>
                  {item.optionGroups.flatMap((g) => g.options).length > 0 && (
                    <p className="text-[9px] text-gray-500 truncate italic">
                      {item.optionGroups
                        .flatMap((g) => g.options)
                        .map((o) => o.optionName)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Componente Ticket (ahora vive aquí dentro para no robar espacio al botón) */}
        {/* Componente Ticket: Cambiamos hidden por visibilidad absoluta para que el celu lo vea */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            visibility: "visible",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <div ref={ticketRef}>
            {/* En el modal, forzamos KITCHEN porque es para despacho rápido */}
            <OrderTicket order={order} mode="KITCHEN" />
          </div>
        </div>
        {/* 3. FOOTER FIJO (Siempre visible, botones siempre al alcance) */}
        <div className="p-4 border-t bg-white shrink-0 space-y-3">
          {/* Info y Herramientas */}
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-xl font-black italic leading-none">
                {formatPrice(order.total)}
              </span>
            </div>
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase hover:bg-blue-50 px-2 py-1 rounded-lg"
            >
              <Printer size={12} /> Re-Imprimir
            </button>
          </div>

          {/* Botón Principal */}
          {action && (
            <button
              onClick={handleAdvance}
              disabled={loading || !isTransitionAllowed}
              className={`w-full ${action.color} text-white rounded-xl py-3.5 font-black text-sm flex justify-center items-center gap-2 transition-all ${!isTransitionAllowed ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {action.label} <ChevronRight size={14} />
                </>
              )}
            </button>
          )}

          {/* Zona de Peligro Colapsable */}
          <div className="border-t pt-2">
            {!showDangerZone ? (
              <button
                onClick={() => setShowDangerZone(true)}
                className="w-full py-2 rounded-lg border border-red-100 bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <AlertTriangle size={12} /> Gestión de Cancelación
              </button>
            ) : (
              <div className="animate-in fade-in duration-200">
                <OrderCancellationActions
                  status={order.status}
                  onCancel={handleCancelOrder}
                  loading={loading}
                />
                <button
                  onClick={() => setShowDangerZone(false)}
                  className="w-full mt-2 text-[9px] text-gray-400 font-bold uppercase underline"
                >
                  Cancelar acción
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl p-12 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="font-black text-gray-400 text-xs tracking-widest uppercase italic animate-pulse">
          Sincronizando con Nezon...
        </p>
      </div>
    </div>
  );
}
