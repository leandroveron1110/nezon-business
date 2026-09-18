import {
  Printer,
  CreditCard,
  Tag,
  Bike,
  UserCheck,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { UIOrder } from "@/features/order/types/ui-order";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

interface MainViewProps {
  safeOrder: UIOrder;
  courierName: string;
  formatPaymentMethod: (method: PaymentMethodTypeFinancial) => string;
  onPrint: () => void;
  onEditOrder: (b: boolean) => void;
  onNavigate: (
    view: "PAYMENT_METHOD" | "DISCOUNT" | "COURIER" | "CANCEL",
  ) => void;
  onOpenWhatsApp: () => void;
}

export function MainView({
  safeOrder,
  courierName,
  formatPaymentMethod,
  onPrint,
  onEditOrder,
  onNavigate,
  onOpenWhatsApp,
}: MainViewProps) {
  const isDelivery = safeOrder.deliveryType === "DELIVERY";

  const currentDiscountType = safeOrder.discountType || null;

  const currentDiscountValue = safeOrder.discountValue || 0;

  const hasDiscount = currentDiscountType !== null && currentDiscountValue > 0;

  return (
    <>
      {/* ==================================================== */}
      {/* DOCUMENTOS */}
      {/* ==================================================== */}

      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Documentos
      </div>

      <button
        type="button"
        onClick={onPrint}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-slate-50"
      >
        <Printer size={16} className="text-slate-500" />

        <span>Imprimir comanda</span>
      </button>

      <div className="my-1 border-t border-slate-100" />

      {/* ==================================================== */}
      {/* PEDIDO */}
      {/* ==================================================== */}

      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Pedido
      </div>

      {/* EDITAR ORDEN */}
      <button
        type="button"
        onClick={() => onEditOrder(true)}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-slate-50"
      >
        <Pencil size={16} className="text-slate-500" />

        <div className="flex flex-col">
          <span>Editar orden</span>

          <span className="text-[9px] font-bold text-slate-400">
            Productos, cliente y entrega
          </span>
        </div>
      </button>

      {/* MEDIO DE PAGO */}
      <button
        type="button"
        onClick={() => onNavigate("PAYMENT_METHOD")}
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

      {/* DESCUENTO */}
      <button
        type="button"
        onClick={() => onNavigate("DISCOUNT")}
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

      {/* ==================================================== */}
      {/* GESTIÓN */}
      {/* ==================================================== */}

      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Gestión
      </div>

      {isDelivery && (
        <button
          type="button"
          onClick={() => onNavigate("COURIER")}
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
          onClick={onOpenWhatsApp}
          className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-emerald-600 transition-colors hover:bg-slate-50"
        >
          <MessageSquare size={16} className="text-emerald-500" />

          <span>Contactar por WhatsApp</span>
        </button>
      )}

      <div className="my-1 border-t border-slate-100" />

      {/* ==================================================== */}
      {/* CANCELACIÓN */}
      {/* ==================================================== */}

      <button
        type="button"
        onClick={() => onNavigate("CANCEL")}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
      >
        <span>Gestionar pedido / Rechazar</span>
      </button>
    </>
  );
}
