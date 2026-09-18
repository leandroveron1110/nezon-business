"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { UIOrder } from "@/features/order/types/ui-order";
import { OrderStatus } from "@/types/order-state-machine";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import {
  applyOrderDiscountOrchestrator,
  assignCourierNameOrchestrator,
  changeConfirmedOrderPaymentMethodOrchestrator,
  changeOrderPaymentMethodOrchestrator,
} from "@/mini-back/orchestrator/order.orchestrator";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { PAYMENT_METHODS, PaymentView } from "./components/PaymentView";
import { MainView } from "./components/MainView";
import { DiscountView } from "./components/DiscountView";
import { CourierView } from "./components/CourierView";
import { CancelView } from "./components/CancelView";
import { ConfirmedPaymentMethodView } from "./components/ConfirmedPaymentMethodView";

interface OrderActionsMenuProps {
  safeOrder: UIOrder;
  handlePrint: () => void;
  onToggleDeliveryType: (nextType: "DELIVERY" | "TAKE_AWAY") => void;
  OrderCancellationActions: any;
  handleCancelOrder: (targetStatus: OrderStatus) => void;
  onRemoveDiscount?: () => Promise<void> | void;
  loading?: boolean;
  onEditOrder: (b: boolean) => void;
}

type MenuView =
  | "MAIN"
  | "PAYMENT_METHOD"
  | "CONFIRMED_PAYMENT_METHOD"
  | "DISCOUNT"
  | "COURIER"
  | "CANCEL";

export function OrderActionsMenu({
  safeOrder,
  handlePrint,
  onEditOrder,
  OrderCancellationActions,
  handleCancelOrder,
  onRemoveDiscount,
  loading = false,
}: OrderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>("MAIN");
  const { addAlert } = useAlert();

  const [courierName, setCourierName] = useState(safeOrder.courierName || "");
  const [isSavingCourier, setIsSavingCourier] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] =
    useState<PaymentMethodTypeFinancial | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCourierName(safeOrder.courierName || "");
  }, [safeOrder.courierName]);

  useEffect(() => {
    if (!isOpen) setView("MAIN");
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

const closeMenu = () => {
  setIsOpen(false);
  setView("MAIN");
  setPendingPaymentMethod(null);
};

  const goBack = () => setView("MAIN");

  const formatPaymentMethod = (method: PaymentMethodTypeFinancial) => {
    return (
      PAYMENT_METHODS.find((item) => item.value === method)?.label || method
    );
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = safeOrder.user?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone) {
      const message = encodeURIComponent(
        `¡Hola ${safeOrder.user.fullName}! Te escribimos respecto a tu pedido #${safeOrder.id.slice(-4)}.`,
      );
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    }
    closeMenu();
  };

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCourier) return;
    try {
      setIsSavingCourier(true);
      await assignCourierNameOrchestrator(safeOrder.idTemp, courierName);
      closeMenu();
    } catch {
      addAlert({ message: "Error al guardar el cadete", type: "error" });
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleChangePaymentMethod = async (
    paymentMethod: PaymentMethodTypeFinancial,
  ) => {
    if (isSavingPayment) return;

    // Si la orden ya fue cobrada,
    // primero pedimos autorización.
    if (safeOrder.paymentStatus === "CONFIRMED") {
      setPendingPaymentMethod(paymentMethod);
      setView("CONFIRMED_PAYMENT_METHOD");
      return;
    }

    try {
      setIsSavingPayment(true);

      await changeOrderPaymentMethodOrchestrator(
        safeOrder.idTemp,
        paymentMethod,
      );

      closeMenu();
    } catch {
      addAlert({
        message: "Error al cambiar el medio de pago",
        type: "error",
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleApplyDiscount = async (
    type: "PERCENTAGE" | "FIXED",
    value: number,
  ) => {
    if (isSavingDiscount) return;
    try {
      setIsSavingDiscount(true);
      await applyOrderDiscountOrchestrator(safeOrder.idTemp, type, value);
      closeMenu();
    } catch {
      addAlert({ message: "Error al aplicar el descuento", type: "error" });
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (isSavingDiscount || !onRemoveDiscount) return;
    try {
      setIsSavingDiscount(true);
      await onRemoveDiscount();
      closeMenu();
    } catch {
      addAlert({ message: "Error al quitar el descuento", type: "error" });
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const handleConfirmPaymentMethodChange = async (
    authorizationCode: string,
  ) => {
    if (isSavingPayment || !pendingPaymentMethod) return;

    try {
      setIsSavingPayment(true);

      const result = await changeConfirmedOrderPaymentMethodOrchestrator({
        orderId: safeOrder.idTemp,
        paymentMethod: pendingPaymentMethod,
        authorizationCode,
      });

      if (!result.success) {
        addAlert({
          message: "No se pudo cambiar el medio de pago.",
          type: "error",
        });

        return;
      }

      closeMenu();
    } catch (error) {
      console.error(
        "Error al cambiar medio de pago de orden confirmada:",
        error,
      );

      addAlert({
        message: "Error al cambiar el medio de pago.",
        type: "error",
      });
    } finally {
      setIsSavingPayment(false);
    }
  };
  const hasDiscount = Boolean(
    safeOrder.discountType && (safeOrder.discountValue ?? 0) > 0,
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200"
        title="Más opciones"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm font-medium text-slate-700 shadow-xl animate-in fade-in-50 zoom-in-95">
          {view === "MAIN" && (
            <MainView
              safeOrder={safeOrder}
              courierName={courierName}
              formatPaymentMethod={formatPaymentMethod}
              onPrint={() => {
                handlePrint();
                closeMenu();
              }}
              onNavigate={setView}
              onOpenWhatsApp={handleOpenWhatsApp}
              onEditOrder={onEditOrder}
            />
          )}

          {view === "PAYMENT_METHOD" && (
            <PaymentView
              currentMethod={safeOrder.orderPaymentMethod}
              isSaving={isSavingPayment}
              onBack={goBack}
              onChangeMethod={handleChangePaymentMethod}
              formatPaymentMethod={formatPaymentMethod}
            />
          )}

          {view === "DISCOUNT" && (
            <DiscountView
              subtotal={safeOrder.subtotal || 0}
              initialType={safeOrder.discountType || "PERCENTAGE"}
              initialValue={
                safeOrder.discountValue ? String(safeOrder.discountValue) : ""
              }
              hasDiscount={hasDiscount}
              isSaving={isSavingDiscount}
              onBack={goBack}
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
            />
          )}

          {view === "COURIER" && (
            <CourierView
              courierName={courierName}
              isSaving={isSavingCourier}
              onBack={goBack}
              onCourierNameChange={setCourierName}
              onSubmit={handleSaveCourier}
            />
          )}

          {view === "CANCEL" && (
            <CancelView
              safeOrder={safeOrder}
              OrderCancellationActions={OrderCancellationActions}
              handleCancelOrder={(targetStatus) => {
                handleCancelOrder(targetStatus);
                closeMenu();
              }}
              loading={loading}
              onBack={goBack}
            />
          )}
          {view === "CONFIRMED_PAYMENT_METHOD" && (
            <ConfirmedPaymentMethodView
              isSaving={isSavingPayment}
              onBack={goBack}
              onConfirm={handleConfirmPaymentMethodChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
