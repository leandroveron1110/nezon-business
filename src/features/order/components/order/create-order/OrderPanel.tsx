"use client";

import { useState } from "react";
import { LocalOrderItem } from "@/features/common/database/shcema/orders.schema";
import { Trash2, Plus, Minus, Send, Zap, Truck, Store } from "lucide-react";
import { useLocationAutocomplete } from "@/features/order/hooks/useLocationAutocomplete";
import { normalizeAddress } from "@/lib/search-location";

interface OrderPanelProps {
  items: LocalOrderItem[];
  updateQty: (index: number, delta: number) => void;
  total: number;
  createOrder: () => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
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
  items,
  updateQty,
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
}: OrderPanelProps) {
  const isDelivery = deliveryType === "DELIVERY";
  const isLocus = deliveryProvider === "PLATFORM";

  const subtotal = items.reduce(
    (acc, item) => acc + item.priceAtPurchase * item.quantity,
    0,
  );

  const { query, setQuery, results } = useLocationAutocomplete();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedZoneId, setSelectedZoneIdLocal] = useState<string | null>(
    null,
  );

  return (
    <div className="md:w-[440px] border-l flex flex-col bg-white h-full overflow-hidden relative select-none">
      {/* 1. SELECTOR TIPO PEDIDO (Compacto) */}
      <div className="flex border-b divide-x h-10">
        <button
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
          onClick={() => setDeliveryType("DELIVERY")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black transition-colors ${
            isDelivery ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> ENVÍO
        </button>
      </div>

      {/* 2. DATOS CLIENTE (Ultra Compacto) */}
      <div className="p-1.5 bg-slate-50 border-b z-30">
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
            {/* Selector de Cadetería */}
            <div className="flex bg-slate-200/50 rounded p-0.5 gap-0.5">
              <button
                onClick={() => setDeliveryProvider("INTERNAL")}
                className={`flex-1 py-1 text-[9px] font-black rounded ${!isLocus ? "bg-white shadow-sm" : "text-slate-500"}`}
              >
                CADETE PROPIO
              </button>
              <button
                onClick={() => setDeliveryProvider("PLATFORM")}
                className={`flex-1 py-1 flex items-center justify-center gap-1 text-[9px] font-black rounded ${isLocus ? "bg-blue-500 text-white" : "text-slate-500"}`}
              >
                <Zap className="w-2.5 h-2.5" /> LOCUS APP
              </button>
            </div>

            {/* Dirección / Autocomplete */}
            <div className="flex gap-1 relative">
              <div className="relative flex-1">
                <input
                  placeholder="Calle, altura o barrio..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCustomerAddress(e.target.value);
                    setShowDropdown(true);
                    setSelectedZoneIdLocal(null);
                    setZoneId(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full px-2 py-1.5 bg-white border border-blue-100 rounded text-[11px] font-bold outline-none focus:ring-1 focus:ring-blue-400"
                />
                {/* NOTA/DESCRIPCIÓN: El toque final */}
                {/* <div className="flex items-center gap-1 bg-amber-50/50 border border-amber-100 rounded px-1.5">
        <span className="text-[8px] font-black text-amber-600 uppercase italic">Nota:</span>
        <input
          placeholder="Ej: Tocar timbre fuerte, portón blanco..."
          value={''} // Asegúrate de agregar esta prop
          // onChange={(e) => setCustomerNote(e.target.value)}
          className="flex-1 py-1 bg-transparent text-[10px] font-medium outline-none placeholder:text-amber-400/60"
        />
      </div> */}
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
                            setQuery(r.name);
                            setCustomerAddress(r.name);
                            setShowDropdown(false);
                            if (isBarrio) {
                              setZoneId(r.zoneId);
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 border-b last:border-0 transition-all relative overflow-hidden
        ${
          isBarrio
            ? "bg-blue-50/40 hover:bg-blue-600"
            : "bg-white hover:bg-slate-700"
        } 
        group`}
                        >
                          {/* Indicador de Tipo: Barra lateral sólida */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1.5 shadow-sm
        ${isBarrio ? "bg-blue-500" : "bg-slate-300 group-hover:bg-white/50"}`}
                          />

                          <div className="flex flex-col min-w-0 pl-2">
                            <span
                              className={`text-[11px] font-black uppercase truncate transition-colors
          ${isBarrio ? "text-blue-900 group-hover:text-white" : "text-slate-800 group-hover:text-white"}`}
                            >
                              {r.name}
                            </span>

                            {/* Alias sutil para calles con nombres viejos/populares */}
                            {r.type === "CALLE" &&
                              r.aliases?.some((a) =>
                                normalizeAddress(a).includes(
                                  normalizeAddress(query),
                                ),
                              ) && (
                                <span className="text-[9px] opacity-50 italic truncate group-hover:text-slate-300">
                                  ({r.aliases[0]})
                                </span>
                              )}
                          </div>

                          {/* Punto de estado visual en el extremo derecho (opcional, refuerza el color) */}
                          <div
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-20 group-hover:opacity-100
        ${isBarrio ? "bg-blue-400 group-hover:bg-white" : "bg-slate-200 group-hover:bg-white"}`}
                          />
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

      {/* 3. LISTA DE PRODUCTOS (Densidad Máxima) */}
      <div className="flex-1 overflow-y-auto bg-white z-10">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40">
            <Store className="w-8 h-8 mb-1" />
            <p className="text-[9px] font-black uppercase tracking-tighter">
              Esperando pedido...
            </p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="px-2 py-1.5 border-b flex items-center justify-between hover:bg-slate-50"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[10px] font-black uppercase truncate leading-tight">
                  {item.productName}
                </p>
                <p className="text-[9px] text-blue-600 font-bold">
                  ${item.priceAtPurchase}{" "}
                  <span className="text-slate-400 font-normal">x unid.</span>
                </p>
              </div>

              <div className="flex items-center bg-slate-100 rounded-md p-0.5 border">
                <button
                  onClick={() => updateQty(i, -1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={12} className="text-red-500" />
                  ) : (
                    <Minus size={12} />
                  )}
                </button>
                <span className="text-[10px] font-black w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQty(i, 1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. PAGO Y FOOTER (Compacto) */}
      <div className="border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="p-1.5 bg-white">
          <div className="flex gap-1">
            {[
              { key: "CASH", label: "EFECTIVO" },
              { key: "TRANSFER", label: "TRANSF." },
              { key: "QR", label: "MODO/QR" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setPaymentMethod(m.key as any)}
                className={`flex-1 py-1.5 text-[9px] font-black rounded border transition-all ${
                  paymentMethod === m.key
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white px-3 py-2">
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-[9px] font-bold opacity-60 uppercase">
              Total Pedido
            </span>
            <span className="text-xs font-bold">${subtotal}</span>
          </div>

          {isDelivery && (
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[9px] font-bold text-blue-400 uppercase">
                Envío
              </span>
              <span className="text-xs font-bold text-blue-400">
                {isLocus
                  ? selectedZoneId
                    ? "ZONA OK"
                    : "AUTO"
                  : `$${deliveryCost}`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-700">
            <span className="text-[10px] font-black uppercase">Cobrar</span>
            <span className="text-xl font-black text-green-400 tracking-tighter">
              ${total}
            </span>
          </div>

          <button
            onClick={createOrder}
            disabled={items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 transition-all mt-2 py-2.5 rounded flex justify-center items-center gap-2 font-black uppercase text-[11px] tracking-widest shadow-lg active:scale-95"
          >
            CONFIRMAR (ENTER) <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
