// @/features/cash-register/hooks/useCashRegisterStatus.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/mini-back/infrastructure/dexie/db";

export function useCashRegisterStatus(businessId: string) {
  // Expresión directa: Dexie retorna el objeto si existe, undefined/null si no hay coincidencias
  const activeTurn = useLiveQuery(
    async () => {
      const turn = await db.cashRegisterTurn
        .where({ businessId, status: "OPEN" })
        .first();
      return turn ?? null; // Retornamos null explícito si no hay turno
    },
    [businessId]
  );

  // Carga inicial: Solo es verdadero antes del primer tick de Dexie
  const isLoading = activeTurn === undefined;

  return {
    isOpen: Boolean(activeTurn),
    activeTurn: activeTurn ?? null,
    isLoading,
  };
}