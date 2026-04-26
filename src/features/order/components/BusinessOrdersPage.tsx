"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Package, Search, LayoutGrid } from "lucide-react";

import OrdersFilters from "./OrdersFilters";
import { simplifiedFilters } from "@/features/common/utils/filtersData";

import { useBusinessOrdersSocket } from "../stores/useBusinessOrdersSocket";
import { useFetchBusinessOrders } from "../stores/useFetchBusinessOrders";
import { useBusinessNotificationsStore } from "../../common/hooks/useBusinessNotificationsStore";
import { useGlobalBusinessOrdersStore } from "@/lib/stores/orderStoreGlobal";

import { IOrderShortDto } from "@/types/order";
import { OrderList } from "./order/OrderList";
import { OrderDetailsModal } from "./order/OrderDetailsModal";
import { getOrderPriority } from "@/features/order/utilities/order-logic";
import { OrderFilterHeader } from "./order/OrderFilterHeader";
import { IOrder } from "../types/order";
import { fetchOrderById } from "../api/catalog-api";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { OrderTicket } from "./order/OrderTicket";
import { PrintSelectorModal } from "./order/PrintSelectorModal";
import { usePrintTicket } from "../hooks/usePrintTicket";

interface Props {
  businessId: string;
}

export default function BusinessOrdersPage({ businessId }: Props) {
  const { addAlert } = useAlert();
  
  // Referencia para el contenedor oculto del ticket
  const { print } = usePrintTicket();
  const printRef = useRef<HTMLDivElement>(null);

  const rawOrders = useGlobalBusinessOrdersStore((s) => s.getOrders(businessId));
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [daysRange, setDaysRange] = useState<number | null>(1);
  const [specificDate, setSpecificDate] = useState<string | null>(null);

  // --- ESTADOS DE IMPRESIÓN ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<IOrder | null>(null);
  const [printMode, setPrintMode] = useState<"KITCHEN" | "CUSTOMER" | null>(null);

  // 1. Inicia el proceso buscando la orden completa
const handlePrintRequest = async (id: string) => {
    try {
      const fullOrder = await fetchOrderById(id);
      setOrderToPrint(fullOrder);
      setShowPrintModal(true);
    } catch (error) {
      addAlert({ message: "Error al cargar orden", type: "error" });
    }
  };

  // 2. Ejecuta la impresión vía iframe
const executePrint = (mode: "KITCHEN" | "CUSTOMER") => {
    setPrintMode(mode);
    setShowPrintModal(false);
    setTimeout(() => {
      if (printRef.current && orderToPrint) {
        print(printRef.current.innerHTML);
      }
      setPrintMode(null);
    }, 300);
  };

  // ... (Resto de lógica de sockets y filtrado igual)
  useFetchBusinessOrders(businessId, daysRange, specificDate);
  useBusinessOrdersSocket(businessId);
  const resetNotificationOrder = useBusinessNotificationsStore((s) => s.clearNotificationsByType);

  useEffect(() => {
    if (businessId) resetNotificationOrder(businessId, "NEW_ORDER");
  }, [businessId, resetNotificationOrder]);

  const filteredAndSortedOrders = useMemo(() => {
    const orders = (rawOrders || []) as IOrderShortDto[];
    return orders
      .filter((order) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || order.id.toLowerCase().includes(term) || order.customerName.toLowerCase().includes(term);
        const currentFilter = simplifiedFilters.find((f) => f.label === activeFilter);
        const matchesTab = !currentFilter || activeFilter === "Todos" ? true : currentFilter.condition ? currentFilter.condition(order) : currentFilter.statuses.includes(order.status);
        return matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        const priorityA = getOrderPriority(a);
        const priorityB = getOrderPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rawOrders, activeFilter, searchTerm]);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      
{/* CAPTURA OCULTA */}
      <div className="hidden">
        <div ref={printRef}>
          {orderToPrint && printMode && <OrderTicket order={orderToPrint} mode={printMode} />}
        </div>
      </div>

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

          <OrderFilterHeader
            daysRange={daysRange}
            selectedDate={specificDate}
            onRangeChange={(d) => { setSpecificDate(null); setDaysRange(d); }}
            onDateChange={(date) => { setDaysRange(null); setSpecificDate(date); }}
          />

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
            orders={(rawOrders || []) as IOrderShortDto[]}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full pb-20">
          <div className="hidden md:grid grid-cols-[100px_1fr_150px_140px_140px_120px] px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400 border-b bg-white sticky top-0 z-10">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Estado</span>
            <span>Entrega</span>
            <span>Pago</span>
            <span className="text-right">Total</span>
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
                  onClick={() => setSelectedOrderId(order.id)}
                  onPrintDirect={handlePrintRequest}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}