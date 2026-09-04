import { useState, useRef, useEffect } from "react";
import { UIOrder } from "@/features/order/types/ui-order";
import { OrderStatus } from "@/types/order-state-machine";
import { 
  MoreVertical, 
  Printer, 
  RefreshCw, 
  MessageSquare, 
  Bike, 
  UserCheck,
  Check,
  Loader2 
} from "lucide-react";
import { assignCourierNameOrchestrator } from "@/mini-back/orchestrator/order.orchestrator";

interface OrderActionsMenuProps {
  safeOrder: UIOrder;
  handlePrint: () => void;
  onToggleDeliveryType: (nextType: "DELIVERY" | "TAKE_AWAY") => void;
  OrderCancellationActions: any;
  handleCancelOrder: (targetStatus: OrderStatus) => void;
  onSaveCourierInfo?: (courierName: string) => Promise<void> | void;
  loading?: boolean;
}

export function OrderActionsMenu({
  safeOrder,
  handlePrint,
  onToggleDeliveryType,
  OrderCancellationActions,
  handleCancelOrder,
  onSaveCourierInfo,
  loading = false,
}: OrderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [showCourierInput, setShowCourierInput] = useState(false);
  const [courierName, setCourierName] = useState(safeOrder.courierName || "");
  const [isSavingCourier, setIsSavingCourier] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Sincronizar el estado interno con la prop si la orden cambia dinámicamente
  useEffect(() => {
    setCourierName(safeOrder.courierName || "");
  }, [safeOrder.courierName]);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCancelOptions(false);
        setShowCourierInput(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isDelivery = safeOrder.deliveryType === "DELIVERY";

  const handlePrintAction = () => {
    handlePrint();
    setIsOpen(false);
  };

  const handleToggleDeliveryAction = () => {
    const nextType = isDelivery ? "TAKE_AWAY" : "DELIVERY";
    onToggleDeliveryType(nextType);
    setIsOpen(false);
  };

  const handleWhatsAppAction = () => {
    const rawPhone = safeOrder.user?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");

    if (cleanPhone) {
      const message = encodeURIComponent(
        `¡Hola ${safeOrder.user.fullName}! Te escribimos respecto a tu pedido #${safeOrder.id.slice(-4)}.`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    }
    setIsOpen(false);
  };

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCourier) return;

    try {
      setIsSavingCourier(true);

      if (onSaveCourierInfo) {
        await onSaveCourierInfo(courierName);
      } else {
        // Fallback: Ejecutar el orquestador directamente si no viene por props
        const idTemp = safeOrder.idTemp || safeOrder.id;
        await assignCourierNameOrchestrator(idTemp, courierName);
      }

      setShowCourierInput(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error al guardar el cadete:", error);
    } finally {
      setIsSavingCourier(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowCancelOptions(false);
          setShowCourierInput(false);
        }}
        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
        title="Más opciones"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-sm font-medium text-slate-700 animate-in fade-in-50 zoom-in-95">
          {!showCancelOptions ? (
            <>
              {/* DOCUMENTOS */}
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Documentos
              </div>
              <button
                type="button"
                onClick={handlePrintAction}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Printer size={16} className="text-slate-500" />
                <span>Imprimir comanda</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              {/* LOGÍSTICA Y CLIENTE */}
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Gestión
              </div>

              {/* Asignación de cadete (Solo si es Delivery) */}
              {isDelivery && (
                <>
                  {!showCourierInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCourierInput(true)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors text-amber-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bike size={16} className="text-amber-600" />
                        <span className="truncate max-w-[150px]">
                          {courierName ? `Cadete: ${courierName}` : "Asignar Cadete"}
                        </span>
                      </div>
                      {courierName && <UserCheck size={14} className="text-amber-600 shrink-0" />}
                    </button>
                  ) : (
                    /* Formulario desplegable para escribir el nombre del cadete */
                    <form onSubmit={handleSaveCourier} className="px-3 py-2 bg-amber-50/60 border-y border-amber-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-amber-800 uppercase">
                        Nombre / ID del Cadete:
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          autoFocus
                          disabled={isSavingCourier}
                          placeholder="Ej: Juan / Cadete 2"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="flex-1 text-xs border border-amber-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={isSavingCourier}
                          className="bg-amber-600 hover:bg-amber-700 text-white p-1 rounded transition-colors disabled:opacity-50 flex items-center justify-center min-w-[26px]"
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
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleToggleDeliveryAction}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <RefreshCw size={16} className="text-blue-500" />
                <span>
                  Cambiar a {isDelivery ? "Retiro (Take Away)" : "Envío (Delivery)"}
                </span>
              </button>

              {safeOrder.user?.phone && (
                <button
                  type="button"
                  onClick={handleWhatsAppAction}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-emerald-600"
                >
                  <MessageSquare size={16} className="text-emerald-500" />
                  <span>Contactar por WhatsApp</span>
                </button>
              )}

              <div className="border-t border-slate-100 my-1" />

              {/* ZONA PELIGROSA / CANCELACIONES */}
              <button
                type="button"
                onClick={() => setShowCancelOptions(true)}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2.5 transition-colors text-red-600"
              >
                <span>Gestionar pedido / Rechazar</span>
              </button>
            </>
          ) : (
            /* VISTA INTERNA PARA LAS ACCIONES DE CANCELACIÓN */
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-slate-700 mb-1">
                Opciones de rechazo / cancelación:
              </div>

              {OrderCancellationActions && handleCancelOrder ? (
                <OrderCancellationActions
                  status={safeOrder.status}
                  deliveryStatus={safeOrder.deliveryStatus}
                  onCancel={(targetStatus: OrderStatus) => {
                    handleCancelOrder(targetStatus);
                    setIsOpen(false);
                  }}
                  loading={loading}
                />
              ) : (
                <div className="text-xs text-slate-400">
                  No hay acciones de cancelación disponibles.
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCancelOptions(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-2 border-t border-slate-100"
              >
                Volver atrás
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}