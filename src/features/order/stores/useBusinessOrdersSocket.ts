import { useEffect } from "react";
import { useBusinessSocket } from "@/features/common/hooks/useBusinessSocket";
import { useGlobalBusinessOrdersStore } from "@/lib/stores/orderStoreGlobal";
import { IOrderShortDto } from "@/types/order";

export function useBusinessOrdersSocket(businessId: string) {
  const socket = useBusinessSocket(businessId);
  const addOrder = useGlobalBusinessOrdersStore((s) => s.addOrUpdateOrder);
  const updateOrderStatus = useGlobalBusinessOrdersStore(
    (s) => s.updateOrderStatus
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("new_order", (order: IOrderShortDto) => {
      addOrder(businessId, order);
    });

    socket.on("order_status_updated", (data) => {
      updateOrderStatus(businessId, data.orderId, data.status);
    });

    return () => {
      socket.off("new_order");
      socket.off("order_status_updated");
    };
  }, [addOrder, updateOrderStatus, socket]);
}
