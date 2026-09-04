import { UIOrder } from "@/features/order/types/ui-order";
import { DeliveryStatus } from "@/mini-back/core/orders-core/domain/order-state-machine";
import { MapPin, Check, Send, Undo2 } from "lucide-react";

interface OrderDeliveryBarProps {
    safeOrder: UIOrder;
    copied: boolean;
    setCopied: (value: boolean) => void;
    loading: boolean;
    handleSolicitarCadete: () => void;
    handleCancelarCadete: () => void;
}
export function OrderDeliveryBar({
  safeOrder,
  copied,
  setCopied,
  loading,
  handleSolicitarCadete,
  handleCancelarCadete,
}: OrderDeliveryBarProps) {
  const handleCopyAddress = () => {
    const fullAddress = `${safeOrder.user?.address || ""}`.trim();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullAddress);
    } else {
      const input = document.createElement("input");
      input.value = fullAddress;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-3 py-2 bg-amber-50/90 border-b border-amber-200/80 flex items-center justify-between gap-2 shrink-0">
      <button
        type="button"
        onClick={handleCopyAddress}
        className="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-amber-100/70 p-1 rounded-md transition-all active:scale-[0.99] group cursor-pointer overflow-hidden"
        title="Click para copiar dirección completa"
      >
        <div className="relative shrink-0">
          <MapPin size={16} className="text-red-600" />
          {copied && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 animate-in zoom-in">
              <Check size={9} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-xs">
          <span
            className={`font-black truncate ${
              copied ? "text-emerald-700 font-extrabold" : "text-slate-900 group-hover:text-blue-700"
            }`}
          >
            {safeOrder.user?.address || "Sin dirección"}
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-blue-600 shrink-0 font-medium ml-0.5">
            {copied ? "¡Copiado!" : "(Copiar)"}
          </span>
        </div>
      </button>

      <div className="shrink-0 flex items-center gap-2">
        {safeOrder.deliveryProvider === "INTERNAL" && (
          <button
            onClick={handleSolicitarCadete}
            disabled={loading || safeOrder.status === "PENDING"}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-1 rounded-md text-xs font-black shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <Send size={11} />
            ASIGNAR
          </button>
        )}

        {safeOrder.deliveryProvider === "PLATFORM" && (
          <>
            {safeOrder.deliveryStatus === DeliveryStatus.PENDING && (
              <button
                onClick={handleSolicitarCadete}
                disabled={loading || safeOrder.status === "PENDING"}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-1 rounded-md text-xs font-black shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <Send size={11} />
                ENVIAR
              </button>
            )}

            {safeOrder.deliveryStatus === DeliveryStatus.REQUESTED && (
              <button
                onClick={handleCancelarCadete}
                disabled={loading}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-xs font-black shadow-sm transition-all flex items-center gap-1"
              >
                <Undo2 size={12} />
                RETIRAR
              </button>
            )}

            {safeOrder.deliveryStatus === DeliveryStatus.SHIPPED && (
              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                En camino
              </span>
            )}

            {safeOrder.deliveryStatus === DeliveryStatus.COMPLETED && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Entregado
              </span>
            )}

            {safeOrder.deliveryStatus === DeliveryStatus.CANCELLED && (
              <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                Cancelado
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}