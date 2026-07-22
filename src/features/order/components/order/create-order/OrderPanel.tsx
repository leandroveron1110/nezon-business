"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, Zap, Truck, Store, FileText } from "lucide-react";
import { useLocationAutocomplete } from "@/features/order/hooks/useLocationAutocomplete";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { quoteDeliveryOrchestrator } from "@/mini-back/orchestrator/delivery.orchestrator";
import {
  DeliveryQuotationStatus,
  LocalOrderItem,
} from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { useConnectivity } from "@/lib/hooks/useConnectivity";
import { useAlert } from "@/features/common/ui/Alert/Alert";

interface OrderPanelProps {
  businessId: string;
  isSubmitting: boolean;
  items: LocalOrderItem[];
  updateQty: (index: number, delta: number) => void;
  updateItemNote: (index: number, note: string) => void;
  total: number;
  createOrder: (instantPrepare?: boolean) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  deliveryQuotationStatus: DeliveryQuotationStatus | undefined;
  setDeliveryQuotationStatus: (v: DeliveryQuotationStatus | undefined) => void;
  customerAddress: string;
  setCustomerAddress: (v: string) => void;
  deliveryType: "PICKUP" | "DELIVERY";
  setDeliveryType: (v: "PICKUP" | "DELIVERY") => void;
  deliveryProvider: "PLATFORM" | "INTERNAL";
  setDeliveryProvider: (v: "PLATFORM" | "INTERNAL") => void;
  deliveryCost: number;
  setDeliveryCost: (v: number) => void;
  paymentMethod: "CASH" | "TRANSFER" | "QR" | "DELIVERY";
  setPaymentMethod: (v: "CASH" | "TRANSFER" | "QR" | "DELIVERY") => void;
  setZoneId: (v: string | null) => void;
}

export function OrderPanel({
  businessId,
  isSubmitting,
  items,
  updateQty,
  updateItemNote,
  total,
  createOrder,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  deliveryType,
  setDeliveryType,
  deliveryProvider,
  setDeliveryProvider,
  deliveryCost,
  setDeliveryCost,
  setPaymentMethod,
  paymentMethod,
  setZoneId,
  deliveryQuotationStatus,
  setDeliveryQuotationStatus,
}: OrderPanelProps) {
  const isDelivery = deliveryType === "DELIVERY";
  const isLocus = deliveryProvider === "PLATFORM";
  const { addAlert } = useAlert();

  // Mantenemos el índice abierto de forma explícita
  const [openNoteIndex, setOpenNoteIndex] = useState<number | null>(null);

  const subtotal = items.reduce(
    (acc, item) => acc + item.priceAtPurchase * item.quantity,
    0,
  );
  const [pendingPriceAutm, setPendingPriceAutm] = useState(true);
  const { query, setQuery, results } = useLocationAutocomplete();
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setSelectedZoneIdLocal] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (!isOnline) {
      setDeliveryProvider("INTERNAL");
    }
  }, [isOnline]);

  const handleManualSearch = async () => {
    if (!query.trim() || isSearching) return;

    try {
      setIsSearching(true);
      setDeliveryQuotationStatus("PENDING");

      const response = await quoteDeliveryOrchestrator(
        query,
        businessId,
        deliveryProvider,
      );

      if (!response.success || !response.data) {
        setDeliveryQuotationStatus("PENDING");
        addAlert({
          message:
            "No pudimos procesar la dirección. Revisá la conexión o intentá de nuevo.",
          type: "error",
        });
        return;
      }

      const quotation = response.data;
      const add = quotation.resolvedAddress || query;

      if (quotation.zoneId) {
        setZoneId(quotation.zoneId);
        setSelectedZoneIdLocal(quotation.zoneId);
        setCustomerAddress(add);
      }

      if (quotation.quotationStatus === "RESOLVED" && quotation.quotedCost) {
        setDeliveryCost(quotation.quotedCost);
        setPendingPriceAutm(false);
        setDeliveryQuotationStatus("RESOLVED");
        setCustomerAddress(add);

        return;
      }

      if (quotation.resolutionStrategy === "ZONE_ONLY") {
        addAlert({
          message:
            "Dirección identificada (Barrio Interno). Se notificó a la base para cotizar el envío; te avisamos apenas respondan.",
          type: "info",
        });
        setCustomerAddress(customerAddress);
        setDeliveryQuotationStatus("PENDING");
        return;
      }

      if (quotation.resolutionStrategy === "ZONE_FALLBACK") {
        addAlert({
          message:
            "Ubicamos la zona pero no el costo exacto. El pedido ya fue enviado a base para fijar el precio manualmente.",
          type: "info",
        });
        setDeliveryQuotationStatus("PENDING");
        setCustomerAddress(customerAddress);

        return;
      }

      if (quotation.resolutionStrategy === "MANUAL") {
        addAlert({
          message:
            "No pudimos verificar la altura en el mapa. Despachamos una solicitud de cotización manual a la base para resolverlo.",
          type: "info",
        });
        setDeliveryQuotationStatus("PENDING");
        setCustomerAddress(customerAddress);

        return;
      }
    } catch (error) {
      console.error("Error en cotización manual:", error);
      addAlert({
        message:
          "Ocurrió un inconveniente inesperado. Si persiste, comunicate con soporte.",
        type: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-white h-full overflow-hidden select-none">
      {/* 1. SELECTOR TIPO PEDIDO */}
      <div className="flex border-b divide-x h-10 shrink-0">
        <button
          type="button"
          onClick={() => setDeliveryType("PICKUP")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
            !isDelivery
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <Store className="w-3.5 h-3.5" /> RETIRO
        </button>
        <button
          type="button"
          onClick={() => setDeliveryType("DELIVERY")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
            isDelivery ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> ENVÍO
        </button>
      </div>

      {/* 2. DATOS CLIENTE */}
      <div className="p-1.5 bg-slate-50 border-b shrink-0 z-30">
        <div className="flex gap-1 mb-1">
          <input
            placeholder="Cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 px-2 py-1.5 bg-white border rounded text-[11px] font-bold outline-none focus:border-blue-400"
          />
          <input
            placeholder="Tel/WA"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-[90px] px-2 py-1.5 bg-white border rounded text-[11px] font-bold outline-none focus:border-blue-400"
          />
        </div>

        {isDelivery && (
          <div className="space-y-1 mt-1.5">
            <div className="flex bg-slate-200/50 rounded p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setDeliveryProvider("INTERNAL")}
                className={`flex-1 py-1 text-[9px] font-black rounded ${!isLocus ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                CADETE PROPIO
              </button>
              {isOnline && (
                <button
                  type="button"
                  onClick={() => setDeliveryProvider("PLATFORM")}
                  className={`flex-1 py-1 flex items-center justify-center gap-1 text-[9px] font-black rounded ${isLocus ? "bg-blue-500 text-white" : "text-slate-500"}`}
                >
                  <Zap className="w-2.5 h-2.5" /> Voy!
                </button>
              )}
            </div>

            <div className="flex gap-1 relative">
              <div className="relative flex-1">
                <input
                  placeholder="Calle, altura o barrio..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCustomerAddress(e.target.value);
                    setShowDropdown(true);
                    setZoneId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleManualSearch();
                      setShowDropdown(false);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full px-2 py-1.5 bg-white border border-blue-100 rounded text-[11px] font-bold outline-none focus:ring-1 focus:ring-blue-400"
                />
                {showDropdown && results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-2xl z-[100] max-h-40 overflow-y-auto overflow-x-hidden">
                    {results.map((r) => {
                      const isBarrio = r.type === "BARRIO";
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const alturaExistente =
                              query.match(/\d+$/)?.[0] || "";
                            let newQuery = r.name.includes(" - ")
                              ? `${r.name} ${alturaExistente}`.trim() + " "
                              : r.name + " ";

                            setQuery(newQuery);
                            setCustomerAddress(newQuery);
                            setShowDropdown(false);

                            if (r.type === "BARRIO" && r.zoneId) {
                              setZoneId(r.zoneId);
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 border-b last:border-0 transition-all relative overflow-hidden ${
                            isBarrio
                              ? "bg-blue-50/40 hover:bg-blue-600 text-blue-900"
                              : "bg-white hover:bg-slate-700 text-slate-800"
                          } group`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1.5 ${isBarrio ? "bg-blue-500" : "bg-slate-300 group-hover:bg-white/50"}`}
                          />
                          <div className="flex flex-col min-w-0 pl-2">
                            <span className="text-[11px] font-black uppercase truncate group-hover:text-white">
                              {r.name}
                            </span>
                            <span
                              className={`text-[9px] leading-none group-hover:text-white/50 ${isBarrio ? "text-blue-700/50" : "text-slate-400"}`}
                            >
                              {r.name.includes(" - ")
                                ? "Barrio + Calle"
                                : isBarrio
                                  ? "Zona / Barrio"
                                  : "Calle"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {!isLocus && (
                <input
                  type="number"
                  placeholder="$"
                  value={deliveryCost || ""}
                  onChange={(e) => setDeliveryCost(Number(e.target.value))}
                  className="w-[55px] px-1 py-1.5 bg-green-50 border border-green-200 rounded text-[11px] font-black text-green-700 text-center"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. LISTA DE PRODUCTOS */}
      <div className="flex-1 overflow-y-auto bg-white z-10 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 py-20 select-none">
            <Store className="w-8 h-8 mb-1" />
            <p className="text-[9px] font-black uppercase tracking-tighter">
              Esperando pedido...
            </p>
          </div>
        ) : (
          items.map((item, i) => {
            const isNoteOpen = openNoteIndex === i;
            const hasNote = Boolean(item.notes);

            return (
              <div
                key={i}
                /* Atajo: Ctrl + Click o Cmd + Click abre/cierra la nota */
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setOpenNoteIndex(isNoteOpen ? null : i);
                  }
                }}
                className={`px-2.5 py-1.5 flex flex-col transition-colors cursor-pointer select-none ${
                  isNoteOpen
                    ? "bg-amber-50/80 border-l-2 border-orange-500"
                    : hasNote
                      ? "bg-amber-50/30 hover:bg-amber-50/60"
                      : "hover:bg-slate-50/80"
                }`}
                title="Ctrl + Click para agregar nota de cocina"
              >
                {/* FILA PRINCIPAL */}
                <div className="flex items-center justify-between gap-2">
                  {/* Información del Producto */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase truncate leading-tight text-slate-800">
                      {item.productName}
                    </p>
                    <p className="text-[9px] text-blue-600 font-bold leading-tight">
                      {formatPrice(item.priceAtPurchase)}{" "}
                      <span className="text-slate-400 font-normal">
                        x unid.
                      </span>
                    </p>
                  </div>

                  {/* CONTROLES CANTIDAD (Stop propagation para evitar disparar Ctrl+Click) */}
                  <div
                    className="flex items-center bg-slate-100 rounded-md p-0.5 border shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(i, -1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white active:bg-slate-200 rounded transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={12} className="text-red-500" />
                      ) : (
                        <Minus size={12} className="text-slate-600" />
                      )}
                    </button>

                    <span className="text-[10px] font-black w-5 text-center text-slate-800">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQty(i, 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white active:bg-slate-200 rounded transition-colors text-slate-600"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* BOTÓN NOTA MANUAL */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenNoteIndex(isNoteOpen ? null : i);
                    }}
                    className={`w-6 h-6 flex items-center justify-center rounded shrink-0 transition-colors ${
                      hasNote
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        : "hover:bg-slate-200 text-slate-400"
                    }`}
                    title="Agregar nota (o usá Ctrl + Click)"
                  >
                    <FileText size={12} />
                  </button>
                </div>

                {/* EDITOR DE NOTA */}
                {isNoteOpen && (
                  <div
                    className="flex flex-col gap-1 mt-1.5 bg-white border border-orange-300 rounded p-1.5 shadow-sm animate-in fade-in duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider">
                        Notas para cocina
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenNoteIndex(null)}
                        className="text-[8px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase transition-colors"
                      >
                        Listo
                      </button>
                    </div>
                    <textarea
                      autoFocus
                      rows={2}
                      placeholder={`Poca salsa\nMucho queso\nSin cebolla...`}
                      value={item.notes || ""}
                      onChange={(e) => updateItemNote?.(i, e.target.value)}
                      onKeyDown={(e) => {
                        // Si presiona Ctrl+Enter guarda la nota rápido
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          setOpenNoteIndex(null);
                        }
                      }}
                      className="w-full text-[10px] font-bold bg-slate-50 border border-slate-200 rounded p-1 outline-none focus:bg-white focus:border-orange-400 text-slate-800 placeholder:text-slate-400 placeholder:font-normal resize-none leading-tight"
                    />
                  </div>
                )}

                {/* RESUMEN DE NOTA (CUANDO EL EDITOR ESTÁ CERRADO) */}
                {hasNote && !isNoteOpen && (
                  <div
                    onClick={(e) => {
                      // Hacer click en la nota previa también abre el editor
                      e.stopPropagation();
                      setOpenNoteIndex(i);
                    }}
                    className="text-[9px] text-orange-700 font-bold mt-1 bg-orange-100/70 hover:bg-orange-100 px-1.5 py-1 rounded border border-orange-200/80 whitespace-pre-line leading-tight cursor-pointer"
                  >
                    {item.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. FOOTER Y ACCIONES DE COBRO */}
      <div className="border-t border-slate-200 shrink-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="p-1.5 bg-slate-50 border-b flex gap-1">
          {[
            { key: "CASH", label: "EFECTIVO" },
            { key: "TRANSFER", label: "TRANSF." },
            { key: "QR", label: "QR / MODO" },
          ].map((m) => {
            const isSelected = paymentMethod === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setPaymentMethod(m.key as any)}
                className={`flex-1 py-1 text-[9px] font-black rounded-lg border text-center transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900 text-white p-2">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase px-1">
            <span>Subtotal: {formatPrice(subtotal)}</span>
            {isDelivery && <span>Envío: {formatPrice(deliveryCost)}</span>}
          </div>

          <div className="flex justify-between items-center py-1 px-1">
            <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
              Total a Cobrar
            </span>
            <span className="text-xl font-black text-emerald-400 tracking-tight">
              {formatPrice(total)}
            </span>
          </div>

          {!isSubmitting && (
            <div className="mt-1 flex gap-2 select-none">
              <button
                type="button"
                onClick={() => createOrder(false)}
                disabled={items.length === 0}
                className="flex-1 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-[9px] font-black uppercase"
              >
                Solo Guardar
              </button>

              <button
                type="button"
                onClick={() => createOrder(true)}
                disabled={items.length === 0}
                className="flex-[2] py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md"
              >
                ¡MARCHAR COMANDA!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
