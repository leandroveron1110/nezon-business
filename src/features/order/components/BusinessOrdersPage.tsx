"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Package, Search, LayoutGrid, Printer } from "lucide-react";

import OrdersFilters from "./OrdersFilters";
import { simplifiedFilters } from "@/features/common/utils/filtersData";

import { DeliveryType, IOrderShortDto } from "@/types/order";
import { OrderList } from "./order/OrderList";
import { OrderDetailsSidePanel } from "./order/view-detail-order/OrderDetailsSidePanel";
import { getOrderPriority } from "@/features/order/utilities/order-logic";
import { IOrder } from "../types/order";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { PrintSelectorModal } from "./order/PrintSelectorModal";
import { usePrintTicket } from "../hooks/usePrintTicket";
import { useOrdersView } from "../hooks/useOrdersView";
import { useSyncOrders } from "../hooks/useSyncOrders";
import { useGetOrderById } from "../hooks/useGetOrderById";
import OrderBuilder from "./order/create-order/OrderBuilder";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/order-state-machine";
import { SyncIndicator } from "./order/SyncIndicator";
import { OrderKitchenView } from "./order/view-detail-order/OrderKitchenView";
import { OrderTicket } from "./order/ticket-order/OrderTicket";
import { CashRegisterStatusBadge } from "@/features/cashRegister/components/CashRegisterStatusBadge";
import { OpenCashModal } from "@/features/cashRegister/components/OpenCashModal";
import { useCashRegisterStatus } from "@/features/cashRegister/hooks/useCashRegisterStatus";

interface Props {
  businessId: string;
}

export default function BusinessOrdersPage({ businessId }: Props) {
  const { addAlert } = useAlert();
  const { print } = usePrintTicket();
  const printRef = useRef<HTMLDivElement>(null);

  // 1. Sincronización en background y consumo de datos en UI
  useSyncOrders(businessId);
  const { orders = [], isLoading } = useOrdersView(businessId);

  // --- ESTADOS DE CONTROL ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Activos");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPrintOrderId, setSelectedPrintOrderId] = useState<
    string | null
  >(null);
  const [isNewOrder, setIsNewOrder] = useState<boolean>(false);
  const [viewTicketOrderId, setViewTicketOrderId] = useState<string | null>(
    null,
  ); // Comanda en pantalla

  // --- ESTADOS DE IMPRESIÓN ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<IOrder | null>(null);
  const [printMode, setPrintMode] = useState<
    "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP" | null
  >(null);

  const { isOpen } = useCashRegisterStatus(businessId);

  // --- ANCLA TEMPORAL GLOBAL (RELOJ DE PANTALLA) ---
  const [now, setNow] = useState<number>(Date.now());
  // --- CONFIGURACIÓN MODULAR DINÁMICA DE LA APP (PROVISORIO) ---
  const [allowPhysicalPrinting, setAllowPhysicalPrinting] =
    useState<boolean>(true);
  const [allowDigitalTicket, setAllowDigitalTicket] = useState<boolean>(true);

  const [showOpenCashModal, setShowOpenCashModal] = useState(false);

  // Mantenemos la estructura del objeto agrupada para no romper tus referencias de abajo
  const businessSettings = useMemo(
    () => ({
      allowPhysicalPrinting,
      allowDigitalTicket,
    }),
    [allowPhysicalPrinting, allowDigitalTicket],
  );
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // Sincroniza cada 1 min
    return () => clearInterval(interval);
  }, []);

  // Custom hook que busca la orden por ID para imprimir
  const { order } = useGetOrderById(selectedPrintOrderId ?? "");

  // Monitorea cuando llega la data de la orden a imprimir
  useEffect(() => {
    // CAMBIO AQUÍ: Validamos que realmente exista una petición de impresión en curso con ID válido
    if (
      order &&
      selectedPrintOrderId &&
      (order.id === selectedPrintOrderId ||
        order.idTemp === selectedPrintOrderId)
    ) {
      setOrderToPrint(order);
      setShowPrintModal(true);
    }
  }, [order, selectedPrintOrderId]);

  const handlePrintRequest = async (id: string) => {
    setSelectedPrintOrderId(id);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setSelectedPrintOrderId(null);
    setOrderToPrint(null);
    setPrintMode(null); // Limpieza extra de seguridad
  };

  const executePrint = async (
    mode: "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP",
  ) => {
    if (!orderToPrint) return;

    if (mode === "SHARE_WHATSAPP") {
      setShowPrintModal(false);

      // Lazy load de la librería pesada de captura de imagen
      const { toPng } = await import("html-to-image");
      setPrintMode("CUSTOMER");

      // Esperamos el re-render en el DOM (800ms optimizado para móviles)
      setTimeout(async () => {
        if (!printRef.current) return;

        try {
          const dataUrl = await toPng(printRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            skipFonts: false,
          });

          const blob = await (await fetch(dataUrl)).blob();
          const ticketFile = new File(
            [blob],
            `Ticket_${orderToPrint.id.slice(-6)}.png`,
            { type: "image/png" },
          );

          const message = `¡Hola! 👋 Acá tenés el detalle de tu pedido #${orderToPrint.id.slice(-6).toUpperCase()}.`;

          if (
            navigator.canShare &&
            navigator.canShare({ files: [ticketFile] })
          ) {
            await navigator.share({
              files: [ticketFile],
              title: "Ticket de Pedido",
              text: message,
            });
          } else {
            // Fallback si no admite compartir archivos nativos (ej: Web desktop)
            window.open(
              `https://wa.me/3442667301?text=${encodeURIComponent(message)}`,
              "_blank",
            );
          }
        } catch (error) {
          console.error("Error capturando ticket:", error);
          addAlert({
            message: "No se pudo generar la imagen del ticket",
            type: "error",
          });
        } finally {
          setPrintMode(null);
          setSelectedPrintOrderId(null); // Reseteo total de flujo
        }
      }, 800);
    } else {
      setPrintMode(mode);
      setShowPrintModal(false);

      setTimeout(() => {
        if (printRef.current && orderToPrint) {
          print(printRef.current.innerHTML);
        }
        setPrintMode(null);
        setSelectedPrintOrderId(null); // Reseteo total de flujo
      }, 300);
    }
  };

  // Buscamos la orden para renderizar en el Modal de comanda en pantalla
  const orderToView = useMemo(() => {
    if (!viewTicketOrderId || !orders) return null;
    return orders.find((o) => o.idTemp === viewTicketOrderId) || null;
  }, [viewTicketOrderId, orders]);

  const normalizedOrders = useMemo(() => {
    return orders.map((o) => ({
      id: o.idTemp,
      customerName: o.customerName,
      deliveryType: o.deliveryType as DeliveryType,
      orderPaymentMethod: o.orderPaymentMethod,
      status: o.status as OrderStatus,
      paymentStatus: o.paymentStatus as PaymentStatus,
      deliveryStatus: o.deliveryStatus as DeliveryStatus,
      total: o.total - (o.totalDeliveryCost ?? 0),
      deliveryFee: o.totalDeliveryCost,
      userId: "",
      createdAt: String(o.createdAt),
      origin: o.origin,
      shortCode: o.shortCode || "",
    })) as IOrderShortDto[];
  }, [orders]);

  // --- FILTRADO, ORDENAMIENTO Y NORMALIZACIÓN (Ultra eficiente) ---
  const filteredAndSortedOrders = useMemo(() => {
    if (!normalizedOrders.length) return [];

    const currentFilter = simplifiedFilters.find(
      (f) => f.label === activeFilter,
    );

    const normalizedSearch = searchTerm.toLowerCase().trim().replace(/-/g, "");

    return (
      normalizedOrders

        // 1. FILTRO ACTIVO
        .filter((order) => {
          if (!currentFilter) return true;

          return currentFilter.condition(order);
        })

        // 2. BÚSQUEDA
        .filter((order) => {
          if (!normalizedSearch) return true;

          const normalizedShortCode = order.shortCode
            .toLowerCase()
            .replace(/-/g, "");

          const normalizedId = order.id.toLowerCase().replace(/-/g, "");

          const normalizedCustomer = order.customerName.toLowerCase();

          return (
            normalizedShortCode.includes(normalizedSearch) ||
            normalizedId.includes(normalizedSearch) ||
            normalizedCustomer.includes(normalizedSearch)
          );
        })

        // 3. ORDENAMIENTO
        .sort((a, b) => {
          const priorityA = getOrderPriority(a as any);
          const priorityB = getOrderPriority(b as any);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })
    );
  }, [normalizedOrders, activeFilter, searchTerm]);

  if (isLoading)
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse">
        Sincronizando con Hunay...
      </p>
    );

  return (
    <>
      <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
        {/* CAPTURA OCULTA (Off-screen Rendering) */}
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
          <div ref={printRef}>
            {/* CAMBIO AQUÍ: Forzamos a que existan estrictamente ambos parámetros de impresión */}
            {orderToPrint && printMode !== null && (
              <OrderTicket order={orderToPrint} mode={printMode} />
            )}
          </div>
        </div>

        {/* HEADER DEL PANEL */}
        <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
            {/* ========================================================= */}
            {/* FILA 1 - TÍTULO + ACCIÓN PRINCIPAL                        */}
            {/* ========================================================= */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="flex items-center gap-2 text-xl font-black text-slate-800">
                <LayoutGrid className="h-5 w-5 text-blue-600" />
                <span>Panel de Órdenes</span>
              </h1>

              {isOpen ? (
                <>
                  <button
                    onClick={() => setIsNewOrder(true)}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Nueva orden
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>

            {/* ========================================================= */}
            {/* FILA 2 - ESTADO DEL SISTEMA                              */}
            {/* ========================================================= */}
            <div className="flex flex-wrap items-center gap-2">
              <CashRegisterStatusBadge
                businessId={businessId}
                onOpenRegisterClick={() => setShowOpenCashModal(true)}
                onGoToCashPageClick={() => {}}
              />

              {/* <SyncIndicator /> */}

              {/* Estado KDS */}
              <button
                onClick={() => setAllowDigitalTicket(!allowDigitalTicket)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                  allowDigitalTicket
                    ? "border-slate-200 bg-white text-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>KDS</span>
              </button>

              {/* Estado POS */}
              <button
                onClick={() => setAllowPhysicalPrinting(!allowPhysicalPrinting)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                  allowPhysicalPrinting
                    ? "border-slate-200 bg-white text-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Printer className="h-4 w-4" />
                <span>POS</span>
              </button>
            </div>

            {/* ========================================================= */}
            {/* FILA 3 - BUSCADOR                                        */}
            {/* ========================================================= */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Buscar por ID o nombre del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ========================================================= */}
            {/* FILA 4 - FILTROS                                          */}
            {/* ========================================================= */}
            <OrdersFilters
              quickFilters={simplifiedFilters}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              orders={normalizedOrders}
            />
          </div>
        </header>
        {/* Botones de Acción Agrupados */}

        {/* CONTAINER MAESTRO CON ALTURA CONTROLADA */}
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-white">
          <div className="max-w-7xl mx-auto w-full">
            {/* HEADER DE LA TABLA FLEX REALINEADO CON LOS BOTONES DINÁMICOS */}
            <div className="hidden md:flex items-center gap-4 px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400 border-b bg-white sticky top-0 z-10 pl-8">
              <div className="min-w-[78px] text-center">Pedido</div>
              <div className="flex-1">Información del Cliente</div>
              <div className="min-w-[75px]"></div>
              <div className="min-w-[120px] text-right">Total</div>
              {businessSettings.allowDigitalTicket && (
                <div className="w-12"></div>
              )}
              {businessSettings.allowPhysicalPrinting && (
                <div className="w-12"></div>
              )}
            </div>

            <div className="divide-y divide-gray-100 bg-white">
              {filteredAndSortedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Package className="w-12 h-12 mb-4 opacity-20" />
                  <p>No hay órdenes en esta sección</p>
                </div>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <OrderList
                    key={order.id}
                    order={order}
                    now={now}
                    showPrintButton={businessSettings.allowPhysicalPrinting}
                    showViewTicketButton={businessSettings.allowDigitalTicket}
                    onClick={() => setSelectedOrderId(order.id)}
                    onPrintDirect={handlePrintRequest}
                    onViewTicket={(id) => {
                      // console.log(`id de la orden:${id}`)
                      setViewTicketOrderId(id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </main>

        {/* DETALLE LATERAL (SIDE PANEL) */}
        {selectedOrderId && (
          <OrderDetailsSidePanel
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </div>

      {/* MODAL DE COMANDA DIGITAL (KDS) - ULTRA RESPONSIVE */}
      {viewTicketOrderId && orderToView && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setViewTicketOrderId(null)} // Cierra al tocar fuera del recuadro
        >
          <div
            className="bg-white w-full h-full sm:h-fit sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Evita que se cierre al tocar dentro de la comanda
          >
            {/* BOTÓN SUPERIOR DE CIERRE (MÁXIMA ACCESIBILIDAD TÁCTIL) */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Vista de Producción
              </span>
              <button
                onClick={() => setViewTicketOrderId(null)}
                className="px-4 py-2 text-xs font-black bg-rose-600 text-white rounded-xl active:scale-95 transition-all shadow-md uppercase tracking-wider"
              >
                Cerrar Pantalla
              </button>
            </div>

            {/* CONTENEDOR INTERNO CON SCROLL INDEPENDIENTE */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-white">
              <OrderKitchenView order={orderToView as any} now={now} />
            </div>
          </div>
        </div>
      )}

      {/* MODALES DEL SISTEMA */}
      <PrintSelectorModal
        isOpen={showPrintModal}
        onClose={handleClosePrintModal}
        onSelect={executePrint}
      />

      {/* RENDER DEL MODAL */}
      <OpenCashModal
        businessId={businessId}
        isOpen={showOpenCashModal}
        onClose={() => setShowOpenCashModal(false)}
        onSuccess={() => {
          // Opcional: mostrar alerta de éxito
        }}
      />

      {isNewOrder && (
        <OrderBuilder
          onClose={() => setIsNewOrder(false)}
          businessid={businessId}
        />
      )}
    </>
  );
}
