"use client";

import { useState, useEffect, useMemo } from "react";
import { Package, Search } from "lucide-react";

import OrdersFilters from "./OrdersFilters";
import { simplifiedFilters } from "@/features/common/utils/filtersData";

import { useBusinessOrdersSocket } from "../stores/useBusinessOrdersSocket";
import { useFetchBusinessOrders } from "../stores/useFetchBusinessOrders";
import { useBusinessNotificationsStore } from "../../common/hooks/useBusinessNotificationsStore";
import { useGlobalBusinessOrdersStore } from "@/lib/stores/orderStoreGlobal";

import {
  IOrder
} from "../types/order";

import { OrderList } from "./order/OrderList";
import { OrderDetailsModal } from "./order/OrderDetailsModal";
import {
  filterOrdersByBusinessRules,
  getOrderPriority,
} from "@/features/business/utilities/order-logic";

interface Props {
  businessId: string;
}

export default function BusinessOrdersPage({ businessId }: Props) {
  const resetNotificationOrder = useBusinessNotificationsStore(
    (s) => s.clearNotificationsByType,
  );
  const rawOrders = useGlobalBusinessOrdersStore((s) =>
    s.getOrders(businessId),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  // Sockets y Fetching
  useFetchBusinessOrders(businessId);
  useBusinessOrdersSocket(businessId);

  useEffect(() => {
    if (businessId) resetNotificationOrder(businessId, "NEW_ORDER");
  }, [businessId, resetNotificationOrder]);

  const filteredAndSortedOrders = useMemo(() => {
    const orders = (rawOrders || []) as IOrder[];

    return orders
      .filter(filterOrdersByBusinessRules)
      .filter((order) => {
        // Filtro de búsqueda
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          order.id.toLowerCase().includes(term) ||
          order.user.fullName.toLowerCase().includes(term) ||
          order.user.phone?.includes(term);

        // Filtro por pestañas (SimplifiedFilters)
        const currentFilter = simplifiedFilters.find(
          (f) => f.label === activeFilter,
        );
        const matchesTab =
          !currentFilter || activeFilter === "Todos"
            ? true
            : currentFilter.condition
              ? currentFilter.condition(order)
              : currentFilter.statuses.includes(order.status);

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        const p = getOrderPriority(a) - getOrderPriority(b);
        if (p !== 0) return p;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [rawOrders, activeFilter, searchTerm]);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* HEADER BUSCADOR + FILTROS */}
      <header className="bg-white border-b shadow-sm z-30">
        <div className="p-4 max-w-7xl mx-auto w-full space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <OrdersFilters
            quickFilters={simplifiedFilters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            orders={(rawOrders || []) as IOrder[]} // Agregamos el fallback []
          />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full pb-20">
          {/* HEADER TABLA DESKTOP */}
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
                <p>No se encontraron pedidos</p>
              </div>
            ) : (
              filteredAndSortedOrders.map((order) => (
                <OrderList
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
