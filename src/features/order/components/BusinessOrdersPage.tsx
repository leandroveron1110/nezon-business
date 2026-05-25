"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Package, Search, LayoutGrid } from "lucide-react";

import OrdersFilters from "./OrdersFilters";
import { simplifiedFilters } from "@/features/common/utils/filtersData";

import { DeliveryType, IOrderShortDto, PaymentMethodType } from "@/types/order";
import { OrderList } from "./order/OrderList";
import { OrderDetailsSidePanel } from "./order/view-detail-order/OrderDetailsSidePanel";
import { getOrderPriority } from "@/features/order/utilities/order-logic";
import { IOrder } from "../types/order";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { OrderTicket } from "./order/ticket-order/OrderTicket";
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
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPrintOrderId, setSelectedPrintOrderId] = useState<string | null>(null);
  const [isNewOrder, setIsNewOrder] = useState<boolean>(false);

  // --- ESTADOS DE IMPRESIÓN ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<IOrder | null>(null);
  const [printMode, setPrintMode] = useState<"KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP" | null>(null);
  
  // Custom hook que busca la orden por ID para imprimir
  const { order } = useGetOrderById(selectedPrintOrderId ?? "");

  // Monitorea cuando llega la data de la orden a imprimir
  useEffect(() => {
    if (order && selectedPrintOrderId) {
      setOrderToPrint(order);
      setShowPrintModal(true);
    }
  }, [order, selectedPrintOrderId]);

  const handlePrintRequest =async (id: string) => {
    setSelectedPrintOrderId(id);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setSelectedPrintOrderId(null);
    setOrderToPrint(null);
  };

  const executePrint = async (mode: "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP") => {
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

          if (navigator.canShare && navigator.canShare({ files: [ticketFile] })) {
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

  // --- FILTRADO, ORDENAMIENTO Y NORMALIZACIÓN (Ultra eficiente) ---
const filteredAndSortedOrders = useMemo(() => {
  if (!orders.length) return [];

  const currentFilter = simplifiedFilters.find(
    (f) => f.label === activeFilter,
  );

  const term = searchTerm.toLowerCase().trim();

  return orders
    .filter((order) => {
      const matchesSearch =
        !term ||
        (order.id || order.idTemp || "")
          .toLowerCase()
          .includes(term) ||
        (order.customerName || "")
          .toLowerCase()
          .includes(term);

      if (!matchesSearch) return false;

      // IMPORTANTE:
      // "Todos" también usa su condición.
      if (!currentFilter) return true;

      return currentFilter.condition({
        id: order.id || order.idTemp,
        customerName: order.customerName,
        deliveryType: order.deliveryType as DeliveryType,
        createdAt: String(order.createdAt),
        orderPaymentMethod:
          order.orderPaymentMethod as PaymentMethodType,
        status: order.status as OrderStatus,
        deliveryStatus:
          order.deliveryStatus as DeliveryStatus,
        paymentStatus:
          order.paymentStatus as PaymentStatus,
        origin: order.origin,
        total: order.total,
        shortCode: order.shortCode || "",
        userId: "",
      });
    })
    .sort((a, b) => {
      const priorityA = getOrderPriority(a as any);
      const priorityB = getOrderPriority(b as any);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      );
    })
    .map((order) => ({
      id: order.id || order.idTemp,
      customerName: order.customerName,
      deliveryType:
        order.deliveryType as DeliveryType,
      orderPaymentMethod:
        order.orderPaymentMethod as PaymentMethodType,
      status: order.status as OrderStatus,
      total: order.total,
      userId: "",
      createdAt: String(order.createdAt),
      origin: order.origin,
      paymentStatus:
        order.paymentStatus as PaymentStatus,
      deliveryStatus:
        order.deliveryStatus as DeliveryStatus,
      shortCode: order.shortCode || "",
    }));
}, [orders, activeFilter, searchTerm]);

  // Se normalizan las órdenes de manera segura para el subcomponente de filtros sin re-mapear en el return
const shortedOrdersForFilters = useMemo(() => {
  return orders.map((o) => ({
    id: o.id || o.idTemp,
    customerName: o.customerName,

    deliveryType:
      o.deliveryType as DeliveryType,

    orderPaymentMethod:
      o.orderPaymentMethod as PaymentMethodType,

    status:
      o.status as OrderStatus,

    paymentStatus:
      o.paymentStatus as PaymentStatus,

    deliveryStatus:
      o.deliveryStatus as DeliveryStatus,

    total: o.total,

    userId: "",

    createdAt: String(o.createdAt),

    origin: o.origin,

    shortCode: o.shortCode || "",
  })) as IOrderShortDto[];
}, [orders]);

  if (isLoading) return <p className="p-6 text-center text-gray-500 animate-pulse">Sincronizando con Nezon...</p>;

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
            {orderToPrint && printMode && (
              <OrderTicket order={orderToPrint} mode={printMode} />
            )}
          </div>
        </div>

        {/* HEADER DEL PANEL */}
        <header className="bg-white border-b shadow-sm z-30">
          <div className="p-4 max-w-7xl mx-auto w-full space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                Panel de Órdenes
              </h1>
              <button 
                onClick={() => setIsNewOrder(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Nueva orden
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID o nombre..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 border border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

<OrdersFilters
  quickFilters={simplifiedFilters}
  activeFilter={activeFilter}
  setActiveFilter={setActiveFilter}
  orders={shortedOrdersForFilters}
/>
          </div>
        </header>

        {/* INDICADOR DE SINCRONIZACIÓN */}
        <div>
          <SyncIndicator />
        </div>

        {/* CONTENIDO PRINCIPAL (Scroll Controlado) */}
        <main className="flex-1 h-[calc(100vh-70px)] overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto w-full">
            
            {/* STICKY TABLE HEADER */}
            <div className="hidden md:flex items-center gap-4 px-6 py-3 text-[11px] uppercase tracking-wider font-black text-slate-400 border-b bg-white sticky top-0 z-20 pl-8">
              <div className="min-w-[78px] text-center">Pedido</div>
              <div className="flex-1">Información del Cliente</div>
              <div className="min-w-[75px]"></div>
              <div className="min-w-[120px] text-right">Total</div>
              <div className="w-12"></div> 
            </div>

            {/* LISTADO DE TARJETAS / FILAS */}
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
                    onClick={() => setSelectedOrderId(order.id)}
                    onPrintDirect={handlePrintRequest}
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

      {/* MODALES DEL SISTEMA */}
      <PrintSelectorModal
        isOpen={showPrintModal}
        onClose={handleClosePrintModal}
        onSelect={executePrint}
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