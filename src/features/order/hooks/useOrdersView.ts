"use client";

import { db } from "@/mini-back/infrastructure/dexie/db";
import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";
import { OrderStatus } from "@/types/order-state-machine"; // Ajusta la importación según tus enums
import { useLiveQuery } from "dexie-react-hooks";

// Definimos los estados que se consideran "En Proceso" o "No Finalizados"
const ACTIVE_ORDER_STATUSES: string[] = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];

export function useOrdersView(businessId: string) {
  const result = useLiveQuery(async () => {
    if (!businessId) {
      return { activeTurn: null, orders: [] };
    }

    // 1. Obtener el turno activo si existe
    const activeTurn = await db.cashRegisterTurn
      .where("[businessId+status]")
      .equals([businessId, CashRegisterStatus.OPEN])
      .first();

    const activeTurnId = activeTurn?.clientTurnId;

    // 2. Traer órdenes que cumplan CUALQUIERA de las dos condiciones:
    //    a) Pertenecen al turno activo actual
    //    b) Su estado sigue en proceso (sin importar de qué turno vino)
    const orders = await db.orders
      .where("businessId")
      .equals(businessId)
      .filter((order) => {
        const isFromCurrentTurn = activeTurnId && order.cashRegisterTurnIdTemp === activeTurnId;
        const isOrderActiveInProcess = ACTIVE_ORDER_STATUSES.includes(order.status);

        return Boolean(isFromCurrentTurn || isOrderActiveInProcess);
      })
      .reverse()
      .toArray();
    
      console.log(`ordenes totales`, orders.length)

    // 3. Ordenar opcionalmente por fecha de creación (más recientes primero)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      activeTurn,
      orders,
    };
  }, [businessId]);

  const orders = result?.orders ?? [];
  const activeTurn = result?.activeTurn ?? null;

  return {
    orders,
    activeTurn,
    hasActiveTurn: activeTurn !== null,
    isLoading: result === undefined,
    isEmpty: result !== undefined && orders.length === 0,
  };
}