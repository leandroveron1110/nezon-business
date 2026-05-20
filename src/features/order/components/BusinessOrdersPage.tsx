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
import { toPng } from "html-to-image";
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

  // Referencia para el contenedor oculto del ticket
  const { print, generateImage } = usePrintTicket();
  const printRef = useRef<HTMLDivElement>(null);

  // 1. Disparás la sincronización (background)
  useSyncOrders(businessId);

  // 2. Consumís los datos (UI)
  const { orders, isLoading } = useOrdersView(businessId);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPrintOrderId, setSelectedPrintOrderId] = useState<
    string | null
  >(null);
  const [isNewOrder, setIsNewOrder] = useState<boolean>(false);


  // --- ESTADOS DE IMPRESIÓN ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<IOrder | null>(null);
  const [printMode, setPrintMode] = useState<
    "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP" | null
  >(null);
  const { order } = useGetOrderById(selectedPrintOrderId ?? "");

  useEffect(() => {
    if (order) {
      console.log("imprimir orden");
      setOrderToPrint(order);
      setShowPrintModal(true);
    }
  }, [order]);

  // 1. Inicia el proceso buscando la orden completa
  const handlePrintRequest = async (id: string) => {
    console.log("orderid", id);
    setSelectedPrintOrderId(id);
  };

  const executePrint = async (
    mode: "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP",
  ) => {
    if (!orderToPrint) return;

    if (mode === "SHARE_WHATSAPP") {
      setShowPrintModal(false);
      // 1. Forzamos el renderizado del ticket en modo Cliente
      setPrintMode("CUSTOMER");

      // 2. Esperamos un poco más para que React lo inyecte en el DOM y las fuentes carguen
      setTimeout(async () => {
        if (!printRef.current) return;

        try {
          // Configuraciones extra para asegurar la captura en móviles
          const dataUrl = await toPng(printRef.current, {
            cacheBust: true, // Evita problemas de caché de imágenes
            pixelRatio: 2, // Mejora la calidad para que no se vea pixelado
            backgroundColor: "#ffffff",
            skipFonts: false, // Asegura que use la fuente monoespaciada
          });

          const blob = await (await fetch(dataUrl)).blob();

          // // Verificación de seguridad
          // if (blob.size < 1) {
          //   throw new Error("Imagen generada vacía");
          // }

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
            // Si el navegador no permite compartir archivos, solo mandamos el link de texto
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
          setPrintMode(null); // Limpiamos el estado
        }
      }, 800); // Subimos a 800ms para darle tiempo al celu
    } else {
      setPrintMode(mode);
      setShowPrintModal(false);
      setTimeout(() => {
        if (printRef.current && orderToPrint) {
          print(printRef.current.innerHTML);
        }
        setPrintMode(null);
      }, 300);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    // 1. Pre-procesamos el filtro y el término de búsqueda
    const currentFilter = simplifiedFilters.find(
      (f) => f.label === activeFilter,
    );
    const term = searchTerm.toLowerCase().trim();

    return orders
      .filter((order) => {
        // --- Hilo de Búsqueda ---
        const matchesSearch =
          !term ||
          (order.id || order.idTemp || "").toLowerCase().includes(term) ||
          (order.customerName || "").toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // --- Hilo de Filtrado por Tab (BCA) ---
        // Si no hay filtro o es "Todos", pasa directo
        if (!currentFilter || activeFilter === "Todos") return true;

        // Aplicamos la lógica de condición definida en simplifiedFilters
        return currentFilter.condition({
          id: order.id || order.idTemp,
          customerName: order.customerName,
          deliveryType: order.deliveryType as DeliveryType,
          createdAt: String(order.createdAt),
          orderPaymentMethod: order.orderPaymentMethod as PaymentMethodType,
          status: order.status as OrderStatus,
          deliveryStatus: order.deliveryStatus as DeliveryStatus,
          paymentStatus: order.paymentStatus as PaymentStatus,
          origin: order.origin,
          total: order.total,
          shortCode: order.shortCode || "",
          userId: "", // No lo usamos en las condiciones actuales, pero lo dejamos por si se necesita en el futuro
        });
      })
      .sort((a, b) => {
        // --- Hilo de Prioridad (Soberanía del Negocio) ---
        // Usamos la lógica de getOrderPriority que ya contempla fallos logísticos y pagos
        const priorityA = getOrderPriority(a as any);
        const priorityB = getOrderPriority(b as any);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // --- Hilo Cronológico (FIFO) ---
        // A igual prioridad, el pedido más antiguo va primero para no retrasar la cocina
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [orders, activeFilter, searchTerm]); // simplifiedFilters es constante, no hace falta en dependencias
  if (isLoading) return <p>Sincronizando con Nezon...</p>;

  return (
    <>
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* CAPTURA OCULTA */}
      <div
        style={{
          position: "absolute",
          left: "-9999px", // Lo mandamos "a la China" para que no se vea
          top: "0",
          visibility: "visible", // El navegador lo procesa normalmente
          opacity: 0, // Es totalmente transparente
          pointerEvents: "none", // Evita que alguien haga click accidentalmente en el aire
        }}
      >
        <div ref={printRef}>
          {orderToPrint && printMode && (
            <OrderTicket order={orderToPrint} mode={printMode} />
          )}
        </div>
      </div>

      <button onClick={() => setIsNewOrder(!isNewOrder)}>Nueva orden</button>
      <PrintSelectorModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onSelect={executePrint}
      />

      <header className="bg-white border-b shadow-sm z-30">
        <div className="p-4 max-w-7xl mx-auto w-full space-y-3">
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            Panel de Órdenes
          </h1>

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
            orders={
              (orders.map((order) => ({
                createdAt: String(order.createdAt),
                customerName: order.customerName,
                deliveryType: order.deliveryType as DeliveryType,
                id: order.id || order.idTemp,
                orderPaymentMethod:
                  order.orderPaymentMethod as PaymentMethodType,
                status: order.status as OrderStatus,
                total: order.total,
                userId: "",
              })) || []) as IOrderShortDto[]
            }
          />
        </div>
      </header>

      <div>
        <SyncIndicator />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full pb-20">
          <div className="hidden md:grid grid-cols-[100px_1fr_150px_140px_140px_120px] px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400 border-b bg-white sticky top-0 z-10">
            <span>Pedido</span>
            <span>Cliente</span>
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
                  key={order.id || order.idTemp}
                  order={{
                    customerName: order.customerName,
                    deliveryType: order.deliveryType as DeliveryType,
                    id: order.id || order.idTemp,
                    orderPaymentMethod:
                      order.orderPaymentMethod as PaymentMethodType,
                    status: order.status as OrderStatus,
                    total: order.total,
                    userId: "",
                    createdAt: String(order.createdAt),
                    origin: order.origin,
                    paymentStatus: order.paymentStatus,
                    deliveryStatus: order.deliveryStatus,
                    shortCode: order.shortCode || "",
                  }}
                  onClick={() => setSelectedOrderId(order.id || order.idTemp)}
                  onPrintDirect={handlePrintRequest}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {selectedOrderId && (
        <OrderDetailsSidePanel
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

    </div>
      {isNewOrder && (
        <OrderBuilder onClose={() => setIsNewOrder(!isNewOrder)} businessid={businessId} />
      )}
    
    </>
  );
}
