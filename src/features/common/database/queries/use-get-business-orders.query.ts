import { useLiveQuery } from "dexie-react-hooks";
import { db } from "..";

/**
 * Query reactiva para listar órdenes.
 * Separa la data de la DB de lo que necesita el componente.
 */
export function useGetBusinessOrders(businessId: string) {
  return useLiveQuery(
    async () => {
      const orders = await db.orders
        .orderBy('createdAt')
        .reverse()
        .toArray();
      
      // Aquí podrías filtrar por businessId si tuvieras más de uno
      return orders; 
    },
    [businessId]
  );
}