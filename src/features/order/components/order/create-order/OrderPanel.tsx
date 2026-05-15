"use client";

import { useState } from "react";
import { LocalOrderItem } from "@/features/common/database/shcema/orders.schema";
import { Trash2, Plus, Minus, Send, Zap, Truck, Store } from "lucide-react";
import { useLocationAutocomplete } from "@/features/order/hooks/useLocationAutocomplete";
import { normalizeAddress } from "@/lib/search-location";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { AddressData } from "@/features/locationSelector/types/address-data";
import { useAutoResolveLocation } from "./AutoLocationResolver";
import { fetchCalculateDeliveryCost } from "@/features/order/api/catalog-api";
import { STREET_SUGGESTIONS } from "@/data/street-suggestions";
import { LOCATION_DATA } from "@/data/location-search-data";
import { BarrioSuggestion } from "@/data/location-search";

interface OrderPanelProps {
  businessId: string;
  items: LocalOrderItem[];
  updateQty: (index: number, delta: number) => void;
  total: number;
  // Actualizado: Ahora acepta el flag de preparación inmediata
  createOrder: (instantPrepare?: boolean) => void;
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
  businessId,
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
  const { resolve } = useAutoResolveLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedZoneId, setSelectedZoneIdLocal] = useState<string | null>(
    null,
  );

const handleManualSearch = async () => {
  if (!query) return;

  const queryLimpio = query.trim().toLowerCase();

  // Expresión regular idéntica a la del motor para capturar internas de barrio
  const regexInteriorBarrio = /\b(mza|mz|m|casa|csa|c|mod|modulo|sec|seccion|s|block|b|lote|l)\b/i;

  let queryParaEsri = null;
  let barrioEncontrado: BarrioSuggestion | null = null;

  // =========================================================================
  // 1. EVALUAR FORMATO CON GUION (Seleccionado desde el Dropdown)
  // =========================================================================
  if (query.includes(" - ")) {
    const partes = query.split(" - ");
    const nombreBarrio = partes[0].trim().toLowerCase();
    const restoDireccion = partes[1].trim();

    barrioEncontrado = LOCATION_DATA.find(
      (s) => s.type === "BARRIO" && s.name.toLowerCase() === nombreBarrio
    ) as BarrioSuggestion | null;

    // Si después del guion hay estructura de manzana, es Barrio Puro. Si no, va a ESRI.
    if (regexInteriorBarrio.test(restoDireccion.toLowerCase())) {
      console.log("Formato guion detectado: Estructura interna de BARRIO");
    } else {
      console.log("Formato guion detectado: BARRIO + CALLE. Preparando geocodificación.");
      queryParaEsri = restoDireccion;
    }
  } 
  // =========================================================================
  // 2. EVALUAR TEXTO CORRIDO (Escrito a mano por el cajero sin guion)
  // =========================================================================
  else {
    // Buscamos si el inicio coincide con un barrio conocido
    barrioEncontrado = LOCATION_DATA
      .filter((s) => s.type === "BARRIO")
      .sort((a, b) => b.name.length - a.name.length)
      .find((b) => queryLimpio.startsWith(b.name.toLowerCase())) as BarrioSuggestion | null;

    if (barrioEncontrado) {
      // Extraemos lo que escribió después del nombre del barrio
      const restoDireccion = query.substring(barrioEncontrado.name.length).trim();

      if (restoDireccion) {
        // Si tiene palabras clave de manzana/casa, se procesa como Barrio Puro (No va a ESRI)
        if (regexInteriorBarrio.test(restoDireccion.toLowerCase())) {
          console.log("Texto corrido: Se detectó patrón interno. Es BARRIO puro.");
        } else {
          // Si es texto libre (calle conocida o nueva), se extrae para mandarlo a ESRI
          console.log("Texto corrido: Se detectó una CALLE posterior al Barrio.");
          queryParaEsri = restoDireccion;
        }
      } else {
        console.log("Texto corrido: Solo se ingresó el nombre del BARRIO base.");
      }
    }
  }

  // =========================================================================
  // EJECUCIÓN DE LÓGICAS DE NEGOCIO Y APIS
  // =========================================================================

  // Si en cualquiera de los pasos anteriores identificamos un Barrio, aseguramos su Zona de costos
  if (barrioEncontrado) {
    console.log("Asignando ZoneID del Barrio detectado:", barrioEncontrado.zoneId);
    // barrioEncontrado.
    // setZoneId(barrioEncontrado.zoneId);
  }

  // CASO A: Es un Barrio Puro (No tenemos query asignado para ESRI)
  if (barrioEncontrado && !queryParaEsri) {
    console.log("Finalizando flujo: Destino procesado como BARRIO PURO interno.");
    // handleLocationSyncSuccess({ latitude: null, longitude: null, address: query.trim() });
    return; // Frenamos acá, no gasta peticiones en el mapa.
  }

  // CASO B: Hay una calle por resolver (Sea Calle Pura o una calle dentro de un Barrio)
  // Si no hay barrioEncontrado, queryParaEsri sigue siendo null, así que usa el query original (Calle Pura)
  const direccionFinalABuscar = queryParaEsri || query;
  
  console.log(`Iniciando búsqueda en ESRI para: "${direccionFinalABuscar}"`);
  let result = await resolve(direccionFinalABuscar);

  // Fallback tradicional de alias por si ESRI no encuentra la altura de la calle
  if (!result) {
    const querySinAltura = direccionFinalABuscar.replace(/\d+/g, "").trim().toLowerCase();
    const streetInfo = STREET_SUGGESTIONS.find(
      (s) =>
        s.name.toLowerCase() === querySinAltura ||
        s.aliases?.some((a) => a.toLowerCase() === querySinAltura),
    );

    if (streetInfo?.aliases?.length) {
      console.log("Calle no encontrada en primera instancia. Reintentando con alias...");
      const altura = direccionFinalABuscar.match(/\d+/)?.[0] || "";

      for (const alias of streetInfo.aliases) {
        const fallbackQuery = `${alias} ${altura}`.trim();
        const fallbackResult = await resolve(fallbackQuery);

        if (fallbackResult) {
          result = fallbackResult;
          break;
        }
      }
    }
  }

  // Procesamos el cobro con el pin del mapa si se encontró
  if (result) {
    console.log("Coordenadas obtenidas con éxito de ESRI:", result.latitude, result.longitude);
    await fetchCalculateDeliveryCost({
      businessId: businessId,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    // handleLocationSyncSuccess(result);
  } else {
    // Si la calle estaba dentro de un barrio conocido (Calle Nueva), dejamos pasar el cobro por zona
    if (barrioEncontrado) {
      alert(`Ubicación guardada en ${barrioEncontrado.name}. No pudimos verificar la altura exacta en el mapa, pero el costo de envío se calculó por zona.`);
    } else {
      alert("No pudimos encontrar la altura exacta en el mapa. Por favor, verificá el número o intentá con una calle cercana.");
    }
  }
};

  return (
    <div className="md:w-[440px] border-l flex flex-col bg-white h-full overflow-hidden relative select-none">
      {/* 1. SELECTOR TIPO PEDIDO */}
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

      {/* 2. DATOS CLIENTE */}
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
                <Zap className="w-2.5 h-2.5" /> Voy!
              </button>
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
                    setSelectedZoneIdLocal(null);
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
                            e.preventDefault(); // Evita perder el foco del input

                            // Extraemos cualquier altura numérica que el usuario ya haya escrito al final
                            const alturaExistente =
                              query.match(/\d+$/)?.[0] || "";

                            let newQuery = "";
                            if (r.name.includes(" - ")) {
                              // Si es un resultado mixto (Barrio - Calle), seteamos la estructura limpia
                              newQuery =
                                `${r.name} ${alturaExistente}`.trim() + " ";
                            } else {
                              // Si es un resultado simple
                              newQuery = r.name + " ";
                            }

                            setQuery(newQuery);
                            setCustomerAddress(newQuery);
                            setShowDropdown(false);

                            // Si el item trae zoneId (sea Barrio puro o la Calle combinada), lo seteamos
                            if (r.type == "BARRIO" && r.zoneId) {
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
                            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                              isBarrio
                                ? "bg-blue-500"
                                : "bg-slate-300 group-hover:bg-white/50"
                            }`}
                          />
                          <div className="flex flex-col min-w-0 pl-2">
                            <span className="text-[11px] font-black uppercase truncate group-hover:text-white">
                              {r.name}
                            </span>
                            <span
                              className={`text-[9px] leading-none group-hover:text-white/50 ${
                                isBarrio ? "text-blue-700/50" : "text-slate-400"
                              }`}
                            >
                              {/* Si el nombre fue transformado a mixto, indicamos ambas cosas */}
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
                  {formatPrice(item.priceAtPurchase)}{" "}
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

      {/* 4. PAGO Y ACCIONES */}
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
            <span className="text-xs font-bold">{formatPrice(subtotal)}</span>
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
                  : formatPrice(deliveryCost)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-700">
            <span className="text-[10px] font-black uppercase">Cobrar</span>
            <span className="text-xl font-black text-green-400 tracking-tighter">
              {formatPrice(total)}
            </span>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="mt-4 mb-6 flex gap-3 px-2">
            {/* BOTÓN SECUNDARIO: ACCIÓN AUXILIAR (MENOS PESO VISUAL) */}
            <button
              onClick={() => createOrder(false)}
              disabled={items.length === 0}
              className="
      flex-1
      h-16
      rounded-2xl
      border-2 border-slate-300
      
      flex flex-col items-center justify-center
      text-slate-500
      transition-all
      active:translate-y-1 active:border-b-[0px]
      hover:bg-slate-50
      disabled:opacity-30
      border-b-[4px] 
    "
            >
              <Send size={16} className="mb-0.5" />
              <span className="text-[10px]  uppercase tracking-tight">
                Solo Guardar
              </span>
            </button>

            {/* BOTÓN PRINCIPAL: ACCIÓN DEFINITIVA (MÁXIMO CONTRASTE) */}
            <button
              onClick={() => createOrder(true)}
              disabled={items.length === 0}
              className="
      flex-[2.5]
      h-16
      relative
      rounded-2xl
      bg-emerald-600
      border-b-[6px] border-emerald-700
      flex items-center justify-center
      transition-all
      active:translate-y-1 active:border-b-[2px]
      hover:bg-emerald-400
      disabled:opacity-40 disabled:border-b-[2px] disabled:translate-y-1
      group
    "
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black uppercase tracking-tighter text-emerald-950 italic">
                    ¡MARCHAR!
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 -mt-1">
                  Confirmar + Cocina
                </span>
              </div>

              {/* Brillo superior para dar volumen de "botón real" */}
              <div className="absolute inset-x-2 top-1 h-[2px] bg-white/30 rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
