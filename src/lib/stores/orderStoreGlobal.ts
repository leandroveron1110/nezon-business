import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { 
  IOrderShortDto, 
  OrderStatus 
} from "@/types/order";

type OrdersByBusiness = Record<string, IOrderShortDto[] | undefined>;
type LastSyncTimes = Record<string, string | undefined>;

interface GlobalOrdersState {
  businessOrders: OrdersByBusiness;
  lastSyncTimes: LastSyncTimes;

  // Acciones
  getOrders: (businessId: string) => IOrderShortDto[] | undefined;
  getLastSyncTime: (businessId: string) => string | undefined;
  
  // Sincronización masiva
  setOrdersForBusiness: (
    businessId: string, 
    orders: IOrderShortDto[], 
    syncTime: string
  ) => void;

  // Actualizaciones granulares (Sockets / Sincronización incremental)
  addOrUpdateOrder: (businessId: string, order: IOrderShortDto) => void;
  updateOrderStatus: (
    businessId: string, 
    orderId: string, 
    status: OrderStatus
  ) => void;
  
  reset: () => void;
}

export const useGlobalBusinessOrdersStore = create<GlobalOrdersState>()(
  immer((set, get) => ({
    businessOrders: {},
    lastSyncTimes: {},

    getLastSyncTime: (businessId) => get().lastSyncTimes[businessId],
    getOrders: (businessId) => get().businessOrders[businessId],

    setOrdersForBusiness: (businessId, orders, syncTime) => {
      set((state) => {
        state.businessOrders[businessId] = orders;
        state.lastSyncTimes[businessId] = syncTime;
      });
    },

    // Unificamos add y update para manejar lógica incremental de forma más sencilla
    addOrUpdateOrder: (businessId, incomingOrder) => {
      set((state) => {
        if (!state.businessOrders[businessId]) {
          state.businessOrders[businessId] = [incomingOrder];
          return;
        }

        const orders = state.businessOrders[businessId]!;
        const index = orders.findIndex((o) => o.id === incomingOrder.id);

        if (index !== -1) {
          // Si ya existe, actualizamos los campos que el DTO permite
          orders[index] = { ...orders[index], ...incomingOrder };
        } else {
          // Si es nueva, va al principio (LIFO)
          orders.unshift(incomingOrder);
        }
      });
    },

    updateOrderStatus: (businessId, orderId, status) => {
      set((state) => {
        const order = state.businessOrders[businessId]?.find((o) => o.id === orderId);
        if (order) {
          order.status = status;
        }
      });
    },

    reset: () => {
      set((state) => {
        state.businessOrders = {};
        state.lastSyncTimes = {};
      });
    },
  }))
);