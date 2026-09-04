"use client";

import { useMemo, useRef, useState } from "react";
import { DeliveryType } from "@/types/order";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { OrderCancellationActions } from "./components/OrderCancellationActions";
import { useGetOrderById } from "../../../../hooks/useGetOrderById";
import { OrderTicket } from "../../ticket-order/OrderTicket";
import { usePrintTicket } from "@/features/order/hooks/usePrintTicket";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";
import { updateOrderStatusOrchestrator } from "@/mini-back/orchestrator/order.orchestrator";
import { DeliveryStatus } from "@/mini-back/core/orders-core/domain/order-state-machine";
import { formatTimeRemaining } from "@/features/common/utils/formatScheduledTime";
import { OrderDetailHeader } from "./components/OrderDetailHeader";
import { OrderDetailSubHeader } from "./components/OrderDetailSubHeader";
import { OrderDeliveryBar } from "./components/OrderDeliveryBar";
import { OrderItemsList } from "./components/OrderItemsList";
import { OrderDetailFooter } from "./components/OrderDetailFooter";

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
  const ticketRef = useRef<HTMLDivElement>(null);
  const { print } = usePrintTicket();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeOrder = order ?? null;

  const timeFormatted = useMemo(() => {
    if (!safeOrder) return null;

    const isScheduled = !!safeOrder.scheduledAt;

    return formatTimeRemaining({
      targetDate: isScheduled ? safeOrder.scheduledAt : safeOrder.createdAt,
      isScheduled,
    });
  }, [safeOrder]);

  const isPaid = safeOrder?.paymentStatus === PaymentStatus.CONFIRMED;

  const action = useMemo(() => {
    if (!safeOrder) return null;
    return getStatusAction(safeOrder.status, safeOrder.deliveryType);
  }, [safeOrder]);

  // ===================================
  // HANDLERS LOGÍSTICOS
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
        // if (action.next === OrderStatus.COMPLETED) onClose();
      } else {
        addAlert({ message: result.error?.message || "Error", type: "error" });
      }
      // if (action.next === OrderStatus.COMPLETED) onClose();
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
      const result = await updateOrderStatusOrchestrator({
        idTemp: safeOrder.idTemp,
        thread: "STATUS",
        nextValue: targetStatus, // Siempre pasa a CANCELLED
      });
      if (!result.success) {
        addAlert({
          message: result.error?.message || "Error al cancelar",
          type: "error",
        });
        return;
      }
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
      // Esperamos a que React renderice el ticket
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!ticketRef.current) return;

          console.log(ticketRef.current?.getBoundingClientRect());

          print(ticketRef.current);
        });
      });
    }
  };

  if (isLoading || !safeOrder) return null;

  const canShowActions = (): boolean => {
    return (
      safeOrder.status !== OrderStatus.CANCELLED &&
      safeOrder.status !== OrderStatus.REJECTED
    );
  };

  const canShowMinutes = (): boolean => {
    return (
      safeOrder.status !== OrderStatus.CANCELLED &&
      safeOrder.status !== OrderStatus.REJECTED &&
      safeOrder.status !== OrderStatus.COMPLETED
    );
  };

  const onToggleDeliveryType = (nextType: "DELIVERY" | "TAKE_AWAY") => {
    // Aquí puedes implementar la lógica para cambiar el tipo de entrega
    console.log(`Cambiando tipo de entrega a: ${nextType}`);
    // Por ejemplo, podrías llamar a una función que actualice el estado del pedido en tu backend
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-end"
      onClick={onClose} // 👈 1. Cierra al tocar la parte negra de afuera
    >
      <div
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()} // 👈 2. Evita que se cierre al tocar dentro del panel
      >
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
              <OrderTicket order={safeOrder} mode="CUSTOMER" />
            </div>
          </div>
        )}
        <OrderDetailHeader
          safeOrder={safeOrder}
          handlePrint={handlePrint}
          onClose={onClose}
          onToggleDeliveryType={onToggleDeliveryType}
          OrderCancellationActions={OrderCancellationActions}
          handleCancelOrder={handleCancelOrder}
        />

        <OrderDetailSubHeader
          safeOrder={safeOrder}
          canShowMinutes={canShowMinutes}
          timeFormatted={timeFormatted}
        />

        {/* ========================================================= */}
        {/* LOGÍSTICA DE ENVÍO - BARRA COMPACTA POS (1-CLICK COPY)    */}
        {/* ========================================================= */}
        {canShowActions() &&
          safeOrder.deliveryType === DeliveryType.DELIVERY && (
            <OrderDeliveryBar
              safeOrder={safeOrder}
              copied={copied}
              setCopied={setCopied}
              loading={loading}
              handleSolicitarCadete={handleSolicitarCadete}
              handleCancelarCadete={handleCancelarCadete}
            />
          )}

        {/* ITEMS */}

        <div className="flex-1 overflow-y-auto bg-white">
          <OrderItemsList items={safeOrder.items} />
        </div>

        <OrderDetailFooter
          safeOrder={safeOrder}
          isPaid={isPaid}
          canShowActions={canShowActions}
          loading={loading}
          handleTogglePayment={handleTogglePayment}
          action={action}
          handleAdvance={handleAdvance}
        />
      </div>
    </div>
  );
}
