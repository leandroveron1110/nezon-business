// @/mini-front/modules/cash-register/hooks/useCashRegister.ts

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/mini-back/infrastructure/dexie/db";
import { cashRegisterOrchestrator } from "@/mini-back/orchestrator/cash-register.orchestrator";
import { CashRegisterTotals } from "@/mini-back/core/cash-register-core/public";

export function useCashRegister(businessId: string) {
  // 1. Escuchar el turno activo en Dexie
  const activeTurn = useLiveQuery(async () => {
    if (!businessId) return null;
    return await db.cashRegisterTurn
      .where("[businessId+status]")
      .equals([businessId, "OPEN"])
      .first();
  }, [businessId]);

  const turnIdTemp = activeTurn?.clientTurnId || activeTurn?.id;

  // 2. Escuchar los movimientos de Dexie
  const movements = useLiveQuery(async () => {
    if (!turnIdTemp) return [];
    return await db.financialMovement
      .where("cashRegisterTurnIdTemp")
      .equals(turnIdTemp)
      .sortBy("sequence");
  }, [turnIdTemp]);

  // 3. Totales calculados por el Core
  const totals = useLiveQuery(async (): Promise<CashRegisterTotals> => {
    // 💡 Guard: Si no hay turno activo, retornamos ceros de inmediato sin consultar al Core
    if (!businessId || !activeTurn) {
      return { cash: 0, card: 0, transfer: 0, total: 0 };
    }

    return await cashRegisterOrchestrator.getActiveTurnTotals(businessId);
  }, [businessId, activeTurn?.id, movements]);

  const defaultTotals: CashRegisterTotals = {
    cash: 0,
    card: 0,
    transfer: 0,
    total: 0,
  };

  return {
    activeTurn,
    movements: movements || [],
    totals: totals ?? defaultTotals,
    // 💡 Si no hay turno activo (activeTurn === null), no nos quedamos esperando 'movements' o 'totals'
    isLoading:
      activeTurn === undefined ||
      (activeTurn !== null &&
        (movements === undefined || totals === undefined)),
  };
}
