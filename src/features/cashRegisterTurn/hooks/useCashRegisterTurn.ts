// @/mini-front/modules/cash-register/hooks/useCashRegisterTurn.ts

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/mini-back/infrastructure/dexie/db";
import { FinancialMovementType } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { financialMovementOrchestrator } from "@/mini-back/orchestrator/financial-movement-orchestrator";
import { CashRegisterTurnTotals } from "@/mini-back/core/cash-register-core/public";

export function useCashRegisterTurn(businessId: string) {
  // ---------------------------------------------------------
  // 1. TURNO ACTIVO
  // ---------------------------------------------------------

  const activeTurn = useLiveQuery(async () => {
    if (!businessId) return null;

    return await db.cashRegisterTurn
      .where("[businessId+status]")
      .equals([businessId, "OPEN"])
      .first();
  }, [businessId]);

  const turnIdTemp = activeTurn?.idTemp;
  const treasuryAccountIdTemp = activeTurn?.treasuryAccountIdTemp;

  // ---------------------------------------------------------
  // 2. MOVIMIENTOS DEL TURNO
  // ---------------------------------------------------------
  //
  // El turno debe mostrar:
  //
  // A) movimientos generados desde el propio turno
  //
  // B) movimientos externos de Tesorería que afectan
  //    la misma cuenta de tesorería del turno.
  //
  // Ejemplo:
  //
  // Caja Mostrador
  //    Turno #2
  //       |
  //       └── Caja Principal (CASH)
  //
  // Si Tesorería retira $50.000 de Caja Principal,
  // ese movimiento también pertenece al contexto
  // financiero del turno.
  //
  // ---------------------------------------------------------

  const movements = useLiveQuery(async () => {
    if (!turnIdTemp || !treasuryAccountIdTemp) {
      return [];
    }

    const rawMovements = await db.financialMovement
      .where("businessId")
      .equals(businessId)
      .filter((movement) => {

        const isInternalAccounting =
          movement.type === FinancialMovementType.COGS ||
          movement.type === FinancialMovementType.MERMAS;

        if (isInternalAccounting) {
          return false;
        }

        const belongsToCurrentTurn =
          movement.cashRegisterTurnIdTemp === turnIdTemp;

        // -----------------------------------------------------
        // B) Movimiento de Tesorería que afecta la cuenta
        //    asociada al turno.
        //
        // No exigimos cashRegisterTurnIdTemp porque
        // Tesorería puede crear movimientos sin pertenecer
        // a ningún turno.
        // -----------------------------------------------------

        const affectsCurrentTreasuryAccount =
          movement.treasuryAccountIdTemp === treasuryAccountIdTemp;

        return belongsToCurrentTurn || affectsCurrentTreasuryAccount;
      })
      .sortBy("sequence");

    return rawMovements;
  }, [businessId, turnIdTemp, treasuryAccountIdTemp]);

  // ---------------------------------------------------------
  // 3. TOTALES DEL TURNO
  // ---------------------------------------------------------

  const totals = useLiveQuery(async (): Promise<CashRegisterTurnTotals> => {
    if (!businessId || !activeTurn) {
      return {
        cash: 0,
        card: 0,
        transfer: 0,
        total: 0,
      };
    }

    return await financialMovementOrchestrator.getActiveTurnTotals(
      activeTurn.idTemp,
    );
  }, [businessId, activeTurn?.idTemp, movements]);

  // ---------------------------------------------------------
  // 4. DEFAULTS
  // ---------------------------------------------------------

  const defaultTotals: CashRegisterTurnTotals = {
    cash: 0,
    card: 0,
    transfer: 0,
    total: 0,
  };

  // ---------------------------------------------------------
  // 5. RETURN
  // ---------------------------------------------------------

  return {
    activeTurn,

    movements: movements || [],

    totals: totals ?? defaultTotals,

    isLoading:
      activeTurn === undefined ||
      (activeTurn !== null &&
        (movements === undefined || totals === undefined)),
  };
}
