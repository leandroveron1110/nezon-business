"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Loader2, MapPin } from "lucide-react";

import { useLocationAutocomplete } from "@/features/order/hooks/useLocationAutocomplete";
import { quoteDeliveryOrchestrator } from "@/mini-back/orchestrator/delivery.orchestrator";
import { DeliveryQuotationStatus } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { useConnectivity } from "@/lib/hooks/useConnectivity";
import { useAlert } from "@/features/common/ui/Alert/Alert";

interface CustomerDeliverySectionProps {
  businessId: string;

  customerName: string;
  setCustomerName: (v: string) => void;

  customerPhone: string;
  setCustomerPhone: (v: string) => void;

  customerAddress: string;
  setCustomerAddress: (v: string) => void;

  deliveryType: "PICKUP" | "DELIVERY";

  deliveryProvider: "PLATFORM" | "INTERNAL";
  setDeliveryProvider: (v: "PLATFORM" | "INTERNAL") => void;

  deliveryCost: number;
  setDeliveryCost: (v: number) => void;

  setZoneId: (v: string | null) => void;
  setDeliveryQuotationStatus: (v: DeliveryQuotationStatus | undefined) => void;
}

function formatCurrency(val: number): string {
  if (!val) return "";
  return new Intl.NumberFormat("es-AR").format(val);
}

export function CustomerDeliverySection({
  businessId,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  deliveryType,
  deliveryProvider,
  setDeliveryProvider,
  deliveryCost,
  setDeliveryCost,
  setZoneId,
  setDeliveryQuotationStatus,
}: CustomerDeliverySectionProps) {
  const isDelivery = deliveryType === "DELIVERY";
  const isPlatform = deliveryProvider === "PLATFORM";

  const { addAlert } = useAlert();
  const { isOnline } = useConnectivity();

  const { query, setQuery, results } = useLocationAutocomplete();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [costInputValue, setCostInputValue] = useState(
    deliveryCost > 0 ? formatCurrency(deliveryCost) : "",
  );

  useEffect(() => {
    if (!isOnline && deliveryProvider === "PLATFORM") {
      setDeliveryProvider("INTERNAL");
    }
  }, [isOnline, deliveryProvider, setDeliveryProvider]);

  // Mantener sincronizado el input de costo si cambia por cotización externa
  useEffect(() => {
    setCostInputValue(deliveryCost > 0 ? formatCurrency(deliveryCost) : "");
  }, [deliveryCost]);

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
      const add = query;

      if (quotation.zoneId) {
        setZoneId(quotation.zoneId);
        setCustomerAddress(add);
      }

      if (quotation.quotationStatus === "RESOLVED" && quotation.quotedCost) {
        setDeliveryCost(quotation.quotedCost);
        setDeliveryQuotationStatus("RESOLVED");
        setCustomerAddress(add);
        return;
      }

      if (quotation.resolutionStrategy === "ZONE_ONLY") {
        addAlert({
          message:
            "Dirección identificada (Barrio Interno). Se notificó a la base para cotizar el envío.",
          type: "info",
        });
        setCustomerAddress(customerAddress);
        setDeliveryQuotationStatus("PENDING");
        return;
      }

      if (quotation.resolutionStrategy === "ZONE_FALLBACK") {
        addAlert({
          message:
            "Ubicamos la zona pero no el costo exacto. Solicitud enviada a base.",
          type: "info",
        });
        setCustomerAddress(customerAddress);
        setDeliveryQuotationStatus("PENDING");
        return;
      }

      if (quotation.resolutionStrategy === "MANUAL") {
        addAlert({
          message:
            "No pudimos verificar la altura en el mapa. Solicitud manual enviada a base.",
          type: "info",
        });
        setCustomerAddress(customerAddress);
        setDeliveryQuotationStatus("PENDING");
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

  const handleCostChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      setCostInputValue("");
      setDeliveryCost(0);
      return;
    }
    const num = Number(digits);
    setCostInputValue(formatCurrency(num));
    setDeliveryCost(num);
  };

  return (
    <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-2 py-1.5 select-none">
      {/* ----------------------------------------------------------------------
          DATOS BÁSICOS DE CLIENTE (Siempre visibles)
          ---------------------------------------------------------------------- */}
      <div className="flex gap-1.5">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="h-7 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
        />

        <input
          type="text"
          inputMode="tel"
          placeholder="Teléfono / WA"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="h-7 w-[95px] rounded-md border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
        />
      </div>

      {/* ----------------------------------------------------------------------
          SECCIÓN DELIVERY (Solo si deliveryType === 'DELIVERY')
          ---------------------------------------------------------------------- */}
      {isDelivery && (
        <div className="mt-1.5 space-y-1 animate-in fade-in duration-150">
          {/* Selector Cadete Propio / Plataforma */}
          <div className="flex h-6 rounded-md bg-slate-200/70 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setDeliveryProvider("INTERNAL")}
              className={`flex-1 rounded text-[8px] font-black transition-all ${
                !isPlatform
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              CADETE PROPIO
            </button>

            {isOnline && (
              <button
                type="button"
                onClick={() => setDeliveryProvider("PLATFORM")}
                className={`flex-1 flex items-center justify-center gap-1 rounded text-[8px] font-black transition-all ${
                  isPlatform
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                VOY!
              </button>
            )}
          </div>

          {/* Input Dirección + Autocomplete + Costo Manual */}
          <div className="relative flex gap-1">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
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
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="h-7 w-full rounded-md border border-blue-200 bg-white px-2 pr-6 text-[10px] font-bold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />

              {/* Icono de carga si se está cotizando */}
              {isSearching && (
                <div className="absolute right-2 top-1.5 text-blue-500">
                  <Loader2 size={12} className="animate-spin" />
                </div>
              )}

              {/* DROPDOWN DE RESULTADOS */}
              {showDropdown && results.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-0.5 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
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

                          const newQuery = r.name.includes(" - ")
                            ? `${r.name} ${alturaExistente}`.trim() + " "
                            : r.name + " ";

                          setQuery(newQuery);
                          setCustomerAddress(newQuery);
                          setShowDropdown(false);

                          if (r.type === "BARRIO" && r.zoneId) {
                            setZoneId(r.zoneId);
                          }
                        }}
                        className={`relative flex w-full items-center gap-2 border-b border-slate-100 px-2.5 py-1.5 text-left last:border-0 hover:bg-slate-100 transition-colors`}
                      >
                        <MapPin
                          size={12}
                          className={
                            isBarrio ? "text-blue-500" : "text-slate-400"
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-black uppercase text-slate-800">
                            {r.name}
                          </span>
                          <span className="block text-[8px] font-bold text-slate-400">
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

            {/* PRECIO MANUAL DE ENVÍO (Solo visible para Cadete Propio) */}
            {!isPlatform && (
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Envío $"
                  value={costInputValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleCostChange(e.target.value)}
                  className="h-7 w-[68px] rounded-md border border-emerald-300 bg-emerald-50/60 px-1 text-center text-[10px] font-black text-emerald-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-300"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
