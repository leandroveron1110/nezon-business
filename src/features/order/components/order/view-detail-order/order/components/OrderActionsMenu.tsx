"use client";

import { useEffect, useRef, useState } from "react";
import { UIOrder } from "@/features/order/types/ui-order";
import { OrderStatus } from "@/types/order-state-machine";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import {
  MoreVertical,
  Printer,
  MessageSquare,
  Bike,
  UserCheck,
  Check,
  Loader2,
  CreditCard,
  Tag,
  ArrowLeft,
  Banknote,
  QrCode,
} from "lucide-react";
import {
  applyOrderDiscountOrchestrator,
  assignCourierNameOrchestrator,
  changeOrderPaymentMethodOrchestrator,
} from "@/mini-back/orchestrator/order.orchestrator";
import { useAlert } from "@/features/common/ui/Alert/Alert";

interface OrderActionsMenuProps {
  safeOrder: UIOrder;
  handlePrint: () => void;

  onToggleDeliveryType: (nextType: "DELIVERY" | "TAKE_AWAY") => void;

  OrderCancellationActions: any;
  handleCancelOrder: (targetStatus: OrderStatus) => void;
  /**
   * Quitar descuento existente.
   */
  onRemoveDiscount?: () => Promise<void> | void;

  loading?: boolean;
}

type MenuView = "MAIN" | "PAYMENT_METHOD" | "DISCOUNT" | "COURIER" | "CANCEL";

const PAYMENT_METHODS: {
  value: PaymentMethodTypeFinancial;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: PaymentMethodTypeFinancial.CASH,
    label: "Efectivo",
    icon: <Banknote size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.TRANSFER,
    label: "Transferencia",
    icon: <CreditCard size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.QR,
    label: "QR / MODO",
    icon: <QrCode size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.DEBIT_CARD,
    label: "Débito",
    icon: <CreditCard size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.CREDIT_CARD,
    label: "Crédito",
    icon: <CreditCard size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.ACCOUNT,
    label: "Cuenta corriente",
    icon: <UserCheck size={16} />,
  },
  {
    value: PaymentMethodTypeFinancial.OTHER,
    label: "Otro",
    icon: <CreditCard size={16} />,
  },
];

export function OrderActionsMenu({
  safeOrder,
  handlePrint,
  onToggleDeliveryType,
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

  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE",
  );

  const [discountValue, setDiscountValue] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  const isDelivery = safeOrder.deliveryType === "DELIVERY";

  const currentDiscountType = safeOrder.discountType || null;
  const currentDiscountValue = safeOrder.discountValue || 0;
  const hasDiscount = currentDiscountType !== null && currentDiscountValue > 0;

  useEffect(() => {
    setCourierName(safeOrder.courierName || "");
  }, [safeOrder.courierName]);

  useEffect(() => {
    if (isOpen) return;

    setView("MAIN");
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView("MAIN");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setView("MAIN");
  };

  const goBack = () => {
    setView("MAIN");
  };

  const handlePrintAction = () => {
    handlePrint();
    closeMenu();
  };

  const handleToggleDeliveryAction = () => {
    const nextType = isDelivery ? "TAKE_AWAY" : "DELIVERY";

    onToggleDeliveryType(nextType);
    closeMenu();
  };

  const handleWhatsAppAction = () => {
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
    } catch (error) {
      addAlert({ message:"Error al guardar el cadete", type: "error"});
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleChangePaymentMethod = async (
    paymentMethod: PaymentMethodTypeFinancial,
  ) => {
    if (isSavingPayment) return;

    try {
      setIsSavingPayment(true);

      await changeOrderPaymentMethodOrchestrator(safeOrder.idTemp, paymentMethod);

      closeMenu();
    } catch (error) {
      addAlert({ message:"Error al cambiar el medio de pago:", type: "error"});
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (isSavingDiscount) return;

    const value = Number(discountValue);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    try {
      setIsSavingDiscount(true);

      await applyOrderDiscountOrchestrator(
        safeOrder.idTemp,
        discountType,
        value,
      );

      closeMenu();
    } catch (error) {
      addAlert({ message:"Error al aplicar el descuento:", type: "error"});
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
    } catch (error) {
      addAlert({ message:"Error al quitar el descuento", type: "error"});
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const openDiscountView = () => {
    if (currentDiscountType) {
      setDiscountType(currentDiscountType);
    }

    if (currentDiscountValue > 0) {
      setDiscountValue(String(currentDiscountValue));
    } else {
      setDiscountValue("");
    }

    setView("DISCOUNT");
  };

  const formatPaymentMethod = (method: PaymentMethodTypeFinancial) => {
    return (
      PAYMENT_METHODS.find((item) => item.value === method)?.label || method
    );
  };

  const renderHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
      <button
        type="button"
        onClick={goBack}
        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
        {icon}
        {title}
      </div>
    </div>
  );

  const renderMainView = () => (
    <>
      {/* DOCUMENTOS */}
      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Documentos
      </div>

      <button
        type="button"
        onClick={handlePrintAction}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-slate-50"
      >
        <Printer size={16} className="text-slate-500" />
        <span>Imprimir comanda</span>
      </button>

      <div className="my-1 border-t border-slate-100" />

      {/* PEDIDO */}
      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Pedido
      </div>

      <button
        type="button"
        onClick={() => setView("PAYMENT_METHOD")}
        className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2.5">
          <CreditCard size={16} className="text-blue-500" />

          <div className="flex flex-col">
            <span>Cambiar medio de pago</span>
            <span className="text-[9px] font-bold text-slate-400">
              Actual: {formatPaymentMethod(safeOrder.orderPaymentMethod)}
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={openDiscountView}
        className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2.5">
          <Tag size={16} className="text-emerald-500" />

          <div className="flex flex-col">
            <span>
              {hasDiscount ? "Modificar descuento" : "Aplicar descuento"}
            </span>

            {hasDiscount && (
              <span className="text-[9px] font-bold text-emerald-600">
                {currentDiscountType === "PERCENTAGE"
                  ? `${currentDiscountValue}%`
                  : `$${currentDiscountValue}`}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="my-1 border-t border-slate-100" />

      {/* GESTIÓN */}
      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Gestión
      </div>

      {isDelivery && (
        <button
          type="button"
          onClick={() => setView("COURIER")}
          className="flex w-full items-center justify-between px-4 py-2 text-left text-amber-700 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-2.5">
            <Bike size={16} className="text-amber-600" />

            <span className="max-w-[150px] truncate">
              {courierName ? `Cadete: ${courierName}` : "Asignar Cadete"}
            </span>
          </div>

          {courierName && (
            <UserCheck size={14} className="shrink-0 text-amber-600" />
          )}
        </button>
      )}

      {safeOrder.user?.phone && (
        <button
          type="button"
          onClick={handleWhatsAppAction}
          className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-emerald-600 transition-colors hover:bg-slate-50"
        >
          <MessageSquare size={16} className="text-emerald-500" />
          <span>Contactar por WhatsApp</span>
        </button>
      )}

      <div className="my-1 border-t border-slate-100" />

      {/* PELIGRO */}
      <button
        type="button"
        onClick={() => setView("CANCEL")}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
      >
        <span>Gestionar pedido / Rechazar</span>
      </button>
    </>
  );

  const renderPaymentView = () => (
    <>
      {renderHeader(
        "Medio de pago",
        <CreditCard size={15} className="text-blue-500" />,
      )}

      <div className="p-2">
        <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Medio actual
          </div>

          <div className="mt-0.5 text-xs font-black text-slate-700">
            {formatPaymentMethod(safeOrder.orderPaymentMethod)}
          </div>
        </div>

        <div className="space-y-1">
          {PAYMENT_METHODS.map((method) => {
            const isCurrent = safeOrder.orderPaymentMethod === method.value;

            return (
              <button
                key={method.value}
                type="button"
                disabled={isSavingPayment || isCurrent}
                onClick={() => handleChangePaymentMethod(method.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  isCurrent
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                } disabled:cursor-default`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={isCurrent ? "text-blue-500" : "text-slate-400"}
                  >
                    {method.icon}
                  </span>

                  <span className="text-xs font-bold">{method.label}</span>
                </div>

                {isCurrent && <Check size={15} className="text-blue-600" />}

                {isSavingPayment && !isCurrent && (
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderDiscountView = () => {
    const subtotal = safeOrder.subtotal || 0;

    const numericValue = Number(discountValue) || 0;

    console.log("order header", safeOrder.subtotal);

    const previewDiscount =
      discountType === "PERCENTAGE"
        ? Math.min(subtotal, subtotal * (numericValue / 100))
        : Math.min(subtotal, numericValue);

    const previewTotal = Math.max(0, subtotal - previewDiscount);

    return (
      <>
        {renderHeader(
          hasDiscount ? "Modificar descuento" : "Aplicar descuento",
          <Tag size={15} className="text-emerald-500" />,
        )}

        <div className="space-y-3 p-3">
          <div>
            <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Tipo de descuento
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`rounded-md py-2 text-[10px] font-black transition-all ${
                  discountType === "PERCENTAGE"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                % PORCENTAJE
              </button>

              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`rounded-md py-2 text-[10px] font-black transition-all ${
                  discountType === "FIXED"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                $ FIJO
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Valor
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                {discountType === "PERCENTAGE" ? "%" : "$"}
              </span>

              <input
                type="number"
                min="0"
                max={discountType === "PERCENTAGE" ? 100 : subtotal}
                step="any"
                autoFocus
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex justify-between text-[10px]">
              <span className="font-bold text-slate-500">Subtotal</span>

              <span className="font-black text-slate-700">
                ${subtotal.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-1 flex justify-between text-[10px]">
              <span className="font-bold text-emerald-600">Descuento</span>

              <span className="font-black text-emerald-600">
                -$
                {previewDiscount.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
              <span className="text-xs font-black text-slate-700">Total</span>

              <span className="text-sm font-black text-slate-900">
                ${previewTotal.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSavingDiscount || !discountValue || numericValue <= 0}
            onClick={handleApplyDiscount}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-black text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingDiscount ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Tag size={14} />
            )}

            {hasDiscount ? "Actualizar descuento" : "Aplicar descuento"}
          </button>

          {hasDiscount && onRemoveDiscount && (
            <button
              type="button"
              disabled={isSavingDiscount}
              onClick={handleRemoveDiscount}
              className="w-full rounded-lg py-2 text-[10px] font-black text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Quitar descuento
            </button>
          )}
        </div>
      </>
    );
  };

  const renderCourierView = () => (
    <>
      {renderHeader(
        "Asignar cadete",
        <Bike size={15} className="text-amber-600" />,
      )}

      <form
        onSubmit={handleSaveCourier}
        className="space-y-2 bg-amber-50/60 p-3"
      >
        <div className="text-[10px] font-bold uppercase text-amber-800">
          Nombre / ID del Cadete
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            autoFocus
            disabled={isSavingCourier}
            placeholder="Ej: Juan / Cadete 2"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="min-w-0 flex-1 rounded border border-amber-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isSavingCourier}
            className="flex min-w-[30px] items-center justify-center rounded bg-amber-600 p-1.5 text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            title="Guardar"
          >
            {isSavingCourier ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
        </div>
      </form>
    </>
  );

  const renderCancelView = () => (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="text-xs font-bold text-slate-700">
          Opciones de rechazo / cancelación
        </div>
      </div>

      {OrderCancellationActions && handleCancelOrder ? (
        <OrderCancellationActions
          status={safeOrder.status}
          deliveryStatus={safeOrder.deliveryStatus}
          onCancel={(targetStatus: OrderStatus) => {
            handleCancelOrder(targetStatus);
            closeMenu();
          }}
          loading={loading}
        />
      ) : (
        <div className="text-xs text-slate-400">
          No hay acciones de cancelación disponibles.
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (view) {
      case "PAYMENT_METHOD":
        return renderPaymentView();

      case "DISCOUNT":
        return renderDiscountView();

      case "COURIER":
        return renderCourierView();

      case "CANCEL":
        return renderCancelView();

      default:
        return renderMainView();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);

          if (isOpen) {
            setView("MAIN");
          }
        }}
        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200"
        title="Más opciones"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm font-medium text-slate-700 shadow-xl animate-in fade-in-50 zoom-in-95">
          {renderCurrentView()}
        </div>
      )}
    </div>
  );
}
