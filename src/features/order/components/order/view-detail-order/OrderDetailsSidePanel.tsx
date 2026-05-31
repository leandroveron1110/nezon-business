"use client";

import { useMemo, useRef, useState } from "react";
import {
  X,
  Printer,
  User,
  Package,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Bike,
  Undo2,
  Loader2,
  Send,
} from "lucide-react";

import { DeliveryType } from "@/types/order";

import { formatPrice } from "@/features/common/utils/formatPrice";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import OrderStatusBadge from "../../OrderStatusBadge";
import { OrderCancellationActions } from "../OrderCancellationActions";
import { useGetOrderById } from "../../../hooks/useGetOrderById";
import { OrderTicket } from "../ticket-order/OrderTicket";
import { usePrintTicket } from "@/features/order/hooks/usePrintTicket";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";
import { updateOrderStatusOrchestrator } from "@/mini-back/orchestrator/order.orchestrator";
import { DeliveryStatus } from "@/mini-back/core/orders/domain/order-state-machine";

interface Props {
  orderId: string;
  onClose: () => void;
}

/**
 * Mapeo de acciones de estado:
 * Permite saltar de estados de pago directamente a gestión de negocio.
 */
const getStatusAction = (status: OrderStatus, deliveryType: DeliveryType) => {
  const isPickup = deliveryType === DeliveryType.PICKUP;

  const actions: Partial<
    Record<OrderStatus, { label: string; next: OrderStatus; color: string }>
  > = {
    [OrderStatus.PENDING]: {
      label: "ACEPTAR PEDIDO",
      next: OrderStatus.CONFIRMED,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    [OrderStatus.CONFIRMED]: {
      label: "EMPEZAR PREPARACIÓN",
      next: OrderStatus.PREPARING,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    [OrderStatus.PREPARING]: {
      label: isPickup ? "LISTO PARA RETIRO" : "LISTO PARA ENVÍO",
      next: OrderStatus.READY,
      color: "bg-green-600 hover:bg-green-700",
    },
    [OrderStatus.READY]: {
      label: isPickup ? "ENTREGAR Y CERRAR" : "PEDIDO DESPACHADO",
      next: OrderStatus.COMPLETED,
      color: "bg-slate-900 hover:bg-black",
    },
  };

  return actions[status] || null;
};

export function OrderDetailsSidePanel({ orderId, onClose }: Props) {
  const { order, isLoading } = useGetOrderById(orderId);
  const { addAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const { print } = usePrintTicket();

  const safeOrder = order ?? null;

  const minutes = useMemo(() => {
    if (!safeOrder) return 0;
    return Math.floor(
      (Date.now() - new Date(safeOrder.createdAt).getTime()) / 60000,
    );
  }, [safeOrder]);

  const isPaid = safeOrder?.paymentStatus === PaymentStatus.CONFIRMED;

  const action = useMemo(() => {
    if (!safeOrder) return null;
    return getStatusAction(safeOrder.status, safeOrder.deliveryType);
  }, [safeOrder]);

  // ===================================
  // HANDLERS LOGÍSTICOS (CON TU ENUM)
  // ===================================
  const handleSolicitarCadete = async () => {
    if (!safeOrder || loading) return;
    try {
      setLoading(true);
      const result = await updateOrderStatusOrchestrator({
        idTemp: safeOrder.idTemp,
        thread: "DELIVERY",
        nextValue: DeliveryStatus.REQUESTED, // Pasa a Solicitado
      });

      if (result.success) {
        addAlert({
          message: "Pedido enviado a la Base de Cadetería correctamente",
        });
      } else {
        addAlert({
          message: result.error?.message || "Error al solicitar",
          type: "error",
        });
      }
    } catch (e) {
      addAlert({ message: "Error al conectar con el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCadete = async () => {
    if (!safeOrder || loading) return;
    if (!window.confirm("¿Querés retirar este pedido de la base de cadetes?"))
      return;
    try {
      setLoading(true);
      const result = await updateOrderStatusOrchestrator({
        idTemp: safeOrder.idTemp,
        thread: "DELIVERY",
        nextValue: DeliveryStatus.PENDING, // Vuelve a estar en el local sin mandar
      });

      if (result.success) {
        addAlert({
          message:
            "Se canceló el aviso a la base. El pedido quedó en el local.",
          type: "info",
        });
      } else {
        addAlert({
          message: result.error?.message || "Error al cancelar",
          type: "error",
        });
      }
    } catch (e) {
      addAlert({ message: "Error al conectar con el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLERS ORIGINALES
  // =========================
  const handleTogglePayment = async () => {
    if (!safeOrder || loading) return;
    try {
      setLoading(true);
      const newStatus = isPaid
        ? PaymentStatus.PENDING
        : PaymentStatus.CONFIRMED;

      const result = await updateOrderStatusOrchestrator({
        idTemp: safeOrder.idTemp,
        thread: "PAYMENT",
        nextValue: newStatus,
      });

      if (result.success) {
        addAlert({ message: `Orden: ${result.data?.shortCode} actualizada` });
        onClose();
      } else {
        addAlert({ message: result.error?.message || "Error", type: "error" });
      }
    } catch (e) {
      addAlert({ message: "Error al actualizar pago", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!safeOrder || !action || loading) return;
    try {
      setLoading(true);
      const result = await updateOrderStatusOrchestrator({
        idTemp: safeOrder.idTemp,
        thread: "STATUS",
        nextValue: action.next,
      });

      if (result.success) {
        addAlert({ message: `Orden: ${action.label}` });
        if (action.next === OrderStatus.COMPLETED) onClose();
      } else {
        addAlert({ message: result.error?.message || "Error", type: "error" });
      }
      if (action.next === OrderStatus.COMPLETED) onClose();
    } catch (e) {
      addAlert({ message: "Error al actualizar estado", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (targetStatus: OrderStatus) => {
    if (
      !safeOrder ||
      !window.confirm("¿Seguro que deseas cancelar este pedido?")
    )
      return;
    try {
      setLoading(true);
      addAlert({ message: "Pedido cancelado", type: "info" });
      onClose();
    } catch (e) {
      addAlert({ message: "Error al cancelar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (
      order &&
      ticketRef &&
      ticketRef.current &&
      ticketRef.current.innerHTML
    ) {
      print(ticketRef.current.innerHTML);
    }
  };

  if (isLoading || !safeOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {safeOrder && (
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
              <OrderTicket order={safeOrder} mode="KITCHEN" />
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tighter italic text-slate-800">
              #{safeOrder.id.slice(-4)}
            </span>
            <OrderStatusBadge
              deliveryStatus={safeOrder.deliveryStatus}
              status={safeOrder.status}
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePrint()}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SUB-HEADER */}
        <div className="px-4 py-2 bg-white border-b flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-tight shrink-0">
          <span className="flex items-center gap-1 text-slate-600">
            <User size={13} /> {safeOrder.user.fullName}
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Package size={13} /> {safeOrder.deliveryType}
          </span>
          <span
            className={`flex items-center gap-1 ${minutes > 15 ? "text-red-600" : "text-orange-600"}`}
          >
            <Clock size={13} /> {minutes}m
          </span>
        </div>

        {/* ========================================================= */}
{/* LOGÍSTICA DE ENVÍO                                        */}
{/* ========================================================= */}
{safeOrder.deliveryType === DeliveryType.DELIVERY && (
  <>
    {/* ===================================================== */}
    {/* REPARTO INTERNO DEL LOCAL                             */}
    {/* ===================================================== */}
    {safeOrder.deliveryProvider === "INTERNAL" && (
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Bike size={16} className="text-slate-400" />

          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase leading-none">
              Reparto
            </span>

            <span className="text-xs font-bold text-slate-700">
              Entrega realizada por el local
            </span>
          </div>
        </div>

        <button
          onClick={handleSolicitarCadete}
          disabled={loading || safeOrder.status === OrderStatus.PENDING}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={12} />
          ASIGNAR A PLATAFORMA
        </button>
      </div>
    )}
  </>
)}

        {/* ========================================================= */}
        {/* NUEVO BLOQUE: CONTROL LOGÍSTICO EXCLUSIVO PARA CAJERO     */}
        {/* ========================================================= */}
        {(safeOrder.deliveryType === DeliveryType.DELIVERY && safeOrder.deliveryProvider === "PLATFORM") && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Bike
                size={16}
                className={
                  safeOrder.deliveryStatus === DeliveryStatus.REQUESTED
                    ? "text-amber-500 animate-pulse"
                    : safeOrder.deliveryStatus === DeliveryStatus.SHIPPED
                      ? "text-blue-500"
                      : safeOrder.deliveryStatus === DeliveryStatus.COMPLETED
                        ? "text-emerald-600"
                        : "text-slate-400"
                }
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase leading-none">
                  Logística de Envío
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {safeOrder.deliveryStatus === DeliveryStatus.PENDING &&
                    "Local Retiene (No enviado)"}
                  {safeOrder.deliveryStatus === DeliveryStatus.REQUESTED &&
                    "Esperando Asignación de Base..."}
                  {safeOrder.deliveryStatus === DeliveryStatus.SHIPPED &&
                    "En Viaje de Reparto"}
                  {safeOrder.deliveryStatus === DeliveryStatus.COMPLETED &&
                    "Entregado por Cadete"}
                  {safeOrder.deliveryStatus === DeliveryStatus.CANCELLED &&
                    "Cancelado"}
                </span>
              </div>
            </div>
            {safeOrder.deliveryStatus === DeliveryStatus.PENDING && (
              <button
                onClick={handleSolicitarCadete}
                disabled={loading || safeOrder.status === OrderStatus.PENDING}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={12} /> ENVIAR A BASE
              </button>
            )}

            {safeOrder.deliveryStatus === DeliveryStatus.REQUESTED && (
              <button
                onClick={handleCancelarCadete}
                disabled={loading}
                className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-black shadow-sm transition-all"
              >
                <Undo2 size={13} /> RETIRAR DE BASE
              </button>
            )}
          </div>
        )}

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto bg-white">
          {safeOrder.items.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3">
                  <span className="font-black bg-slate-900 p-1 text-white min-w-[24px] h-[24px] flex items-center justify-center rounded text-xs shadow-sm">
                    {item.quantity}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 leading-tight text-sm uppercase tracking-tight">
                      {item.productName}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-amber-600 font-bold leading-tight italic whitespace-pre-line">
                        Nota: "{item.notes}"
                      </p>
                    )}
                    {item.optionGroups?.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">
                        {item.optionGroups
                          .flatMap((g) => g.options)
                          .map((o) => o.optionName)
                          .join(" • ")}
                      </div>
                    )}
                  </div>
                </div>
                <p className="font-mono font-bold text-slate-500 text-xs mt-1 whitespace-nowrap">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-slate-50 space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          {/* Desglose de Dinero (Solución Problema 1) */}
          <div className="border-b border-slate-200/60 pb-2 space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Subtotal Productos:</span>
              <span className="font-mono font-bold">
                {formatPrice(
                  safeOrder.total - (safeOrder.totalDeliveryCost ?? 0),
                )}
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

          {/* Botonera de acciones */}
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

          {/* Danger Zone */}
          <div className="pt-2 border-t border-slate-200">
            {!showDangerZone ? (
              <button
                onClick={() => setShowDangerZone(true)}
                className="w-full text-center text-[11px] font-bold text-red-500 transition-colors"
              >
                Gestionar pedido / Rechazar
              </button>
            ) : (
              <div className="space-y-2 animate-in fade-in">
                <OrderCancellationActions
                  status={safeOrder.status}
                  deliveryStatus={safeOrder.deliveryStatus}
                  onCancel={handleCancelOrder}
                  loading={loading}
                />
                <button
                  onClick={() => setShowDangerZone(false)}
                  className="w-full text-center text-[11px] text-slate-400"
                >
                  Volver atrás
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
