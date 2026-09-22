import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/mini-back/infrastructure/dexie/db";

import { FinancialMovementType } from "@/mini-back/shared/enums/financial-movement-status.enum";

import { TreasuryMovement } from "../components/TreasuryMovements";
import { LocalFinancialMovement } from "@/mini-back/infrastructure/dexie/shcema/financial-movement.schema";

export function useTreasuryMovements(businessId: string) {
  const movements = useLiveQuery(async (): Promise<TreasuryMovement[]> => {
    if (!businessId) return [];

    // ---------------------------------------------------------
    // MOVIMIENTOS
    // ---------------------------------------------------------

    const rawMovements = await db.financialMovement
      .where("businessId")
      .equals(businessId)
      .filter(
        (movement) =>
          movement.type === FinancialMovementType.INCOME ||
          movement.type === FinancialMovementType.EXPENSE ||
          movement.type === FinancialMovementType.INTERNAL_TRANSFER_IN ||
          movement.type === FinancialMovementType.INTERNAL_TRANSFER_OUT,
      )
      .toArray();

    // ---------------------------------------------------------
    // CUENTAS
    // ---------------------------------------------------------

    const accounts = await db.treasuryAccount
      .where("businessId")
      .equals(businessId)
      .toArray();

    const accountsMap = new Map(
      accounts.map((account) => [account.idTemp, account.name]),
    );

    // ---------------------------------------------------------
    // TRANSFERENCIAS
    // ---------------------------------------------------------

    const transfersMap = new Map<string, LocalFinancialMovement[]>();

    for (const movement of rawMovements) {
      if (!movement.transferGroupId) continue;

      const group = transfersMap.get(movement.transferGroupId);

      if (group) {
        group.push(movement);
      } else {
        transfersMap.set(movement.transferGroupId, [movement]);
      }
    }

    // ---------------------------------------------------------
    // TRANSFORMACIÓN
    // ---------------------------------------------------------

    const result: TreasuryMovement[] = rawMovements.map(
      (movement: LocalFinancialMovement) => {
        const accountName =
          accountsMap.get(movement.treasuryAccountIdTemp ?? "") ??
          "Cuenta desconocida";

        // ---------------------------------------------------
        // TRANSFERENCIA SALIENTE
        // ---------------------------------------------------

        if (movement.type === FinancialMovementType.INTERNAL_TRANSFER_OUT) {
          const destinationMovement = movement.transferGroupId
            ? transfersMap
                .get(movement.transferGroupId)
                ?.find(
                  (m) =>
                    m.type === FinancialMovementType.INTERNAL_TRANSFER_IN &&
                    m.idTemp !== movement.idTemp,
                )
            : undefined;

          const destinationName = destinationMovement
            ? (accountsMap.get(
                destinationMovement.treasuryAccountIdTemp ?? "",
              ) ?? "Cuenta desconocida")
            : "Cuenta desconocida";

          return {
            idTemp: movement.idTemp,
            type: movement.type,
            amount: movement.amount,

            description: `Transferencia a ${destinationName}`,

            notes: movement.notes,

            treasuryAccountName: accountName,

            createdAt: movement.date,
          };
        }

        // ---------------------------------------------------
        // TRANSFERENCIA ENTRANTE
        // ---------------------------------------------------

        if (movement.type === FinancialMovementType.INTERNAL_TRANSFER_IN) {
          const sourceMovement = movement.transferGroupId
            ? transfersMap
                .get(movement.transferGroupId)
                ?.find(
                  (m) =>
                    m.type === FinancialMovementType.INTERNAL_TRANSFER_OUT &&
                    m.idTemp !== movement.idTemp,
                )
            : undefined;

          const sourceName = sourceMovement
            ? (accountsMap.get(sourceMovement.treasuryAccountIdTemp ?? "") ??
              "Cuenta desconocida")
            : "Cuenta desconocida";

          return {
            idTemp: movement.idTemp,
            type: movement.type,
            amount: movement.amount,

            description: `Transferencia desde ${sourceName}`,

            notes: movement.notes,

            treasuryAccountName: accountName,

            createdAt: movement.date,
          };
        }

        // ---------------------------------------------------
        // INGRESO / EGRESO NORMAL
        // ---------------------------------------------------

        return {
          idTemp: movement.idTemp,

          type: movement.type,

          amount: movement.amount,

          description: movement.description,

          notes: movement.notes,

          treasuryAccountName: accountName,

          createdAt: movement.date,
        };
      },
    );

    // ---------------------------------------------------------
    // ORDEN
    // ---------------------------------------------------------

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return result;
  }, [businessId]);

  return {
    movements: movements ?? [],
    isLoading: movements === undefined,
  };
}
