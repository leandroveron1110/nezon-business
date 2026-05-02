// src/features/orders/hooks/useGetOrderById.ts
import { useLiveQuery } from "dexie-react-hooks";
import { UIOrder } from "../types/ui-order";
import { OrderUiMapper } from "@/features/common/database/mappers/order-ui.mapper";
import { db } from "@/features/common/database";

export function useGetOrderById(orderId: string) {
  const order = useLiveQuery(
    async (): Promise<UIOrder | null> => {
      // Buscamos por id de postgres o por id temporal
      const local = await db.orders
        .where('id').equals(orderId)
        .or('idTemp').equals(orderId)
        .first();

      if (!local) return null;

      return OrderUiMapper.toUI(local);
    },
    [orderId]
  );

  return {
    order,
    isLoading: order === undefined,
  };
}